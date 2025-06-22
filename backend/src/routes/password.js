const express = require('express');
const router = express.Router();
const { changePassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.patch('/change', auth, changePassword);

module.exports = router; 