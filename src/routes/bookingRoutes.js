import express from 'express';
import {
  createBooking,
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  getBookingById,
  addBookingRating,
  getBookingStats,
} from '../controller/bookingController.js';
import { authenticateToken, requireUser, requireProvider, requireAuth, rateLimit } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, requireUser, rateLimit(15 * 60 * 1000, 10), createBooking);
router.get('/user', authenticateToken, requireUser, getUserBookings);
router.get('/provider', authenticateToken, requireProvider, getProviderBookings);
router.get('/stats', authenticateToken, requireAuth, getBookingStats);
router.get('/:id', authenticateToken, requireAuth, getBookingById);
router.put('/:id', authenticateToken, requireAuth, updateBookingStatus);
router.post('/:id/rating', authenticateToken, requireUser, addBookingRating);

export default router; 