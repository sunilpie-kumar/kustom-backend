import express from 'express'
import { authenticateToken, requireAuth, rateLimit } from '../middleware/auth.js'
import { ensureConversation, getConversations, getMessages, sendMessage, markRead } from '../controller/chatController.js'

const router = express.Router()

router.use(authenticateToken, requireAuth)

router.post('/conversations/ensure', rateLimit(), ensureConversation)
router.get('/conversations', rateLimit(), getConversations)
router.get('/messages/:conversationId', rateLimit(), getMessages)
router.post('/messages', rateLimit(), sendMessage)
router.post('/messages/read/:conversationId', rateLimit(), markRead)

export default router