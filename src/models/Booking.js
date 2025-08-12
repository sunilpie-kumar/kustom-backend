import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'User is required'],
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Providers',
    required: [true, 'Provider is required'],
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Services',
    required: [true, 'Service is required'],
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required'],
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
  },
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
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'],
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters'],
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters'],
  },
  cancellationDate: {
    type: Date,
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'provider', 'system'],
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
    },
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

// Index for user queries
bookingSchema.index({ user: 1, createdAt: -1 });

// Index for provider queries
bookingSchema.index({ provider: 1, createdAt: -1 });

// Index for service queries
bookingSchema.index({ service: 1 });

// Index for status queries
bookingSchema.index({ status: 1 });

// Index for scheduled date queries
bookingSchema.index({ scheduledDate: 1 });

export default mongoose.model('Bookings', bookingSchema); 