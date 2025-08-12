import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['Technology', 'Healthcare', 'Finance', 'Education', 'Home Services', 'Beauty & Wellness', 'Transportation', 'Other'],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Providers',
    required: [true, 'Provider is required'],
  },
  price: {
    amount: {
      type: Number,
      required: [true, 'Price amount is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR'],
    },
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'monthly'],
      default: 'fixed',
    },
  },
  duration: {
    type: Number, // in minutes
    default: 60,
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  availability: {
    monday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    tuesday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    wednesday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    thursday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    friday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    saturday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
    sunday: { available: { type: Boolean, default: true }, hours: { start: String, end: String } },
  },
  tags: [{
    type: String,
    trim: true,
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  isFeatured: {
    type: Boolean,
    default: false,
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

// Index for geospatial queries
serviceSchema.index({ "location.coordinates": "2dsphere" });

// Index for category and status queries
serviceSchema.index({ category: 1, status: 1 });

// Index for provider queries
serviceSchema.index({ provider: 1 });

export default mongoose.model('Services', serviceSchema); 