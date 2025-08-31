import express from 'express'
import { authenticateToken, requireAuth } from '../middleware/auth.js'
import { createPrompt, getPrompts } from '../controller/promptController.js'

const router = express.Router()

router.post('/', authenticateToken, requireAuth, createPrompt)
router.get('/', authenticateToken, requireAuth, getPrompts)

export default router