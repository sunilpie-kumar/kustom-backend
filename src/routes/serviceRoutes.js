import express from 'express';
import {
  getAllServices,
  getServicesByCategory,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getFeaturedServices,
  searchServices,
} from '../controller/serviceController.js';
import { authenticateToken, requireProvider, optionalAuth, rateLimit } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllServices);
router.get('/featured', getFeaturedServices);
router.get('/search', optionalAuth, searchServices);
router.get('/category/:category', optionalAuth, getServicesByCategory);
router.get('/:id', optionalAuth, getServiceById);

// Protected routes (provider only)
router.post('/', authenticateToken, requireProvider, createService);
router.put('/:id', authenticateToken, requireProvider, updateService);
router.delete('/:id', authenticateToken, requireProvider, deleteService);

export default router; 