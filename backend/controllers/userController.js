const User = require('../models/User');

const registerUser = async (req, res) => {
  try {
    const { username, name, email, phone } = req.body;
    const clerkUserId = req.auth.userId; // Get the user ID from the Clerk session

    let user = await User.findOne({ clerkUserId });

    if (user) {
      // Update existing user
      user.username = username;
      user.name = name;
      user.email = email;
      user.phone = phone;
    } else {
      // Create new user
      user = new User({ clerkUserId, username, name, email, phone });
    }

    await user.save();
    res.status(200).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { registerUser };