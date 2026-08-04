import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { AppError } from './errorHandler';

// Memory storage keeps file buffers in memory for Cloudinary or disk processing
const storage = multer.memoryStorage();

// Allowed image mime types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        400,
        `Invalid file type '${file.mimetype}'. Only JPG, PNG, WEBP, and GIF images are allowed.`
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max per file
    files: 10,                 // 10 files max per request
  },
});

export const uploadProductImages = upload.array('images', 10);
export const uploadSingleImage = upload.single('image');
