import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { sendResponse } from '../utils/responseFunction.js'
import { getIO } from '../realtime/socket.js'

const buildParticipant = (req) => {
  if (req.user?.userId) return { participantType: 'user', participantId: req.user.userId }
  if (req.user?.providerId) return { participantType: 'provider', participantId: req.user.providerId }
  return null
}

export const ensureConversation = async (req, res) => {
  try {
    const me = buildParticipant(req)
    const { peerType, peerId } = req.body
    const other = { participantType: peerType, participantId: peerId }

    let convo = await Conversation.findOne({
      participants: { $all: [me, other] },
    })

    if (!convo) {
      convo = await Conversation.create({ participants: [me, other] })
    }
    return sendResponse(res, 200, true, 'Conversation ready', { conversation: convo })
  } catch (error) {
    return sendResponse(res, 500, false, error.message || 'Failed to create conversation')
  }
}

export const getConversations = async (req, res) => {
  try {
    const me = buildParticipant(req)
    const convos = await Conversation.find({
      'participants.participantType': me.participantType,
      'participants.participantId': me.participantId,
    }).sort({ updatedAt: -1 })
    return sendResponse(res, 200, true, 'Conversations fetched', { conversations: convos })
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
      senderId: me.participantId,
      receiverType,
      receiverId,
      content,
      attachments: attachments || [],
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