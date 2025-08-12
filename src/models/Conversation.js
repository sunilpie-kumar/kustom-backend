import mongoose from 'mongoose'

const ParticipantSchema = new mongoose.Schema(
  {
    participantType: { type: String, enum: ['user', 'provider'], required: true },
    participantId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    lastReadAt: { type: Date, default: null },
  },
  { _id: false }
)

const ConversationSchema = new mongoose.Schema(
  {
    participants: { type: [ParticipantSchema], required: true, validate: v => v.length === 2 },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
)

ConversationSchema.index({ 'participants.participantType': 1, 'participants.participantId': 1 })

export default mongoose.model('Conversation', ConversationSchema)