const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} folder - Cloudinary folder (e.g. 'events', 'avatars')
 * @returns {{ url: string, publicId: string }}
 */
const uploadImage = (buffer, folder = 'tickethub/events') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 630, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by publicId
 * @param {string} publicId
 */
const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message);
    // Non-fatal — don't throw
  }
};

module.exports = { uploadImage, deleteImage };
