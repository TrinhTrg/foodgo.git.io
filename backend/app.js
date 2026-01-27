var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();
var { sequelize, createDatabase, createTables } = require('./config/database');

// Import Seeders
const categorySeeder = require('./seeders/20250101000001-seed-categories');
const restaurantSeeder = require('./seeders/20250101000002-seed-restaurants-osm');
const userSeeder = require('./seeders/20251121150003-demo-user');



var indexRouter = require('./routes/index');
var userRoutes = require('./routes/userRoutes');
var authRoutes = require('./routes/authRoutes');
var categoryRoutes = require('./routes/categoryRoutes');
var restaurantRoutes = require('./routes/restaurantRoutes');
var adminRoutes = require('./routes/adminRoutes');
var contactRoutes = require('./routes/contactRoutes');
var searchRoutes = require('./routes/searchRoutes');
var favoriteRoutes = require('./routes/favoriteRoutes');
var reviewRoutes = require('./routes/reviewRoutes');
var menuItemRoutes = require('./routes/menuItemRoutes');

var app = express();

// Hàm khởi tạo database
const initializeDatabase = async () => {
  try {
    console.log('Đang khởi tạo database...');
    await createDatabase();     // Tạo database
    await createTables();       // Tạo bảng

    // Chạy seed data sau khi tạo bảng
    await runSeeders();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    console.log('Server sẽ tiếp tục chạy nhưng có thể gặp lỗi database');
  }
};

// Hàm chạy seed data
const runSeeders = async () => {
  try {
    console.log('Đang kiểm tra và chạy seed data...');
    const queryInterface = sequelize.getQueryInterface();
    const { Sequelize } = sequelize;

    // Kiểm tra xem đã có data chưa
    const [categories] = await sequelize.query('SELECT COUNT(*) as count FROM categories');
    const [restaurants] = await sequelize.query('SELECT COUNT(*) as count FROM restaurants');
    const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');

    const categoryCount = categories[0].count;
    const restaurantCount = restaurants[0].count;
    const userCount = users[0].count;

    console.log(`Hiện có: ${categoryCount} categories, ${restaurantCount} restaurants, ${userCount} users`);

    // Chạy seeder theo thứ tự
    if (categoryCount === 0) {
      console.log('Đang seed categories...');
      await categorySeeder.up(queryInterface, Sequelize);
    } else {
      console.log('Categories đã có dữ liệu, bỏ qua');
    }

    if (restaurantCount === 0) {
      console.log('Đang seed restaurants...');
      await restaurantSeeder.up(queryInterface, Sequelize);
    } else {
      console.log('Restaurants đã có dữ liệu, bỏ qua');
    }

    if (userCount === 0) {
      console.log('Đang seed users...');
      await userSeeder.up(queryInterface, Sequelize);
    } else {
      console.log('Users đã có dữ liệu, bỏ qua');
    }

    console.log('Seed data hoàn tất');
  } catch (error) {
    console.error('Lỗi khi chạy seed data:', error.message);
  }
};


// Khởi tạo database
initializeDatabase();

const appPort = process.env.PORT || 3000;
const appHost = process.env.HOST || 'localhost';
// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

console.log(`API server chuẩn bị phục vụ tại http://${appHost}:${appPort}/api`);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api', indexRouter);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // log error
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // return JSON error
  res.status(err.status || 500);
  res.json({
    success: false,
    message: err.message,
    ...(req.app.get('env') === 'development' && { stack: err.stack })
  });
});

// Export app
module.exports = app;