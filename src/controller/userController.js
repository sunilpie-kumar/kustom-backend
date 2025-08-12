import User from '../models/User.js';
import OTP from '../models/OTP.js';
import jwt from 'jsonwebtoken';
import { generateOTP, sendEmailOTP, sendOTPMessage } from '../utils/otpUtils.js';
import { sendResponse } from '../utils/responseFunction.js';

// Check if user exists
export const checkUser = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return sendResponse(res, 400, false, 'Email or phone is required');
    }
    const user = email ? await User.findOne({ email: email.toLowerCase() }) : await User.findOne({ phone });

    let token = undefined;
    if (user) {
      token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
    }

    return sendResponse(res, 200, true, 'User check completed', {
      exists: !!user,
      isEmailVerified: user?.isEmailVerified || false,
      isPhoneVerified: user?.isPhoneVerified || false,
      user: user ? user.getPublicProfile() : null,
      token,
    });
  } catch (error) { next(error); }
};

// Send OTP (supports phone/email and channel sms/whatsapp)
export const sendOTP = async (req, res, next) => {
  try {
    const { email, phone, type = 'phone', purpose = 'verification', channel = 'whatsapp' } = req.body;
    if (!email && !phone) {
      return sendResponse(res, 400, false, 'Email or phone is required');
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (email) await OTP.deleteMany({ email: email.toLowerCase() });
    if (phone) await OTP.deleteMany({ phone });

    await OTP.create({ email: email?.toLowerCase(), phone, otp, type, purpose, expiresAt });

    if (email && (type === 'email' || type === 'both')) { await sendEmailOTP(email, otp, purpose); }
    if (phone && (type === 'phone' || type === 'both')) { await sendOTPMessage(phone, otp, purpose, channel); }

    const debugData = process.env.NODE_ENV !== 'production' ? { otp } : undefined;
    return sendResponse(res, 200, true, 'OTP sent successfully', debugData);
  } catch (error) { console.error('Send OTP error:', error); next(error); }
};

// Verify OTP
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, phone, otp, type = 'phone', purpose = 'verification' } = req.body;
    if (!otp) return sendResponse(res, 400, false, 'OTP is required');
    if (!email && !phone) return sendResponse(res, 400, false, 'Email or phone is required');

    const query = email ? { email: email.toLowerCase(), otp, type, purpose, isUsed: false, expiresAt: { $gt: new Date() } }
                        : { phone, otp, type, purpose, isUsed: false, expiresAt: { $gt: new Date() } };
    const otpDoc = await OTP.findOne(query);
    if (!otpDoc) return sendResponse(res, 400, false, 'Invalid or expired OTP');

    otpDoc.isUsed = true; await otpDoc.save();

    if (email) await User.findOneAndUpdate({ email: email.toLowerCase() }, { isEmailVerified: true });
    if (phone) await User.findOneAndUpdate({ phone }, { isPhoneVerified: true });

    return sendResponse(res, 200, true, 'OTP verified successfully');
  } catch (error) { console.error('Verify OTP error:', error); next(error); }
};

// User signup (passwordless)
export const userSignup = async (req, res, next) => {
  try {
    const { fullName, email, phone } = req.body;

    if (!fullName || !email || !phone) {
      return sendResponse(res, 400, false, 'fullName, email and phone are required');
    }

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existingUser) {
      return sendResponse(res, 400, false, 'User already exists with this email or phone');
    }

    const user = await User.create({ fullName, email: email.toLowerCase(), phone });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return sendResponse(res, 201, true, 'User created successfully', { user: user.getPublicProfile(), token });
  } catch (error) { next(error); }
};

// User login (passwordless placeholder - encourage OTP login)
export const userLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendResponse(res, 400, false, 'Email is required');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return sendResponse(res, 401, false, 'User not found');

    user.lastLogin = new Date(); await user.save();
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return sendResponse(res, 200, true, 'Login successful', { user: user.getPublicProfile(), token });
  } catch (error) { next(error); }
};

// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'User profile retrieved successfully', {
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.params.id;
    const updateData = req.body;

    // Remove sensitive fields from update
    delete updateData.password;
    delete updateData.email; // Email should be updated through a separate process

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'User profile updated successfully', {
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
}; 