const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const { 
  authLimiter, 
  meLimiter, 
  apiLimiter,
  displayNameCheckLimiter 
} = require('./middleware/rateLimiter');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173', // Local dev
  process.env.FRONTEND_URL, // Production URL from env var
  'https://planning-project-dwvlflgw3-akshays-projects-cc44e273.vercel.app' // Hardcoded production URL as a fallback
].filter(Boolean); // Filter out falsy values like undefined

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Add a logger for avatar requests
app.use('/api/uploads', (req, res, next) => {
  console.log(`[STATIC FILE] Request received for: ${req.originalUrl}`);
  next();
});

// Serve static files for avatars with the correct headers
app.use('/api/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  setHeaders: (res, path, stat) => {
    // Explicitly set CORS headers for avatar images
    res.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Serve static files from the 'public' directory
app.use('/api/images', express.static(path.join(__dirname, '../../public/images')));

// Apply rate limiting
app.use('/api/auth/check-displayname', displayNameCheckLimiter); // Lenient limiter for this specific route
app.use('/api/auth/me', meLimiter); // Special limiter for /me endpoint
app.use('/api/auth', authLimiter); // Stricter limits for other auth routes
app.use('/api', apiLimiter); // General limits for all other API routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start server
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
}); 