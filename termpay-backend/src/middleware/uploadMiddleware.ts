import multer from 'multer'
import path from 'path'
import { Request } from 'express'

// Store files in memory for processing
const storage = multer.memoryStorage()

// File filter — accept CSV only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = ['.csv']
  const allowedMimeTypes = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'text/plain',
    'text/x-csv'
  ]

  const ext = path.extname(file.originalname).toLowerCase()
  const mimeOk = allowedMimeTypes.includes(file.mimetype)
  const extOk = allowedExtensions.includes(ext)

  if (mimeOk || extOk) {
    cb(null, true)
  } else {
    cb(new Error('Only CSV files are accepted'))
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1
  }
})
