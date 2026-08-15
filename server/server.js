require("dotenv").config();

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'TaskMaster MERN Stack API is running successfully',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
    },
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.message || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID format';
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'An account with this email already exists';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
