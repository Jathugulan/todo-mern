const mongoose = require("mongoose");

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/todo-mern';

  try {
    const uriToUse = primaryUri || localUri;
    const conn = await mongoose.connect(uriToUse);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Primary MongoDB connection failed (${error.message}). Trying local fallback...`);
    try {
      if (primaryUri) {
        const conn = await mongoose.connect(localUri);
        console.log(`Local MongoDB connected successfully: ${conn.connection.host}`);
      } else {
        throw error;
      }
    } catch (fallbackError) {
      console.error(`Local MongoDB connection also failed: ${fallbackError.message}`);
      console.warn("Backend server running, but DB requests will fail until MongoDB is available.");
    }
  }
};

module.exports = connectDB;