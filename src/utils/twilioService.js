import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client
// NOTE: Credentials must be provided via environment variables. Do not hardcode.
const accountSid = process.env.TWILIO_ACCOUNT_SID; // redacted
const authToken = process.env.TWILIO_AUTH_TOKEN; // redacted
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID; // redacted
const whatsappNumberEnv = process.env.TWILIO_WHATSAPP_NUMBER; // redacted
const phoneNumberEnv = process.env.TWILIO_PHONE_NUMBER; // redacted

// Create Twilio client only if configured
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

// Twilio Verify service (guarded)
const verifyService = (client && verifyServiceSid) ? client.verify.v2.services(verifyServiceSid) : null;

/** Normalize to whatsapp:+E164 */
const toWhatsAppAddr = (num) =>
  String(num || '').startsWith('whatsapp:') ? String(num) : `whatsapp:${num}`;

/**
 * Send SMS using Twilio
 */
export const sendSMS = async (to, message) => {
  try {
    if (!client) throw new Error('Twilio is not configured');
    const response = await client.messages.create({
      body: message,
      from: phoneNumberEnv, // must be configured for SMS
      to: to,
    });
    return { success: true, messageId: response.sid, status: response.status };
  } catch (error) {
    console.error('Error sending SMS:', error?.message || error);
    throw new Error(`Failed to send SMS: ${error?.message || 'unknown error'}`);
  }
};

/**
 * Send verification code using Twilio Verify
 */
export const sendVerificationCode = async (phoneNumber, channel = 'sms') => {
  try {
    if (!verifyService) throw new Error('Twilio Verify is not configured');
    const verification = await verifyService.verifications.create({
      to: phoneNumber,
      channel,
    });
    return { success: true, verificationSid: verification.sid, status: verification.status };
  } catch (error) {
    console.error('Error sending verification code:', error?.message || error);
    throw new Error(`Failed to send verification code: ${error?.message || 'unknown error'}`);
  }
};

/**
 * Verify the code sent to phone number
 */
export const verifyCode = async (phoneNumber, code) => {
  try {
    if (!verifyService) throw new Error('Twilio Verify is not configured');
    const verificationCheck = await verifyService.verificationChecks.create({ to: phoneNumber, code });
    return { success: true, status: verificationCheck.status, valid: verificationCheck.status === 'approved' };
  } catch (error) {
    console.error('Error verifying code:', error?.message || error);
    throw new Error(`Failed to verify code: ${error?.message || 'unknown error'}`);
  }
};

/**
 * Send WhatsApp message using Twilio (requires a WA-enabled number or sandbox number)
 */
export const sendWhatsApp = async (to, message) => {
  try {
    if (!client) throw new Error('Twilio is not configured');
    const fromRaw = whatsappNumberEnv || phoneNumberEnv; // fallback to SMS number if it's the sandbox sender
    if (!fromRaw) {
      throw new Error('Neither TWILIO_WHATSAPP_NUMBER nor TWILIO_PHONE_NUMBER is configured in server .env');
    }
    const response = await client.messages.create({
      body: message,
      from: toWhatsAppAddr(fromRaw),
      to: toWhatsAppAddr(to),
    });
    return { success: true, messageId: response.sid, status: response.status };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error?.message || error);
    throw new Error(
      `Failed to send WhatsApp message: ${error?.message || 'unknown error'}. ` +
      `Ensure your number has WhatsApp enabled or use the Twilio sandbox (set TWILIO_WHATSAPP_NUMBER or TWILIO_PHONE_NUMBER to the sandbox sender and join the sandbox).`
    );
  }
};

export const sendOTPSMS = async (phoneNumber, otp, purpose = 'verification') => {
  const text = `Your ${purpose} code is: ${otp}. It expires in 10 minutes.`;
  return await sendSMS(phoneNumber, text);
};

export const isTwilioConfigured = () => {
  return !!(accountSid && authToken);
};

export const getAccountInfo = async () => {
  try {
    const account = await client.api.accounts(accountSid).fetch();
    return { accountSid: account.sid, accountName: account.friendlyName, status: account.status, type: account.type };
  } catch (error) {
    console.error('Error fetching account info:', error?.message || error);
    throw new Error(`Failed to fetch account info: ${error?.message || 'unknown error'}`);
  }
}; 