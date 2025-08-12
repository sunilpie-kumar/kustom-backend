import { 
  sendSMS, 
  sendVerificationCode, 
  verifyCode, 
  sendWhatsApp, 
  isTwilioConfigured, 
  getAccountInfo 
} from '../utils/twilioService.js';
import { sendResponse } from '../utils/responseFunction.js';

// Send SMS
export const sendSMSMessage = async (req, res, next) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return sendResponse(res, 400, false, 'Phone number and message are required');
    }

    if (!isTwilioConfigured()) {
      return sendResponse(res, 500, false, 'Twilio is not properly configured');
    }

    const result = await sendSMS(to, message);

    return sendResponse(res, 200, true, 'SMS sent successfully', result);
  } catch (error) {
    next(error);
  }
};

// Send verification code using Twilio Verify
export const sendTwilioVerification = async (req, res, next) => {
  try {
    const { phoneNumber, channel = 'sms' } = req.body;

    if (!phoneNumber) {
      return sendResponse(res, 400, false, 'Phone number is required');
    }

    if (!isTwilioConfigured()) {
      return sendResponse(res, 500, false, 'Twilio is not properly configured');
    }

    const result = await sendVerificationCode(phoneNumber, channel);

    return sendResponse(res, 200, true, 'Verification code sent successfully', result);
  } catch (error) {
    next(error);
  }
};

// Verify code using Twilio Verify
export const verifyTwilioCode = async (req, res, next) => {
  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return sendResponse(res, 400, false, 'Phone number and code are required');
    }

    if (!isTwilioConfigured()) {
      return sendResponse(res, 500, false, 'Twilio is not properly configured');
    }

    const result = await verifyCode(phoneNumber, code);

    return sendResponse(res, 200, true, 'Code verification completed', result);
  } catch (error) {
    next(error);
  }
};

// Send WhatsApp message
export const sendWhatsAppMessage = async (req, res, next) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return sendResponse(res, 400, false, 'WhatsApp number and message are required');
    }

    if (!isTwilioConfigured()) {
      return sendResponse(res, 500, false, 'Twilio is not properly configured');
    }

    const result = await sendWhatsApp(to, message);

    return sendResponse(res, 200, true, 'WhatsApp message sent successfully', result);
  } catch (error) {
    next(error);
  }
};

// Get Twilio configuration status
export const getTwilioStatus = async (req, res, next) => {
  try {
    const configured = isTwilioConfigured();
    
    if (!configured) {
      return sendResponse(res, 200, true, 'Twilio configuration status', {
        configured: false,
        message: 'Twilio is not properly configured'
      });
    }

    const accountInfo = await getAccountInfo();

    return sendResponse(res, 200, true, 'Twilio configuration status', {
      configured: true,
      accountInfo
    });
  } catch (error) {
    next(error);
  }
};

// Bulk SMS sending
export const sendBulkSMS = async (req, res, next) => {
  try {
    const { recipients, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return sendResponse(res, 400, false, 'Recipients array is required');
    }

    if (!message) {
      return sendResponse(res, 400, false, 'Message is required');
    }

    if (!isTwilioConfigured()) {
      return sendResponse(res, 500, false, 'Twilio is not properly configured');
    }

    const results = [];
    const errors = [];

    // Send SMS to each recipient
    for (const phoneNumber of recipients) {
      try {
        const result = await sendSMS(phoneNumber, message);
        results.push({ phoneNumber, success: true, ...result });
      } catch (error) {
        errors.push({ phoneNumber, success: false, error: error.message });
      }
    }

    return sendResponse(res, 200, true, 'Bulk SMS sending completed', {
      total: recipients.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    next(error);
  }
}; 