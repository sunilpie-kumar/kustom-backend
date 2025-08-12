import express from 'express';
import {
  checkUser,
  sendOTP,
  verifyOTP,
  userSignup,
  userLogin,
  getUserProfile,
  updateUserProfile,
} from '../controller/userController.js';
import { authenticateToken, requireUser, rateLimit } from '../middleware/auth.js';
import { sendResponse } from '../utils/responseFunction.js';

const router = express.Router();

// Public routes
router.post('/check', rateLimit(15 * 60 * 1000, 10), checkUser);
router.post('/signup', rateLimit(15 * 60 * 1000, 5), userSignup);
router.post('/login', rateLimit(15 * 60 * 1000, 10), userLogin);

// Protected routes
router.get('/', authenticateToken, requireUser, getUserProfile);
router.put('/', authenticateToken, requireUser, updateUserProfile);
router.get('/me', authenticateToken, (req, res) => {
  // Minimal me endpoint for token validation
  return sendResponse(res, 200, true, 'Session valid', { principal: req.user });
});

export default router; 