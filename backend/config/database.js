const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Tạo kết nối đến MySQL (root connection để tạo database)
const rootConnection = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false,
});

// Kết nối đến database chính
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log, // Bật logging để debug
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// Object chứa tất cả models
const db = {};

// Load tất cả models từ thư mục models
const modelsPath = path.join(__dirname, '../models');
const modelFiles = fs.readdirSync(modelsPath)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  });

// Import từng model
modelFiles.forEach(file => {
  const model = require(path.join(modelsPath, file))(sequelize, DataTypes);
  db[model.name] = model;
  console.log(`✓ Loaded model: ${model.name}`);
});

// Thiết lập associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`✓ Associated model: ${modelName}`);
  }
});

// Thêm sequelize instance vào db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Hàm tạo database
const createDatabase = async () => {
  try {
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`
    );
    console.log('✓ Database created or already exists');
  } catch (err) {
    console.error('✗ Cannot create database:', err.message);
    throw err;
  }
};

// Hàm tạo bảng từ models
const createTables = async () => {
  try {
    console.log('📋 Models loaded:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));

    // Sync tất cả models với database
    // alter: true sẽ cập nhật cấu trúc bảng nếu có thay đổi
    await sequelize.sync({ alter: true });

    console.log('✓ All tables created/updated successfully');
  } catch (err) {
    console.error('✗ Cannot create tables:', err.message);
    console.error('Stack:', err.stack);
    throw err;
  }
};

module.exports = {
  sequelize,
  db,              // Export db object chứa tất cả models
  createDatabase,
  createTables
};