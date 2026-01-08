const multer = require('multer');
const path = require('path');
const fs = require('fs');


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


const reviewUpload = createUploadConfig(
  path.join(__dirname, '../public/uploads/reviews'),
  'review-',
  5 * 1024 * 1024, // 5MB
  5 // max 5 files
);


const menuUpload = createUploadConfig(
  path.join(__dirname, '../public/uploads/menu'),
  'menu-',
  5 * 1024 * 1024, // 5MB
  1 // single file
);

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

