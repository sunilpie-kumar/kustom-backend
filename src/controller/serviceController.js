import Service from '../models/Service.js';
import { sendResponse } from '../utils/responseFunction.js';

// Get all services
export const getAllServices = async (req, res, next) => {
  try {
    const { 
      category, 
      subcategory, 
      provider, 
      status = 'active',
      minPrice, 
      maxPrice, 
      limit = 10, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filter = { status };
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (provider) filter.provider = provider;
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.amount'].$lte = parseFloat(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const services = await Service.find(filter)
      .populate('provider', 'fullName companyName email phone rating')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort(sortOptions);

    const total = await Service.countDocuments(filter);

    return sendResponse(res, 200, true, 'Services retrieved successfully', {
      services,
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

// Get services by category
export const getServicesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { subcategory, limit = 10, page = 1 } = req.query;
    
    const filter = { category, status: 'active' };
    if (subcategory) filter.subcategory = subcategory;

    const services = await Service.find(filter)
      .populate('provider', 'fullName companyName email phone rating')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments(filter);

    return sendResponse(res, 200, true, 'Services by category retrieved successfully', {
      services,
      category,
      subcategory,
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

// Get service by ID
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'fullName companyName email phone rating totalReviews');

    if (!service) {
      return sendResponse(res, 404, false, 'Service not found');
    }

    return sendResponse(res, 200, true, 'Service retrieved successfully', {
      service,
    });
  } catch (error) {
    next(error);
  }
};

// Create service
export const createService = async (req, res, next) => {
  try {
    const serviceData = req.body;
    
    // Add provider ID from authenticated user
    if (req.user?.providerId) {
      serviceData.provider = req.user.providerId;
    }

    const service = await Service.create(serviceData);
    
    const populatedService = await Service.findById(service._id)
      .populate('provider', 'fullName companyName email phone rating');

    return sendResponse(res, 201, true, 'Service created successfully', {
      service: populatedService,
    });
  } catch (error) {
    next(error);
  }
};

// Update service
export const updateService = async (req, res, next) => {
  try {
    const serviceId = req.params.id;
    const updateData = req.body;

    // Check if user is the service provider
    const existingService = await Service.findById(serviceId);
    if (!existingService) {
      return sendResponse(res, 404, false, 'Service not found');
    }

    if (req.user?.providerId && existingService.provider.toString() !== req.user.providerId) {
      return sendResponse(res, 403, false, 'You can only update your own services');
    }

    const service = await Service.findByIdAndUpdate(
      serviceId,
      updateData,
      { new: true, runValidators: true }
    ).populate('provider', 'fullName companyName email phone rating');

    return sendResponse(res, 200, true, 'Service updated successfully', {
      service,
    });
  } catch (error) {
    next(error);
  }
};

// Delete service
export const deleteService = async (req, res, next) => {
  try {
    const serviceId = req.params.id;

    // Check if user is the service provider
    const existingService = await Service.findById(serviceId);
    if (!existingService) {
      return sendResponse(res, 404, false, 'Service not found');
    }

    if (req.user?.providerId && existingService.provider.toString() !== req.user.providerId) {
      return sendResponse(res, 403, false, 'You can only delete your own services');
    }

    await Service.findByIdAndDelete(serviceId);

    return sendResponse(res, 200, true, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get featured services
export const getFeaturedServices = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;

    const services = await Service.find({ 
      isFeatured: true, 
      status: 'active' 
    })
      .populate('provider', 'fullName companyName email phone rating')
      .limit(parseInt(limit))
      .sort({ rating: -1, createdAt: -1 });

    return sendResponse(res, 200, true, 'Featured services retrieved successfully', {
      services,
    });
  } catch (error) {
    next(error);
  }
};

// Search services
export const searchServices = async (req, res, next) => {
  try {
    const { q, category, location, limit = 10, page = 1 } = req.query;
    
    const filter = { status: 'active' };
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    if (category) filter.category = category;

    const services = await Service.find(filter)
      .populate('provider', 'fullName companyName email phone rating')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ rating: -1, createdAt: -1 });

    const total = await Service.countDocuments(filter);

    return sendResponse(res, 200, true, 'Services search completed', {
      services,
      searchQuery: q,
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