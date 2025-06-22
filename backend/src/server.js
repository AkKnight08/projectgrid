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
const uploadRoutes = require('./routes/upload');
const feedbackRoutes = require('./routes/feedback');
const passwordRoutes = require('./routes/password');

const app = express();

// --- Trust Proxy Configuration ---
// This is crucial for rate limiting and other features to work correctly behind Vercel's proxy.
app.set('trust proxy', 1);

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173', // Local dev
  /^https:\/\/planning-project.*\.vercel\.app$/, // Vercel deployment URLs (regex for preview and production)
];

// In case you set a custom domain or primary production URL in Vercel
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

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
app.use('/api/upload', uploadRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/password', passwordRoutes);

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