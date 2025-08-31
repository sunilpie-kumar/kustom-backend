import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters'],
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'], // holds category key from Categories collection
    trim: true,
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    match: [/^[A-Z0-9-]+$/, 'Please enter a valid license number'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isLicenseVerified: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  price: {
    type: String,
    default: '',
    trim: true,
  },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Method to get public profile (without sensitive data)
providerSchema.methods.getPublicProfile = function() {
  const providerObject = this.toObject();
  delete providerObject.__v;
  return providerObject;
};

export default mongoose.model('Providers', providerSchema);