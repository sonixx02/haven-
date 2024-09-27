const express = require('express');
const { registerUser } = require('../controllers/userController');
const router = express.Router();
const { getUserByUID } = require('../controllers/userController');

// POST: Register a new user
router.post('/register', registerUser);
router.get("/:uid", getUserByUID);

module.exports = router;
