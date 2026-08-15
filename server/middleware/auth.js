const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Read JWT from Authorization header ("Bearer <token>")
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token string
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify JWT signature
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production_123!'
      );

      // 3. Find authenticated user by decoded token ID (exclude password field)
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed: User no longer exists',
        });
      }

      // Proceed to protected route
      return next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired token',
      });
    }
  }

  // Handle missing token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided',
    });
  }
};

module.exports = { protect };
