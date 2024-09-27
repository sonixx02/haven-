const User = require('../models/users');

// Register user in MongoDB
exports.registerUser = async (req, res) => {
  const { uid, email, firstName, lastName, photo, provider } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ uid });
    if (user) {
      return res.status(200).json({ message: "User already exists", user });
    }

    // Create new user in MongoDB
    user = new User({
      uid,
      email,
      firstName,
      lastName,
      photo,
      provider,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
exports.getUserByUID = async (req, res) => {
  try {
    const { uid } = req.params;
    console.log("Received UID:", uid); // Check if UID is received

    const user = await User.findOne({ uid });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("Found User:", user); // Log the user object
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error); // Log any errors
    return res.status(500).json({ message: error.message });
  }
};
