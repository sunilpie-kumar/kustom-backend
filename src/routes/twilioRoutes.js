import express from 'express';
import {
  sendSMSMessage,
  sendTwilioVerification,
  verifyTwilioCode,
  sendWhatsAppMessage,
  getTwilioStatus,
  sendBulkSMS,
} from '../controller/twilioController.js';
import { authenticateToken, rateLimit } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with rate limiting)
router.get('/status', getTwilioStatus);

// Protected routes (authenticated users only)
router.post('/sms', authenticateToken, rateLimit(15 * 60 * 1000, 10), sendSMSMessage);
router.post('/verify/send', authenticateToken, rateLimit(15 * 60 * 1000, 5), sendTwilioVerification);
router.post('/verify/check', authenticateToken, rateLimit(15 * 60 * 1000, 10), verifyTwilioCode);
router.post('/whatsapp', authenticateToken, rateLimit(15 * 60 * 1000, 10), sendWhatsAppMessage);
router.post('/bulk-sms', authenticateToken, rateLimit(15 * 60 * 1000, 5), sendBulkSMS);

export default router; 