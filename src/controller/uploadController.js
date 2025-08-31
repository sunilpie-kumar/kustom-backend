import multer from 'multer'
import { sendResponse } from '../utils/responseFunction.js'
import { fileTypeFromBuffer } from 'file-type'

// Memory storage: keep file in RAM, then move into MongoDB via chat controller
export const upload = multer({ storage: multer.memoryStorage() })

// Validate file type and size here; the actual save happens in chat controller
export const validateChatFile = async (req, res, next) => {
  try {
    const file = req.file
    if (!file) return sendResponse(res, 400, false, 'No file uploaded')

    const maxBytes = 2 * 1024 * 1024 // 2 MB
    if (file.size > maxBytes) return sendResponse(res, 413, false, 'File exceeds 2 MB limit')

    // Detect mime from buffer to avoid spoofed types
    const detected = await fileTypeFromBuffer(file.buffer).catch(() => null)
    const mime = detected?.mime || file.mimetype
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowed.includes(mime)) return sendResponse(res, 415, false, 'Only JPEG, PNG, and PDF are allowed')

    req.validatedFileMeta = {
      filename: file.originalname,
      mimeType: mime,
      size: file.size,
      buffer: file.buffer,
    }
    return next()
  } catch (e) {
    return sendResponse(res, 400, false, e.message || 'Invalid upload')
  }
}

// Deprecated: kept for compatibility if needed elsewhere
export const handleUpload = (req, res) => sendResponse(res, 410, false, 'Deprecated endpoint')