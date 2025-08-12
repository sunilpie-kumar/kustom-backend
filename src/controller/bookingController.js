import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import { sendResponse } from '../utils/responseFunction.js';

// Create booking
export const createBooking = async (req, res, next) => {
  try {
    const bookingData = req.body;
    
    // Add user ID from authenticated user
    if (req.user?.userId) {
      bookingData.user = req.user.userId;
    }

    // Validate service exists and get price
    const service = await Service.findById(bookingData.service);
    if (!service) {
      return sendResponse(res, 404, false, 'Service not found');
    }

    if (service.status !== 'active') {
      return sendResponse(res, 400, false, 'Service is not available');
    }

    // Set price from service
    bookingData.price = service.price;
    bookingData.provider = service.provider;

    const booking = await Booking.create(bookingData);
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'fullName email phone')
      .populate('provider', 'fullName companyName email phone')
      .populate('service', 'name description price duration');

    return sendResponse(res, 201, true, 'Booking created successfully', {
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// Get user bookings
export const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.params.userId;
    const { status, limit = 10, page = 1 } = req.query;
    
    const filter = { user: userId };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('provider', 'fullName companyName email phone')
      .populate('service', 'name description price duration')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    return sendResponse(res, 200, true, 'User bookings retrieved successfully', {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get provider bookings
export const getProviderBookings = async (req, res, next) => {
  try {
    const providerId = req.user?.providerId || req.params.providerId;
    const { status, limit = 10, page = 1 } = req.query;
    
    const filter = { provider: providerId };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('user', 'fullName email phone')
      .populate('service', 'name description price duration')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    return sendResponse(res, 200, true, 'Provider bookings retrieved successfully', {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status
export const updateBookingStatus = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { status, cancellationReason, cancelledBy } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }

    // Check permissions
    const isUser = req.user?.userId && booking.user.toString() === req.user.userId;
    const isProvider = req.user?.providerId && booking.provider.toString() === req.user.providerId;

    if (!isUser && !isProvider) {
      return sendResponse(res, 403, false, 'You can only update your own bookings');
    }

    // Update booking
    const updateData = { status };
    
    if (status === 'cancelled') {
      updateData.cancellationReason = cancellationReason;
      updateData.cancellationDate = new Date();
      updateData.cancelledBy = cancelledBy || (isUser ? 'user' : 'provider');
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'fullName email phone')
      .populate('provider', 'fullName companyName email phone')
      .populate('service', 'name description price duration');

    return sendResponse(res, 200, true, 'Booking status updated successfully', {
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'fullName email phone')
      .populate('provider', 'fullName companyName email phone')
      .populate('service', 'name description price duration');

    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }

    // Check permissions
    const isUser = req.user?.userId && booking.user._id.toString() === req.user.userId;
    const isProvider = req.user?.providerId && booking.provider._id.toString() === req.user.providerId;

    if (!isUser && !isProvider) {
      return sendResponse(res, 403, false, 'You can only view your own bookings');
    }

    return sendResponse(res, 200, true, 'Booking retrieved successfully', {
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Add rating to booking
export const addBookingRating = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { score, review } = req.body;

    if (!score || score < 1 || score > 5) {
      return sendResponse(res, 400, false, 'Valid rating score (1-5) is required');
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }

    // Check if user is the one who made the booking
    if (req.user?.userId && booking.user.toString() !== req.user.userId) {
      return sendResponse(res, 403, false, 'You can only rate your own bookings');
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return sendResponse(res, 400, false, 'You can only rate completed bookings');
    }

    // Check if already rated
    if (booking.rating.score) {
      return sendResponse(res, 400, false, 'Booking has already been rated');
    }

    // Update booking with rating
    booking.rating = {
      score,
      review,
      createdAt: new Date(),
    };
    await booking.save();

    // Update service rating
    const service = await Service.findById(booking.service);
    if (service) {
      const totalRating = service.rating.average * service.rating.count + score;
      const newCount = service.rating.count + 1;
      service.rating.average = totalRating / newCount;
      service.rating.count = newCount;
      await service.save();
    }

    // Update provider rating
    const provider = await Service.findById(booking.provider);
    if (provider) {
      const totalRating = provider.rating * provider.totalReviews + score;
      const newCount = provider.totalReviews + 1;
      provider.rating = totalRating / newCount;
      provider.totalReviews = newCount;
      await provider.save();
    }

    const updatedBooking = await Booking.findById(bookingId)
      .populate('user', 'fullName email phone')
      .populate('provider', 'fullName companyName email phone')
      .populate('service', 'name description price duration');

    return sendResponse(res, 200, true, 'Rating added successfully', {
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// Get booking statistics
export const getBookingStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const providerId = req.user?.providerId;

    if (!userId && !providerId) {
      return sendResponse(res, 401, false, 'Authentication required');
    }

    const filter = userId ? { user: userId } : { provider: providerId };

    const stats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$price.amount' }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments(filter);
    const totalAmount = await Booking.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$price.amount' } } }
    ]);

    const statsObject = {
      total: totalBookings,
      totalAmount: totalAmount[0]?.total || 0,
      byStatus: {}
    };

    stats.forEach(stat => {
      statsObject.byStatus[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      };
    });

    return sendResponse(res, 200, true, 'Booking statistics retrieved successfully', {
      stats: statsObject,
    });
  } catch (error) {
    next(error);
  }
}; 