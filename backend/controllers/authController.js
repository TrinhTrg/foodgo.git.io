'use strict';

const admin = require('../config/firebaseConfig');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Cấu hình
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateSystemToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            id: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};


const loginWithFirebase = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        // kiểm tra idToken
        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'idToken là bắt buộc'
            });
        }

        // Verify Firebase token
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (verifyError) {
            console.error('Firebase token verification failed:', verifyError.message);
            return res.status(401).json({
                success: false,
                message: 'Token Firebase không hợp lệ hoặc đã hết hạn',
                error: verifyError.code
            });
        }

        //  Lấy thông tin từ decoded token
        const {
            uid: firebaseUid,
            email,
            name,
            picture: avatar,
            firebase: firebaseInfo
        } = decodedToken;

        // Xác định provider 
        const authProvider = firebaseInfo?.sign_in_provider || 'firebase';

        console.log(`Firebase login attempt: ${email} via ${authProvider}`);

        // Tìm user trong database
        let user = await User.findOne({ where: { email } });

        if (user) {
            await user.update({
                firebase_uid: firebaseUid,
                avatar: avatar || user.avatar,
                auth_provider: authProvider,
                name: user.name || name || email.split('@')[0]
            });

            console.log(`Existing user synced: ${email} (ID: ${user.id})`);

        } else {
            user = await User.create({
                firebase_uid: firebaseUid,
                email: email,
                name: name || email.split('@')[0], // Lấy tên từ email nếu không có
                avatar: avatar || null,
                auth_provider: authProvider,
                role: 'customer',
                password: null 
            });

            console.log(`New user created: ${email} (ID: ${user.id})`);
        }

        //  Tạo JWT token của hệ thống
        const systemToken = generateSystemToken(user);

        // Trả về response
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                    authProvider: user.auth_provider
                },
                token: systemToken
            }
        });

    } catch (error) {
        console.error('Firebase login error:', error);
        next(error);
    }
};

const verifyFirebaseToken = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'idToken là bắt buộc'
            });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken); 

        res.json({
            success: true,
            data: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name,
                picture: decodedToken.picture,
                provider: decodedToken.firebase?.sign_in_provider
            }
        });

    } catch (error) {
        console.error('Firebase token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Token không hợp lệ',
            error: error.code
        });
    }
};

const logout = (req, res) => {
    res.json({
        success: true,
        message: 'Đăng xuất thành công'
    });
};

module.exports = {
    loginWithFirebase,
    verifyFirebaseToken,
    logout
};
