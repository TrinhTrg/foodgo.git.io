'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/firebase-login', authController.loginWithFirebase);

router.post('/verify-token', authController.verifyFirebaseToken);

router.post('/logout', authController.logout);

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Auth API is working'
    });
});

module.exports = router;
