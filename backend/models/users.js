const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: String,
  lastName: String,
  photo: String,
  provider: {
    type: String,
    default: 'email', // either 'email' or 'google'
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
