import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { sendResponse } from '../utils/responseFunction.js'
import Upload from '../models/Upload.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const uniqueName = `${timestamp}-${file.originalname.replace(/\s+/g, '-')}`
    cb(null, uniqueName)
  },
})

export const mediaUpload = multer({ storage })

export const createUpload = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.providerId
    if (!userId) return sendResponse(res, 403, false, 'Authentication required')

    const file = req.file
    if (!file) return sendResponse(res, 400, false, 'No file uploaded')

    const record = await Upload.create({
      userId,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
    })

    return sendResponse(res, 201, true, 'File uploaded', { upload: record })
  } catch (err) {
    next(err)
  }
}

export const getUploads = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.providerId
    if (!userId) return sendResponse(res, 403, false, 'Authentication required')

    const uploads = await Upload.find({ userId }).sort({ createdAt: -1 })
    return sendResponse(res, 200, true, 'Uploads fetched', { uploads })
  } catch (err) {
    next(err)
  }
}