# 🍔 FoodGo Backend API

Backend API cho ứng dụng FoodGo - Nền tảng khám phá và đánh giá nhà hàng.

## 📋 Mục lục

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Chạy ứng dụng](#chạy-ứng-dụng)

## 🛠️ Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM cho MySQL
- **MySQL** - Database
- **JWT** - Authentication
- **Firebase Admin** - Social authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📦 Cài đặt

### 1. Khởi tạo dự án

```bash
# Tạo package.json
npm init -y

# Cài đặt dependencies chính
npm install express cors dotenv sequelize mysql2 body-parser bcryptjs jsonwebtoken multer morgan cookie-parser firebase-admin

# Cài đặt dev dependencies
npm install --save-dev sequelize-cli nodemon
```

### 2. Khởi tạo Sequelize

```bash
# Tạo cấu trúc thư mục cho Sequelize
npx sequelize-cli init
```

Lệnh này sẽ tạo các thư mục:
- `config/` - Cấu hình database
- `models/` - Định nghĩa models
- `migrations/` - Migration files
- `seeders/` - Seed data

### 3. Cấu hình biến môi trường

Tạo file `.env` trong thư mục `backend/`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=FoodGo

# Server Configuration
PORT=3000
HOST=localhost
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Firebase (nếu sử dụng Firebase Auth)
FIREBASE_PROJECT_ID=your_project_id
```

### 4. Cài đặt MySQL

Đảm bảo MySQL đã được cài đặt và chạy trên máy:

```bash
# Kiểm tra MySQL service
# Windows: Mở Services và tìm MySQL
# Linux/Mac: 
sudo service mysql status
```
## 🗄️ Database

### Tạo Database và Tables

Backend tự động tạo database và tables khi khởi động:

```javascript
// Trong app.js
const initializeDatabase = async () => {
  await createDatabase();  // Tạo database nếu chưa tồn tại
  await createTables();    // Tạo/cập nhật tables từ models
};
```

### Models và Relationships

**User Model:**
- Lưu thông tin người dùng
- Hỗ trợ cả local auth và Firebase auth
- Fields: `name`, `email`, `password`, `firebase_uid`, `auth_provider`, `avatar`, `role`, `phone_number`

**Restaurant Model:**
- Thông tin nhà hàng
- Fields: `name`, `address`, `description`, `latitude`, `longitude`, `average_rating`, `review_count`, `image_url`, `status`, `opening_hours`, `phone_number`, `website`
- Relationships: belongsTo User (owner), belongsTo Category, belongsToMany Categories

**Category Model:**
- Danh mục nhà hàng
- Relationships: hasMany Restaurants, belongsToMany Restaurants

**Review Model:**
- Đánh giá của user cho restaurant
- Fields: `rating` (1-5), `content`
- Relationships: belongsTo User, belongsTo Restaurant, hasMany ImageReview

**MenuItem Model:**
- Món ăn của nhà hàng
- Fields: `name`, `description`, `price`, `image_url`, `is_available`

**FavoritePlace Model:**
- Nhà hàng yêu thích của user
- Relationships: belongsTo User, belongsTo Restaurant

**RestaurantView Model:**
- Lịch sử xem nhà hàng
- Fields: `user_id`, `restaurant_id`, `viewed_at`

### Migrations vs Models

**Sự khác biệt quan trọng:**

1. **Models** (`models/*.js`):
   - Định nghĩa cấu trúc dữ liệu cho Sequelize ORM
   - Sử dụng trong code để query database
   - Tự động sync với database qua `sequelize.sync()`

2. **Migrations** (`migrations/*.js`):
   - Quản lý version control cho database schema
   - Chạy thủ công qua Sequelize CLI
   - Tốt cho production environment

**Trong dự án này:**
- Sử dụng **Models với auto-sync** cho development
- Migrations có sẵn nếu cần deploy production

### Chạy Migrations (Tùy chọn)

Nếu muốn sử dụng migrations thay vì auto-sync:

```bash
# Chạy tất cả migrations
npx sequelize-cli db:migrate

# Rollback migration gần nhất
npx sequelize-cli db:migrate:undo

# Rollback tất cả migrations
npx sequelize-cli db:migrate:undo:all

# Tạo migration mới
npx sequelize-cli migration:generate --name migration-name
```

### Tạo Model mới

```bash
# Tạo model và migration
npx sequelize-cli model:generate --name ModelName --attributes field1:string,field2:integer

### Seeders (Dữ liệu mẫu)

```bash
# Chạy tất cả seeders
npx sequelize-cli db:seed:all

# Chạy seeder cụ thể
npx sequelize-cli db:seed --seed seeder-file-name

# Rollback seeders
npx sequelize-cli db:seed:undo:all

# Tạo seeder mới
npx sequelize-cli seed:generate --name demo-data
```

## Chạy ứng dụng

### Development Mode (khởi tạo db và tables khi chạy)

```bash
# Sử dụng nodemon (auto-restart khi có thay đổi)
npm run dev

# Hoặc chạy trực tiếp
node app.js
```

### Production Mode

```bash
npm start
```

### Scripts trong package.json

```json
{
  "scripts": {
    "start": "node ./bin/www",
    "dev": "nodemon ./bin/www",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/firebase-login` - Đăng nhập qua Firebase (Google, Facebook, etc.)
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

### Users (`/api/users`)

- `GET /api/users/profile` - Lấy thông tin profile (cần auth)
- `PUT /api/users/profile` - Cập nhật profile (cần auth)
- `PUT /api/users/change-password` - Đổi mật khẩu (cần auth)

### Restaurants (`/api/restaurants`)

- `GET /api/restaurants` - Lấy danh sách nhà hàng (có filter, pagination)
- `GET /api/restaurants/:id` - Lấy chi tiết nhà hàng
- `POST /api/restaurants` - Tạo nhà hàng mới (cần auth)
- `PUT /api/restaurants/:id` - Cập nhật nhà hàng (cần auth, owner only)
- `DELETE /api/restaurants/:id` - Xóa nhà hàng (cần auth, admin only)
- `GET /api/restaurants/nearby` - Tìm nhà hàng gần vị trí hiện tại

### Categories (`/api/categories`)

- `GET /api/categories` - Lấy danh sách categories
- `GET /api/categories/:id` - Lấy chi tiết category
- `POST /api/categories` - Tạo category mới (admin only)
- `PUT /api/categories/:id` - Cập nhật category (admin only)
- `DELETE /api/categories/:id` - Xóa category (admin only)

### Reviews (`/api/reviews`)

- `GET /api/reviews/restaurant/:restaurantId` - Lấy reviews của nhà hàng
- `POST /api/reviews` - Tạo review mới (cần auth)
- `PUT /api/reviews/:id` - Cập nhật review (cần auth, owner only)
- `DELETE /api/reviews/:id` - Xóa review (cần auth, owner/admin only)

### Favorites (`/api/favorites`)

- `GET /api/favorites` - Lấy danh sách yêu thích (cần auth)
- `POST /api/favorites` - Thêm vào yêu thích (cần auth)
- `DELETE /api/favorites/:restaurantId` - Xóa khỏi yêu thích (cần auth)

### Menu Items (`/api/menu-items`)

- `GET /api/menu-items/restaurant/:restaurantId` - Lấy menu của nhà hàng
- `POST /api/menu-items` - Thêm món mới (cần auth, owner only)
- `PUT /api/menu-items/:id` - Cập nhật món (cần auth, owner only)
- `DELETE /api/menu-items/:id` - Xóa món (cần auth, owner only)

### Search (`/api/search`)

- `GET /api/search?q=keyword` - Tìm kiếm nhà hàng, món ăn

### Admin (`/api/admin`)

- `GET /api/admin/restaurants/pending` - Lấy nhà hàng chờ duyệt
- `PUT /api/admin/restaurants/:id/approve` - Duyệt nhà hàng
- `GET /api/admin/users` - Quản lý users
- `GET /api/admin/statistics` - Thống kê hệ thống

### Contact (`/api/contact`)

- `POST /api/contact` - Gửi liên hệ

### Health Check

- `GET /api/health` - Kiểm tra server status

## Authentication

### JWT Authentication

```javascript
// Header format
Authorization: Bearer <token>
```

### Firebase Authentication

Hỗ trợ đăng nhập qua:
- Google
- Facebook (chưa hoạt động)

##  Logging

- Sử dụng `morgan` middleware cho HTTP request logging
- Sequelize logging được bật trong development mode
- Console logs cho database initialization

## Configuration Files

### `config/database.js`
- Cấu hình database chính
- Load models và associations
- Hàm `createDatabase()` và `createTables()`

### `config/config.json`
- Cấu hình cho Sequelize CLI (migrations)
- Có thể khác với database.js

### `.env`
- Biến môi trường
- **KHÔNG commit file này lên Git**

## Debugging

### Kiểm tra kết nối database

```javascript
// Trong code
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Cannot connect:', err));
```

### Bật Sequelize logging

```javascript
// Trong config/database.js
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  logging: console.log  // Hiển thị SQL queries
});
```

### Common Issues

**1. Cannot connect to MySQL:**
- Kiểm tra MySQL service đang chạy
- Kiểm tra credentials trong `.env`
- Kiểm tra port 3306 không bị block

**2. Tables không được tạo:**
- Đảm bảo models được load đúng trong `config/database.js`
- Kiểm tra `sequelize.sync()` được gọi
- Xem logs để tìm lỗi SQL

**3. CORS errors:**
- Kiểm tra `FRONTEND_URL` trong `.env`
- Đảm bảo CORS middleware được cấu hình đúng

## 📚 Tài liệu tham khảo

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## 👨‍💻 Developer Notes

### Code Style
- Sử dụng async/await cho asynchronous operations
- Error handling với try-catch
- Consistent naming conventions

### Best Practices
- Validate input data
- Hash passwords trước khi lưu
- Sử dụng transactions cho multiple database operations
- Implement proper error messages

---