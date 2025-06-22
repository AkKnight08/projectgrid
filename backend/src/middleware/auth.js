const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    if (!decoded.userId) {
      console.log('Invalid token format - no userId');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    console.log('Looking up user with ID:', decoded.userId);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User found:', { id: user._id, email: user.email });
    
    // Attach the full Mongoose user document to the request
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

module.exports = {
  auth,
  adminAuth,
}; 