const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);