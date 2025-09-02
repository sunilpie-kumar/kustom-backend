import express from 'express'
import { authenticateToken, requireAuth, requireUser, requireProvider } from '../middleware/auth.js'
import { createAppointment, getUserAppointments, getProviderAppointments } from '../controller/appointmentController.js'

const router = express.Router()

router.post('/', authenticateToken, requireUser, createAppointment)
router.get('/user', authenticateToken, requireUser, getUserAppointments)
router.get('/provider', authenticateToken, requireProvider, getProviderAppointments)

export default router