import express from 'express'
import { authenticateToken, requireAuth, rateLimit } from '../middleware/auth.js'
import { ensureConversation, getConversations, getMessages, sendMessage, markRead, streamAttachment } from '../controller/chatController.js'
import { upload, validateChatFile } from '../controller/uploadController.js'

const router = express.Router()

router.use(authenticateToken, requireAuth)

router.post('/conversations/ensure', rateLimit(), ensureConversation)
router.get('/conversations', rateLimit(), getConversations)
router.get('/messages/:conversationId', rateLimit(), getMessages)
router.post('/messages', rateLimit(), sendMessage)
router.post('/messages/read/:conversationId', rateLimit(), markRead)
// New: send message with a single attachment via multipart (stored in MongoDB)
router.post('/messages/with-file', rateLimit(), upload.single('file'), validateChatFile, sendMessage)
// New: stream attachment by message id and attachment index
router.get('/messages/:messageId/attachments/:index', rateLimit(), streamAttachment)

export default router