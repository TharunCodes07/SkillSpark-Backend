import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

// Rate limiting configuration
export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests from this IP, please try again later.",
        details: "Rate limit exceeded",
      },
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    ...options,
  });
};

// Specific rate limiters for different endpoints
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
});

export const roadmapLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 roadmap requests per minute (as they are expensive)
});

export const playlistLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 playlist requests per minute
});

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://generativelanguage.googleapis.com",
        "https://www.googleapis.com",
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Simple input validation middleware - just basic length checks
export const validateRoadmapInput = [
  body("topic")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Topic must be between 1 and 500 characters"),
  body("userPreferences")
    .optional()
    .isObject()
    .withMessage("User preferences must be an object"),
  body("userPreferences.depth")
    .optional()
    .isIn(["Fast", "Balanced", "Detailed"])
    .withMessage("Depth must be Fast, Balanced, or Detailed"),
  body("userPreferences.videoLength")
    .optional()
    .isIn(["Short", "Medium", "Long"])
    .withMessage("Video length must be Short, Medium, or Long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: errors
            .array()
            .map((err) => `${err.path}: ${err.msg}`)
            .join(", "),
        },
      });
    }
    next();
  },
];

export const validatePlaylistInput = [
  body("topic")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Topic must be between 1 and 500 characters"),
  body("pointTitle")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Point title must be between 1 and 500 characters"),
  body("userPreferences")
    .optional()
    .isObject()
    .withMessage("User preferences must be an object"),
  body("userPreferences.depth")
    .optional()
    .isIn(["Fast", "Balanced", "Detailed"])
    .withMessage("Depth must be Fast, Balanced, or Detailed"),
  body("userPreferences.videoLength")
    .optional()
    .isIn(["Short", "Medium", "Long"])
    .withMessage("Video length must be Short, Medium, or Long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: errors
            .array()
            .map((err) => `${err.path}: ${err.msg}`)
            .join(", "),
        },
      });
    }
    next();
  },
];

// Request sanitization middleware
export const sanitizeRequest = (req, res, next) => {
  // Remove any null bytes from request body
  if (req.body) {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === "string") {
          obj[key] = obj[key].replace(/\0/g, "");
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
};
