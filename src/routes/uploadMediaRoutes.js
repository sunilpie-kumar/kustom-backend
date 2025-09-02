import express from 'express'
import { authenticateToken, requireAuth } from '../middleware/auth.js'
import { mediaUpload, createUpload, getUploads, streamUpload } from '../controller/uploadMediaController.js'

const router = express.Router()

router.post('/', authenticateToken, requireAuth, mediaUpload.single('file'), createUpload)
router.get('/', authenticateToken, requireAuth, getUploads)
// Public streaming for inline previews (MVP)
router.get('/:id', streamUpload)

export default router