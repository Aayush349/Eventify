const multer = require('multer');
const AppError = require('../utils/AppError');

// Memory storage — buffers uploaded to RAM, streamed directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// Single image — field name 'image'
const uploadSingle = upload.single('image');

// Multiple images — field name 'images', max 5
const uploadMultiple = upload.array('images', 5);

/**
 * Wrap multer middleware to throw AppError instead of MulterError
 */
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Image must be smaller than 5 MB.', 400));
    }
    return next(new AppError(err.message || 'File upload error.', 400));
  });
};

module.exports = {
  uploadSingle: handleUpload(uploadSingle),
  uploadMultiple: handleUpload(uploadMultiple),
};
