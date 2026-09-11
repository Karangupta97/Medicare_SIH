import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate limiter for AI analysis endpoint
 * Prevents mass attacks on the Gemini API
 * 
 * Configuration:
 * - 10 requests per 15 minutes per user (authenticated by JWT)
 * - Uses user ID from JWT token for per-user tracking
 */
export const analyzeReportRateLimit = rateLimit({
  // 15 minutes window
  windowMs: 15 * 60 * 1000,
  
  // 10 requests per window per user
  max: 10,
  
  // Custom key generator to track by user ID instead of IP
  keyGenerator: (req, res) => {
    // Use user ID from verified JWT token
    return req.user?.id || ipKeyGenerator(req, res);
  },
  
  // Custom response when rate limit is exceeded
  handler: (req, res) => {
    const retryAfter = Math.ceil(req.rateLimit.resetTime / 1000 / 60); // minutes
    console.warn(
      `[Rate Limit] User ${req.user?.id} exceeded AI analysis limit. Retry after ${retryAfter} minutes`
    );
    
    return res.status(429).json({
      success: false,
      message: `Too many analysis requests. Please try again in ${retryAfter} minute${retryAfter > 1 ? 's' : ''}.`,
      retryAfter: retryAfter,
    });
  },
  
  // Skip successful requests from being counted
  skip: (req, res) => {
    // Count all requests - don't skip any
    return false;
  },
  
  // Custom message in header
  message: 'Too many AI analysis requests from this account',
});

/**
 * Stricter rate limiter for demo/abuse prevention
 * 5 requests per 60 minutes per user
 * Can be used as an alternative for production
 */
export const analyzeReportRateLimitStrict = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req, res) => {
    return req.user?.id || ipKeyGenerator(req, res);
  },
  handler: (req, res) => {
    const retryAfter = Math.ceil(req.rateLimit.resetTime / 1000 / 60);
    console.warn(
      `[Rate Limit Strict] User ${req.user?.id} exceeded AI analysis limit. Retry after ${retryAfter} minutes`
    );
    
    return res.status(429).json({
      success: false,
      message: `Too many analysis requests (daily limit). Please try again in ${retryAfter} minute${retryAfter > 1 ? 's' : ''}.`,
      retryAfter: retryAfter,
    });
  },
  message: 'Daily AI analysis limit exceeded',
});

/**
 * Global rate limiter for unauthenticated requests
 * Prevents IP-based abuse before authentication
 */
export const globalAIRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: ipKeyGenerator,
  handler: (req, res) => {
    console.warn(`[Rate Limit Global] IP ${req.ip} exceeded global AI analysis limit`);
    
    return res.status(429).json({
      success: false,
      message: 'Too many requests from your IP address. Please try again later.',
    });
  },
  skip: (req, res) => {
    // Only apply if user is not authenticated
    return req.user && req.user.id;
  },
  message: 'Too many requests from this IP address',
});
