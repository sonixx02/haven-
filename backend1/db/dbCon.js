const mongoose = require('mongoose');

const dbcon = async () => {
  try {
    const uri = process.env.MONGO_URL;
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = dbconn;