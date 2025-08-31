import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import Provider from '../models/Provider.js'
import mongoose from 'mongoose'
import { sendResponse } from '../utils/responseFunction.js'
import { getIO } from '../realtime/socket.js'

const attachmentPublic = (messageId, att, index) => ({
  filename: att.filename || att.name,
  name: att.name || att.filename,
  size: att.size,
  mimeType: att.mimeType || att.type,
  type: (att.mimeType || att.type || '').startsWith('image/') ? 'image' : 'file',
  // exclude raw data from API
  downloadUrl: `/api/chat/messages/${messageId}/attachments/${index}`,
})

const messagePublic = (m) => {
  const msg = m.toObject ? m.toObject() : m
  const attachments = (msg.attachments || []).map((a, idx) => attachmentPublic(msg._id, a, idx))
  return { ...msg, attachments }
}

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

        // Build a friendly title for the other participant
        const participants = c.participants || []
        const other = participants.find(p => p.participantType !== me.participantType)
        let title = undefined
        if (other) {
          if (other.participantType === 'user') {
            let u = null
            if (mongoose.Types.ObjectId.isValid(String(other.participantId))) {
              u = await User.findById(other.participantId).select('fullName email')
            }
            title = u?.fullName || u?.email || 'User'
          } else if (other.participantType === 'provider') {
            let p = null
            if (mongoose.Types.ObjectId.isValid(String(other.participantId))) {
              p = await Provider.findById(other.participantId).select('companyName fullName')
            }
            title = p?.companyName || p?.fullName || 'Provider'
          }
        }

        return { ...c.toObject(), lastMessage, unreadCount, title }
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
    const sanitized = messages.map(messagePublic)
    return sendResponse(res, 200, true, 'Messages fetched', { messages: sanitized })
  } catch (error) {
    return sendResponse(res, 500, false, error.message || 'Failed to fetch messages')
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, attachments, receiverType, receiverId } = req.body
    const me = buildParticipant(req)
    // Build attachments: either from validated upload (multipart) or from body
    let finalAttachments = []
    if (req.validatedFileMeta) {
      const { filename, mimeType, size, buffer } = req.validatedFileMeta
      finalAttachments.push({ filename, mimeType, size, data: buffer, uploadDate: new Date(), type: mimeType.startsWith('image/') ? 'image' : 'file', name: filename })
    } else if (Array.isArray(attachments)) {
      // Accept legacy structure but do not store URL; just mirror fields if provided
      finalAttachments = attachments.map(a => ({
        filename: a.name,
        name: a.name,
        size: a.size,
        mimeType: a.mimeType || a.type,
        // no data in legacy path
        uploadDate: new Date(),
        type: (a.mimeType || a.type || '').startsWith('image/') ? 'image' : 'file',
      }))
    }
    const created = await Message.create({
      conversationId,
      senderType: me.participantType,
      senderId: String(me.participantId),
      receiverType,
      receiverId: String(receiverId),
      content,
      attachments: finalAttachments,
      readBy: [{ readerType: me.participantType, readerId: me.participantId, readAt: new Date() }],
    })
    await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() })
    // Emit realtime event to the conversation room
    const io = getIO()
    if (io) {
      // Emit to the conversation room for both parties; clients handle de-dupe and own-message logic
      io.to(`conversation:${conversationId}`).emit('chat:new_message', { message: messagePublic(created) })
      // Also notify the receiver personally (for list updates if not in the room)
      io.to(`${receiverType}:${receiverId}`).emit('chat:notify', { conversationId, message: messagePublic(created) })
    }
    return sendResponse(res, 201, true, 'Message sent', { message: messagePublic(created) })
  } catch (error) {
    return sendResponse(res, 500, false, error.message || 'Failed to send message')
  }
}

export const streamAttachment = async (req, res) => {
  try {
    const { messageId, index } = req.params
    const msg = await Message.findById(messageId)
    if (!msg) return sendResponse(res, 404, false, 'Message not found')
    const i = Number(index) || 0
    const att = (msg.attachments || [])[i]
    if (!att || !att.data) return sendResponse(res, 404, false, 'Attachment not found')

    // Authorization: allow only participants of the conversation
    const me = buildParticipant(req)
    const convo = await Conversation.findById(msg.conversationId)
    const allowed = (convo?.participants || []).some(p => p.participantType === me.participantType && String(p.participantId) === String(me.participantId))
    if (!allowed) return sendResponse(res, 403, false, 'Forbidden')

    res.setHeader('Content-Type', att.mimeType || 'application/octet-stream')
    const safeName = encodeURIComponent(att.filename || att.name || 'file')
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${safeName}`)
    return res.end(att.data)
  } catch (error) {
    return sendResponse(res, 500, false, error.message || 'Failed to load attachment')
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