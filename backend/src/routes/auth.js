const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validate input
    if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      displayName,
    });

    // Save user (password will be hashed by the pre-save hook)
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received');
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Looking up user with email:', normalizedEmail);
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log('User not found:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('User found:', { id: user._id, email: user.email });

    // Validate password
    console.log('Attempting password comparison');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('Password validated successfully');

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', normalizedEmail);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Getting current user for ID:', req.user._id);
    
    // No need to find user again since auth middleware already did that
    const user = req.user;
    
    if (!user) {
      console.log('User not found in request');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', { id: user._id, email: user.email });
    
    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      settings: user.settings
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

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

module.exports = router; 