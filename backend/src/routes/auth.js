const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { register, login, getMe, verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Setup for Avatar Uploads ---
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'avatars');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    if (filetypes.test(file.mimetype) && filetypes.test(path.extname(file.originalname).toLowerCase())) {
      return cb(null, true);
    }
    cb(new Error('File upload only supports JPEG, PNG, and GIF'));
  }
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
], login);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   GET api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', verifyEmail);

// @route   POST api/auth/resend-verification
// @desc    Resend email verification token
// @access  Public
router.post('/resend-verification', resendVerificationEmail);

// Update user settings
router.patch('/settings', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'settings.theme',
      'settings.language',
      'settings.notifications',
      'settings.itemsPerPage',
      'settings.emailNotifications',
      'settings.soundEnabled',
      'settings.autoSave'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      console.log('Invalid updates:', { updates, allowedUpdates });
      return res.status(400).json({ message: 'Invalid updates' });
    }

    // Initialize settings object if it doesn't exist
    if (!req.user.settings) {
      req.user.settings = {};
    }

    // Update settings
    updates.forEach(update => {
      const [_, setting] = update.split('.');
      req.user.settings[setting] = req.body[update];
    });

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Update user profile information
router.patch('/profile', auth, async (req, res) => {
  try {
    // Re-fetch the user document to ensure we have a full Mongoose instance
    const userToUpdate = await User.findById(req.user._id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log('=== PROFILE UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    
    const { fullName, displayName } = req.body;
    console.log('Extracted data:', { fullName, displayName });
    
    if (displayName) {
      // Final uniqueness check on save
      const existingUser = await User.findOne({ 
        displayName: { $regex: new RegExp(`^${displayName}$`, 'i') },
        _id: { $ne: userToUpdate._id } 
      });

      if (existingUser) {
        return res.status(400).json({ message: `Display name "${displayName}" is already taken.` });
      }
    }
    
    // Update name field (which corresponds to fullName in frontend)
    if (fullName !== undefined) {
      console.log('Updating name from', userToUpdate.name, 'to', fullName);
      userToUpdate.name = fullName;
    }
    
    // Update displayName field
    if (displayName !== undefined) {
      console.log('Updating displayName from', userToUpdate.displayName, 'to', displayName);
      userToUpdate.displayName = displayName;
    }

    console.log('About to save user...');
    await userToUpdate.save(); // This will now work
    console.log('User saved successfully');
    
    // Return user without password
    const userResponse = userToUpdate.toObject();
    delete userResponse.password;
    
    console.log('Sending response:', userResponse);
    
    res.json(userResponse);
  } catch (error) {
    console.error('=== PROFILE UPDATE ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Change password
router.patch('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    // Verify current password
    const isPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    req.user.password = newPassword;
    await req.user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// @route   POST /api/auth/check-displayname
// @desc    Check if a display name is available
// @access  Private
router.post('/check-displayname', auth, async (req, res) => {
  try {
    const { displayName } = req.body;
    if (!displayName) {
      return res.status(400).json({ message: 'Display name is required.' });
    }

    // Check if the display name is taken by another user (case-insensitive)
    const existingUser = await User.findOne({ 
      displayName: { $regex: new RegExp(`^${displayName}$`, 'i') },
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return res.json({ isAvailable: false, message: 'Display name is already taken.' });
    }

    res.json({ isAvailable: true, message: 'Display name is available!' });
  } catch (error) {
    console.error('Display name check error:', error);
    res.status(500).json({ message: 'Error checking display name.' });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// @route   PATCH /api/auth/avatar
// @desc    Update user avatar
// @access  Private
router.patch('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({ avatar: avatarUrl, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating avatar.', error: error.message });
  }
}, (error, req, res, next) => {
  res.status(400).json({ message: error.message });
});

module.exports = router; 