import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';

// Configure Cloudinary SDK
const isCloudinaryConfigured = Boolean(
  config.CLOUDINARY_CLOUD_NAME &&
    config.CLOUDINARY_API_KEY &&
    config.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads an image buffer or file path to Cloudinary (or saves locally if Cloudinary is unconfigured)
 * @param file Express.Multer.File object
 * @param folder Cloudinary folder name
 * @returns Promise resolving to public image URL
 */
export const uploadImage = async (
  file: Express.Multer.File,
  folder = 'products'
): Promise<string> => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `ecommerce/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve(result.secure_url);
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  // =====================================================
  // Fallback: Local Disk Storage for Development
  // =====================================================
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExtension = path.extname(file.originalname) || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, file.buffer);

  // Return local static URL
  return `/uploads/${folder}/${filename}`;
};

/**
 * Uploads multiple images in parallel
 */
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder = 'products'
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
};
