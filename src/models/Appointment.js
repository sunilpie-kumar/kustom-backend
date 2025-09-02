import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Providers', required: true, index: true },
  scheduledAt: { type: Date, required: true, index: true },
  durationMinutes: { type: Number, default: 30 },
  status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' },
  note: { type: String, maxlength: 500 },
}, { timestamps: true })

export default mongoose.model('Appointments', appointmentSchema)