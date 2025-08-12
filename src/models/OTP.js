import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: function() {
      return !this.phone; // Email is required only if phone is not provided
    },
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: function() {
      return !this.email; // Phone is required only if email is not provided
    },
    trim: true,
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: [6, 'OTP must be 6 digits'],
  },
  type: {
    type: String,
    enum: ['email', 'phone', 'both'],
    required: [true, 'OTP type is required'],
  },
  purpose: {
    type: String,
    enum: ['verification', 'password_reset', 'login'],
    required: [true, 'OTP purpose is required'],
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration time is required'],
    index: { expireAfterSeconds: 0 }, // TTL index to automatically delete expired OTPs
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5, 'Maximum attempts exceeded'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for email queries
otpSchema.index({ email: 1, type: 1, purpose: 1 });

// Index for phone queries
otpSchema.index({ phone: 1, type: 1, purpose: 1 });

// Index for expiration
otpSchema.index({ expiresAt: 1 });

export default mongoose.model('OTPs', otpSchema); 