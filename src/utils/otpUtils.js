import crypto from 'crypto';
import { sendOTPSMS, sendVerificationCode, verifyCode, sendWhatsApp, isTwilioConfigured } from './twilioService.js';

// Generate a 6-digit OTP
export const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export const sendEmailOTP = async (email, otp, purpose) => {
  console.log(`Email OTP sent to ${email}: ${otp} for ${purpose}`);
  return true;
};

// Unified OTP sender for SMS or WhatsApp
export const sendOTPMessage = async (phone, otp, purpose, channel = 'sms') => {
  const configured = isTwilioConfigured();
  const text = `Your ${purpose} code is: ${otp}. It expires in 10 minutes.`;
  try {
    if (configured) {
      if (channel === 'whatsapp') {
        // will throw if TWILIO_WHATSAPP_NUMBER is missing
        return await sendWhatsApp(phone, text);
      }
      return await sendOTPSMS(phone, otp, purpose);
    }
    // Fallback dev mode
    console.log(`[DEMO MODE] ${channel.toUpperCase()} OTP for ${phone}: ${otp} for ${purpose}`);
    return { success: true, messageId: 'demo-' + Date.now() };
  } catch (error) {
    console.error('Error sending OTP message:', error?.message || error);
    // In dev: still surface OTP
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEMO MODE] ${channel.toUpperCase()} OTP for ${phone}: ${otp} for ${purpose}`);
      return { success: true, messageId: 'demo-' + Date.now() };
    }
    throw error;
  }
};

export const sendTwilioVerification = async (phone, channel = 'sms') => {
  const result = await sendVerificationCode(phone, channel);
  console.log(`Twilio verification sent to ${phone} via ${channel}`);
  return result;
};

export const verifyTwilioCode = async (phone, code) => {
  const result = await verifyCode(phone, code);
  console.log(`Twilio verification check for ${phone}: ${result.valid ? 'valid' : 'invalid'}`);
  return result;
};

export const verifyOTP = (storedOTP, providedOTP) => storedOTP === providedOTP;

export const generateResetToken = () => crypto.randomBytes(32).toString('hex');
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex'); 