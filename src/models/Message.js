import mongoose from 'mongoose'

const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'file'], required: true },
    name: { type: String },
    size: { type: Number },
  },
  { _id: false }
)

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderType: { type: String, enum: ['user', 'provider'], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverType: { type: String, enum: ['user', 'provider'], required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, default: '' },
    attachments: { type: [AttachmentSchema], default: [] },
    readBy: [
      {
        readerType: { type: String, enum: ['user', 'provider'], required: true },
        readerId: { type: mongoose.Schema.Types.ObjectId, required: true },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model('Message', MessageSchema)