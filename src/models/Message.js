import mongoose from 'mongoose'

// New attachment schema storing file data directly within the message document
// Backward-compat fields (url,type,name) are retained but optional
const AttachmentSchema = new mongoose.Schema(
  {
    // New fields
    filename: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    uploadDate: { type: Date, default: Date.now },
    data: { type: Buffer },
    // Legacy fields (kept optional for older messages)
    url: { type: String },
    type: { type: String, enum: ['image', 'file'] },
    name: { type: String },
  },
  { _id: false }
)

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderType: { type: String, enum: ['user', 'provider'], required: true },
    senderId: { type: String, required: true },
    receiverType: { type: String, enum: ['user', 'provider'], required: true },
    receiverId: { type: String, required: true },
    content: { type: String, default: '' },
    attachments: { type: [AttachmentSchema], default: [] },
    readBy: [
      {
        readerType: { type: String, enum: ['user', 'provider'], required: true },
        readerId: { type: String, required: true },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model('Message', MessageSchema)