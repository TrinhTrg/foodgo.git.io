/**
 * Upload Middleware
 * @description Cấu hình multer cho upload files (images)
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Tạo multer upload middleware cho reviews
 * @param {string} uploadDir - Thư mục lưu file
 * @param {string} prefix - Prefix cho tên file (vd: 'review-', 'menu-')
 * @param {number} maxSize - Kích thước tối đa (bytes)
 * @param {number} maxFiles - Số file tối đa (cho array upload)
 * @returns {Object} Multer configuration object
 */
const createUploadConfig = (uploadDir, prefix = 'file-', maxSize = 5 * 1024 * 1024, maxFiles = 1) => {
  // Tạo thư mục nếu chưa tồn tại
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${prefix}${uniqueSuffix}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/jfif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp, avif, jfif). File hiện tại: ${file.mimetype}`), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      ...(maxFiles > 1 && { files: maxFiles })
    }
  });
};

/**
 * Upload middleware cho review images
 * - Cho phép upload nhiều ảnh (tối đa 5)
 * - Kích thước tối đa: 5MB mỗi ảnh
 */
const reviewUpload = createUploadConfig(
  path.join(__dirname, '../public/uploads/reviews'),
  'review-',
  5 * 1024 * 1024, // 5MB
  5 // max 5 files
);

/**
 * Upload middleware cho menu item images
 * - Chỉ upload 1 ảnh
 * - Kích thước tối đa: 5MB
 */
const menuUpload = createUploadConfig(
  path.join(__dirname, '../public/uploads/menu'),
  'menu-',
  5 * 1024 * 1024, // 5MB
  1 // single file
);

/**
 * Upload middleware cho restaurant images (nếu cần)
 * - Chỉ upload 1 ảnh
 * - Kích thước tối đa: 5MB
 */
const restaurantUpload = createUploadConfig(
  path.join(__dirname, '../public/uploads/restaurants'),
  'restaurant-',
  5 * 1024 * 1024, // 5MB
  1 // single file
);

module.exports = {
  createUploadConfig,
  reviewUpload,
  menuUpload,
  restaurantUpload
};

