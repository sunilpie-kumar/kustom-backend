import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import { sendResponse } from '../utils/responseFunction.js';

// Verify JWT token and attach user/provider to request
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return sendResponse(res, 401, false, 'Access token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if it's a user token
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return sendResponse(res, 401, false, 'Invalid token - user not found');
      }
      req.user = { userId: user._id, email: user.email, type: 'user' };
    }
    // Check if it's a provider token
    else if (decoded.providerId) {
      const provider = await Provider.findById(decoded.providerId).select('-password');
      if (!provider) {
        return sendResponse(res, 401, false, 'Invalid token - provider not found');
      }
      req.user = { providerId: provider._id, email: provider.email, type: 'provider' };
    }
    else {
      return sendResponse(res, 401, false, 'Invalid token format');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, false, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, 401, false, 'Token expired');
    }
    next(error);
  }
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = { userId: user._id, email: user.email, type: 'user' };
      }
    }
    else if (decoded.providerId) {
      const provider = await Provider.findById(decoded.providerId).select('-password');
      if (provider) {
        req.user = { providerId: provider._id, email: provider.email, type: 'provider' };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Require user authentication
export const requireUser = (req, res, next) => {
  if (!req.user || req.user.type !== 'user') {
    return sendResponse(res, 403, false, 'User authentication required');
  }
  next();
};

// Require provider authentication
export const requireProvider = (req, res, next) => {
  if (!req.user || req.user.type !== 'provider') {
    return sendResponse(res, 403, false, 'Provider authentication required');
  }
  next();
};

// Require either user or provider authentication
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return sendResponse(res, 403, false, 'Authentication required');
  }
  next();
};

// Rate limiting middleware (basic implementation)
export const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, userRequests);
    } else {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);
    
    if (userRequests.length >= max) {
      return sendResponse(res, 429, false, 'Too many requests, please try again later');
    }

    userRequests.push(now);
    next();
  };
}; 