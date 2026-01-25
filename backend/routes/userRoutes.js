var express = require('express');
var router = express.Router();
var { requireAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.delete('/profile', requireAuth, userController.deleteAccount);
router.post('/forgot-password', userController.forgotPassword); // Deprecated
router.post('/forgot-password/request', userController.requestPasswordReset);
router.post('/forgot-password/verify', userController.verifyPasswordResetCode);
router.post('/forgot-password/check-password', userController.checkPasswordMatch);
router.post('/forgot-password/reset', userController.resetPasswordWithCode);
router.get('/', userController.healthCheck);

module.exports = router;