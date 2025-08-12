import mongoose from 'mongoose'

const ParticipantSchema = new mongoose.Schema(
  {
    participantType: { type: String, enum: ['user', 'provider'], required: true },
    participantId: { type: String, required: true, index: true },
    lastReadAt: { type: Date, default: null },
  },
  { _id: false }
)

const ConversationSchema = new mongoose.Schema(
  {
    participants: { type: [ParticipantSchema], required: true, validate: v => v.length === 2 },
    key: { type: String, required: true, unique: true, index: true },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
)

ConversationSchema.index({ 'participants.participantType': 1, 'participants.participantId': 1 })

export default mongoose.model('Conversation', ConversationSchema)