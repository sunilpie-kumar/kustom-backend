import mongoose from 'mongoose'

const UploadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, index: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    // Store binary data directly in MongoDB for MVP
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
)

export default mongoose.model('Uploads', UploadSchema)