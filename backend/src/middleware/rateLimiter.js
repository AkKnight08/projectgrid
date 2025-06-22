const rateLimit = require('express-rate-limit');

// Create a limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per windowMs (increased from 5 for testing)
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a limiter for the /me endpoint
const meLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests to /me endpoint, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a limiter for the display name check endpoint
const displayNameCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 45, // 45 requests per minute, allowing for reasonably fast typing
  message: 'Too many display name checks, please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  meLimiter,
  apiLimiter,
  displayNameCheckLimiter,
}; 