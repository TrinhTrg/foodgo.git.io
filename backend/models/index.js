'use strict';
// Import db object từ config/database.js
// Đây là single source of truth cho tất cả models
const { db, sequelize, Sequelize } = require('../config/database');

// Export db object đã được load đầy đủ models và associations
module.exports = db;

