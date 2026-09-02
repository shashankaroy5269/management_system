import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Configure Cloudinary credentials from environment variables
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('[Cloudinary] Configured successfully with Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[Cloudinary] Credentials not set in .env. Local storage will be used as default fallback.');
}

/**
 * Upload a local file to Cloudinary
 * @param {string} localFilePath - Path to file stored temporarily by multer
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export const uploadFileToCloudinary = async (localFilePath, folder = 'rbac_task_system') => {
  if (!isCloudinaryConfigured) {
    // Return relative URL for static local serving fallback
    return {
      url: `/uploads/${localFilePath.split(/[\\/]/).pop()}`,
      public_id: null
    };
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: 'auto'
    });

    // Delete local temporary file after successful Cloudinary upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error.message);
    // Fallback to local URL if Cloudinary fails
    return {
      url: `/uploads/${localFilePath.split(/[\\/]/).pop()}`,
      public_id: null
    };
  }
};

export default cloudinary;
