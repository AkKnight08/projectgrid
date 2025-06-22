const express = require('express');
const { put } = require('@vercel/blob');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.post('/avatar', auth, async (req, res) => {
  if (!req.body || !req.body.contents) {
    return res.status(400).json({ message: 'File contents are missing.' });
  }

  const filename = `avatars/${req.user._id}-${Date.now()}.png`;

  try {
    // The body needs to be a buffer
    const buffer = Buffer.from(req.body.contents, 'base64');
    
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png',
    });

    // Update the user's avatar URL in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.avatar = blob.url;
    await user.save();
    
    return res.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ message: 'Error uploading file.', error: error.message });
  }
});

module.exports = router; 