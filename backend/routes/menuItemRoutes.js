const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin, requireOwner } = require('../middleware/auth');
const { menuUpload } = require('../middleware/upload');
const menuItemController = require('../controllers/menuItemController');

// ============ PUBLIC ROUTES ============

// Lấy menu của một restaurant (chỉ items đã approved)
router.get('/restaurant/:restaurantId', menuItemController.getMenuByRestaurant);

// ============ OWNER ROUTES ============

// Lấy tất cả menu items của owner
router.get('/owner', requireAuth, requireOwner, menuItemController.getOwnerMenuItems);

// Tạo menu item mới
router.post('/', requireAuth, requireOwner, menuUpload.single('image'), menuItemController.createMenuItem);

// Cập nhật menu item
router.put('/:id', requireAuth, requireOwner, menuUpload.single('image'), menuItemController.updateMenuItem);

// Xóa menu item
router.delete('/:id', requireAuth, requireOwner, menuItemController.deleteMenuItem);

// Upload ảnh riêng
router.post('/upload', requireAuth, requireOwner, menuUpload.single('image'), menuItemController.uploadMenuImage);

// ============ ADMIN ROUTES ============

// Lấy danh sách chờ duyệt
router.get('/pending', requireAuth, requireAdmin, menuItemController.getPendingMenuItems);

// Phê duyệt món ăn
router.patch('/:id/approve', requireAuth, requireAdmin, menuItemController.approveMenuItem);

// Từ chối món ăn
router.patch('/:id/reject', requireAuth, requireAdmin, menuItemController.rejectMenuItem);

module.exports = router;
