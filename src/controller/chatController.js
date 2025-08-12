import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { sendResponse } from '../utils/responseFunction.js'
import { getIO } from '../realtime/socket.js'

const buildParticipant = (req) => {
  if (req.user?.userId) return { participantType: 'user', participantId: String(req.user.userId) }
  if (req.user?.providerId) return { participantType: 'provider', participantId: String(req.user.providerId) }
  return null
}

export const ensureConversation = async (req, res) => {
  try {
    const me = buildParticipant(req)
    const { peerType, peerId } = req.body
    const other = { participantType: peerType, participantId: peerId }
    // Deterministic key: provider:<id>|user:<id> (provider first)
    const a = me.participantType === 'provider' ? me : other
    const b = me.participantType === 'provider' ? other : me
    const key = `provider:${a.participantType === 'provider' ? a.participantId : b.participantId}|user:${a.participantType === 'user' ? a.participantId : b.participantId}`

    let convo = await Conversation.findOne({ key })

    if (!convo) {
      convo = await Conversation.create({ participants: [me, other], key })
    }
    return sendResponse(res, 200, true, 'Conversation ready', { conversation: convo })
  } catch (error) {
    return sendResponse(res, 500, false, error.message || 'Failed to create conversation')
  }
}

export const getConversations = async (req, res) => {
  try {
    const me = buildParticipant(req)
    const convos = await Conversation.find({ key: new RegExp(`${me.participantType}:${me.participantId}`) }).sort({ updatedAt: -1 })

    // Compute unread counts and last message for each conversation
    const withMeta = await Promise.all(
      convos.map(async (c) => {
        const lastMessage = await Message.findOne({ conversationId: c._id }).sort({ createdAt: -1 })
        const unreadCount = await Message.countDocuments({
          conversationId: c._id,
          $nor: [
            {
              readBy: {
                $elemMatch: { readerType: me.participantType, readerId: me.participantId },
              },
            },
          ],
          // only count messages not authored by me
          senderType: { $ne: me.participantType },
          senderId: { $ne: me.participantId },
        })
        return { ...c.toObject(), lastMessage, unreadCount }
      })
    )

    return sendResponse(res, 200, true, 'Conversations fetched', { conversations: withMeta })
  } catch (error) {
    return sendResponse(res, 500, false, error.message || 'Failed to fetch conversations')
  }
}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 })
    return sendResponse(res, 200, true, 'Messages fetched', { messages })
  } catch (error) {
    return sendResponse(res, 500, false, error.message || 'Failed to fetch messages')
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, attachments, receiverType, receiverId } = req.body
    const me = buildParticipant(req)
    const msg = await Message.create({
      conversationId,
      senderType: me.participantType,
      senderId: String(me.participantId),
      receiverType,
      receiverId: String(receiverId),
      content,
      attachments: attachments || [],
      readBy: [{ readerType: me.participantType, readerId: me.participantId, readAt: new Date() }],
    })
    await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() })
    // Emit realtime event to the conversation room
    const io = getIO()
    if (io) {
      io.to(`conversation:${conversationId}`).emit('chat:new_message', { message: msg })
      io.to(`${receiverType}:${receiverId}`).emit('chat:notify', { conversationId, message: msg })
    }
    return sendResponse(res, 201, true, 'Message sent', { message: msg })
  } catch (error) {
    return sendResponse(res, 500, false, error.message || 'Failed to send message')
  }
}

export const markRead = async (req, res) => {
  try {
    const { conversationId } = req.params
    const me = buildParticipant(req)
    await Message.updateMany(
      { conversationId },
      { $addToSet: { readBy: { readerType: me.participantType, readerId: me.participantId } } }
    )
    const io = getIO()
    if (io) io.to(`conversation:${conversationId}`).emit('chat:read', { conversationId, reader: me })
    return sendResponse(res, 200, true, 'Marked as read')
  } catch (error) {
    return sendResponse(res, 500, false, error.message || 'Failed to mark read')
  }
}