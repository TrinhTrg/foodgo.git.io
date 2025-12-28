// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { reviewUpload } = require('../middleware/upload');
const reviewController = require('../controllers/reviewController');

// Lấy tất cả reviews của một restaurant
router.get('/restaurant/:restaurantId', reviewController.getReviewsByRestaurant);

// Lấy review của user cho restaurant cụ thể
router.get('/user/:restaurantId', requireAuth, reviewController.getUserReview);

// Lấy số lượng reviews của user hiện tại
router.get('/user-count', requireAuth, reviewController.getUserReviewCount);

// Lấy tất cả reviews của user hiện tại (với thông tin restaurant)
router.get('/user', requireAuth, reviewController.getUserReviews);

// Tạo hoặc cập nhật review
router.post('/', requireAuth, reviewController.createOrUpdateReview);

// Upload ảnh review
router.post('/upload', requireAuth, reviewUpload.array('images', 5), reviewController.uploadReviewImages);

// Xóa review
router.delete('/:reviewId', requireAuth, reviewController.deleteReview);

module.exports = router;
