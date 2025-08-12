import express from 'express'
import { authenticateToken, requireAuth } from '../middleware/auth.js'
import { upload, handleUpload } from '../controller/uploadController.js'

const router = express.Router()

router.post('/chat', authenticateToken, requireAuth, upload.single('file'), handleUpload)

export default router

