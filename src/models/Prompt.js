import mongoose from 'mongoose'

const PromptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, index: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

export default mongoose.model('Prompts', PromptSchema)