const cloudinary = require('cloudinary').v2;

// Cloudinary will be fully configured in Phase 3
// Keys are read from .env — leave blank until Phase 3
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️  Cloudinary configured successfully.');
} else {
  console.log('⚠️  Cloudinary not configured (keys missing). Will activate in Phase 3.');
}

module.exports = cloudinary;
