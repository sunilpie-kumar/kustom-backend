import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  label: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  color: { type: String, default: '' },
  bg: { type: String, default: '' },
  icon: { type: String, default: '' },
  trending: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.index({ key: 1 }, { unique: true });

export default mongoose.model('Categories', categorySchema);