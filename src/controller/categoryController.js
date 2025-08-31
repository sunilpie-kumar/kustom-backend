import Category from '../models/Category.js';
import { sendResponse } from '../utils/responseFunction.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ order: 1, label: 1 });
    return sendResponse(res, 200, true, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};