import express from 'express';
import { sendOTP, verifyOTP } from '../controller/userController.js';
import { rateLimit } from '../middleware/auth.js';

const router = express.Router();

// OTP routes with rate limiting
router.post('/send', rateLimit(15 * 60 * 1000, 5), sendOTP);
router.post('/verify', rateLimit(15 * 60 * 1000, 10), verifyOTP);

export default router; 