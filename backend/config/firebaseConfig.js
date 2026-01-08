'use strict';

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!admin.apps.length) { // nếu chưa khởi tạo app nào
    try {
        const serviceAccount = require(serviceAccountPath); // Đảm bảo file serviceAccountKey.json tồn tại

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount) // Sử dụng chứng chỉ từ file JSON
        });
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error.message);
        throw error;
    }
}

module.exports = admin;
