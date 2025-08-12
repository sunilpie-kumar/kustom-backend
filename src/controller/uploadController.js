import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { sendResponse } from '../utils/responseFunction.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  }
})

export const upload = multer({ storage })

export const handleUpload = (req, res) => {
  if (!req.file) return sendResponse(res, 400, false, 'No file uploaded')
  const fileUrl = `/uploads/${req.file.filename}`
  return sendResponse(res, 201, true, 'Uploaded', { url: fileUrl, name: req.file.originalname, size: req.file.size })
}

