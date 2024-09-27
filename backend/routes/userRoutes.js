const express = require('express');
const { registerUser } = require('../controllers/userController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', requireAuth, registerUser);

module.exports = router;