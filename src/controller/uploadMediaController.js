import multer from 'multer'
import { sendResponse } from '../utils/responseFunction.js'
import Upload from '../models/Upload.js'

// Use memory storage and persist to MongoDB
export const mediaUpload = multer({ storage: multer.memoryStorage() })

export const createUpload = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.providerId
    if (!userId) return sendResponse(res, 403, false, 'Authentication required')

    const file = req.file
    if (!file) return sendResponse(res, 400, false, 'No file uploaded')

    const record = await Upload.create({
      userId,
      filename: file.originalname.replace(/\s+/g, '-'),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer,
    })

    return sendResponse(res, 201, true, 'File uploaded', { upload: { ...record.toObject(), downloadUrl: `/api/uploads/${record._id}` } })
  } catch (err) {
    next(err)
  }
}

export const getUploads = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.providerId
    if (!userId) return sendResponse(res, 403, false, 'Authentication required')

    const uploads = await Upload.find({ userId }).sort({ createdAt: -1 }).select('-data')
    const items = uploads.map(u => ({ ...u.toObject(), downloadUrl: `/api/uploads/${u._id}` }))
    return sendResponse(res, 200, true, 'Uploads fetched', { uploads: items })
  } catch (err) {
    next(err)
  }
}

export const streamUpload = async (req, res, next) => {
  try {
    const { id } = req.params
    const doc = await Upload.findById(id)
    if (!doc) return sendResponse(res, 404, false, 'File not found')
    res.setHeader('Content-Type', doc.mimeType)
    res.setHeader('Content-Length', doc.size)
    return res.send(doc.data)
  } catch (err) { next(err) }
}