import express from 'express';
import {
  getAllProviders,
  getProvider,
  checkProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  providerSignup,
  providerLogin,
  getProviderProfile,
  updateProviderProfile,
} from '../controller/providerController.js';
import { authenticateToken, requireProvider, rateLimit } from '../middleware/auth.js';
import { sendResponse } from '../utils/responseFunction.js';

const router = express.Router();

// Public routes
router.get('/', getAllProviders);
router.post('/check', rateLimit(15 * 60 * 1000, 10), checkProvider);
router.post('/signup', rateLimit(15 * 60 * 1000, 5), providerSignup);
router.post('/login', rateLimit(15 * 60 * 1000, 10), providerLogin);

// Protected routes (specific routes first)
router.get('/profile', authenticateToken, requireProvider, getProviderProfile);
router.put('/profile', authenticateToken, requireProvider, updateProviderProfile);
router.get('/me', authenticateToken, (req, res) => {
  const p = req.user?.type === 'provider' ? {
    ...req.user,
    fullName: req.user.fullName || undefined,
    companyName: req.user.companyName || undefined,
    profilePicture: req.user.profilePicture || undefined,
  } : req.user
  return sendResponse(res, 200, true, 'Session valid', { principal: p });
});

// Admin routes (for managing providers)
router.post('/', authenticateToken, createProvider);

// Parameterized routes last
router.get('/:id', getProvider);
router.put('/:id', authenticateToken, updateProvider);
router.delete('/:id', authenticateToken, deleteProvider);

export default router;