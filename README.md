# 🍜 FoodGo - Ứng Dụng Khám Phá Ẩm Thực

> Ứng dụng tìm hiểu và khám phá ẩm thực đầu tiên tại Việt Nam. Mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất.

---

## 📸 Demo

### 🎥 Video Demo
[
https://drive.google.com/drive/folders/1HOhqYN4A0BQ5NCv2hGPQVnX11f_WZu1A?usp=sharing
]


### 📷 Screenshots

#### Trang Chủ
[<img width="1900" height="864" alt="image" src="https://github.com/user-attachments/assets/c055f2ba-ffb1-4482-8b53-8e5f18de173c" />]

#### Trang Khám Phá

[<img width="1907" height="871" alt="image" src="https://github.com/user-attachments/assets/4c0c4c5e-11af-463b-97a3-bae782239a66" />
]

#### Bản Đồ Tương Tác (leaflet & markers)

[<img width="1344" height="755" alt="image" src="https://github.com/user-attachments/assets/578e0b89-9dd4-4745-ac54-30210e83bf43" />]

#### Chi Tiết Nhà Hàng

[<img width="1906" height="866" alt="image" src="https://github.com/user-attachments/assets/d5cd5b96-f165-4a1d-b1e3-a45e81bd8bee" />]


#### Đánh Giá & Review

[<img width="492" height="733" alt="image" src="https://github.com/user-attachments/assets/6cee26cc-be0a-4204-833b-131e91a5c185" />]

[<img width="1907" height="876" alt="image" src="https://github.com/user-attachments/assets/9c06cfb1-aa5d-4877-bf68-c4d17dc8a1ff" />]


## 📋 Tổng Quan Dự Án

FoodGo là một nền tảng web giúp người dùng khám phá, tìm kiếm và chia sẻ trải nghiệm về các địa điểm ăn uống tại Việt Nam. Ứng dụng tích hợp bản đồ tương tác, hệ thống đánh giá, và tính năng tìm kiếm thông minh.

---

## ✨ Tính Năng Chính

### 🔍 Tìm Kiếm & Khám Phá
- Tìm kiếm nhà hàng, món ăn theo tên, danh mục
- Bản đồ tương tác với Leaflet hiển thị vị trí nhà hàng
- Lọc theo danh mục (đồ ăn, đồ uống, món tráng miệng)
- Tìm kiếm theo vị trí địa lý

### 🗺️ Bản Đồ Tương Tác
- Hiển thị nhà hàng trên bản đồ với GeoJSON
- Tích hợp OpenStreetMap
- Tìm kiếm theo vị trí hiện tại
- Xem chi tiết nhà hàng từ marker trên bản đồ

### ⭐ Đánh Giá & Review
- Xem và viết đánh giá nhà hàng
- Upload ảnh kèm review
- Xếp hạng theo sao (1-5 sao)
- Xem đánh giá của người dùng khác

### ❤️ Yêu Thích & Bộ Sưu Tập
- Lưu nhà hàng vào danh sách yêu thích
- Tạo và quản lý bộ sưu tập cá nhân
- Chia sẻ bộ sưu tập với cộng đồng

### 👤 Quản Lý Người Dùng
- Đăng ký, đăng nhập với Firebase Authentication
- Quản lý hồ sơ cá nhân
- Quên mật khẩu và đặt lại mật khẩu
- Phân quyền Admin

### 🏪 Quản Lý Nhà Hàng
- Tạo địa điểm nhà hàng mới (cần quyền)
- Xem menu và thông tin chi tiết
- Xem giờ mở cửa
- Xem đánh giá và rating trung bình

### 👨‍💼 Admin Dashboard
- Quản lý người dùng
- Quản lý nhà hàng và danh mục
- Duyệt và quản lý đánh giá
- Thống kê và báo cáo

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 19** - UI Framework
- **React Router DOM** - Điều hướng
- **Leaflet & React-Leaflet** - Bản đồ tương tác
- **Firebase** - Authentication
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js & Express** - Server framework
- **MySQL** - Database
- **Sequelize** - ORM
- **Firebase Admin** - Backend authentication
- **Multer** - File upload
- **JWT** - Token authentication
- **Nodemailer** - Email service

### Database
- **MySQL** - Relational database
- **Sequelize Migrations** - Database versioning

---

## 📁 Cấu Trúc Dự Án

```
FoodGo/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/        # Static assets
│
├── backend/           # Express backend API
│   ├── controllers/   # Route controllers
│   ├── models/        # Sequelize models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── migrations/    # Database migrations
│   ├── seeders/       # Database seeders
│   └── services/      # Business logic services
│
└── README.md          # This file
```

---

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống
- Node.js (v16 trở lên)
- MySQL (v8 trở lên)
- npm hoặc yarn

### Cài Đặt Backend

```bash
cd backend
npm install

# Cấu hình database trong config/config.json
# Thêm file .env với các biến môi trường cần thiết

# Chạy migrations
npx sequelize-cli db:migrate

# Chạy seeders (tùy chọn)
npx sequelize-cli db:seed:all

# Khởi động server
npm run dev
```

Backend sẽ chạy tại `http://localhost:3000`

### Cài Đặt Frontend

```bash
cd frontend
npm install

# Cấu hình Firebase trong src/config/firebase.js

# Khởi động development server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

### Build Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

---

## 🔧 Cấu Hình

### Backend Environment Variables
Tạo file `.env` trong thư mục `backend/`:

```env
PORT=3000
HOST=localhost
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=foodgo
JWT_SECRET=your_jwt_secret
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccountKey.json
```

### Frontend Firebase Config
Cấu hình Firebase trong `frontend/src/config/firebase.js` với thông tin từ Firebase Console.

---

## 📊 Database Schema

### Các Bảng Chính
- **Users** - Thông tin người dùng
- **Restaurants** - Thông tin nhà hàng
- **Categories** - Danh mục (đồ ăn, đồ uống, etc.)
- **RestaurantCategories** - Quan hệ nhiều-nhiều giữa nhà hàng và danh mục
- **Reviews** - Đánh giá nhà hàng
- **ImageReviews** - Ảnh kèm review
- **MenuItems** - Món ăn trong menu
- **FavoritePlaces** - Nhà hàng yêu thích
- **RestaurantViews** - Lượt xem nhà hàng

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu

### Restaurants
- `GET /api/restaurants` - Lấy danh sách nhà hàng
- `GET /api/restaurants/:id` - Chi tiết nhà hàng
- `POST /api/restaurants` - Tạo nhà hàng mới (cần auth)

### Reviews
- `GET /api/reviews/restaurant/:id` - Lấy reviews của nhà hàng
- `POST /api/reviews` - Tạo review mới (cần auth)

### Search
- `GET /api/search` - Tìm kiếm nhà hàng/món ăn

### Favorites
- `GET /api/favorites` - Lấy danh sách yêu thích
- `POST /api/favorites` - Thêm vào yêu thích
- `DELETE /api/favorites/:id` - Xóa khỏi yêu thích

---

## 👥 Người Dùng Demo

Sau khi chạy seeder, có thể đăng nhập với tài khoản demo:
- Email: `demo@example.com`
- Password: `demo123`

---

## 📝 Ghi Chú

- Dữ liệu nhà hàng được seed từ OpenStreetMap
- GeoJSON files được lưu trong `backend/public/geojson/`
- Upload files được lưu trong `backend/public/uploads/`

---

## 🔐 Bảo Mật

- JWT tokens cho authentication
- Bcrypt cho password hashing
- CORS được cấu hình cho frontend
- File upload validation
- Admin routes được bảo vệ

---
## Test API by Postman 
- Link : https://truongtrinhttt147-6449787.postman.co/workspace/Trinh-T's-Workspace~82859a28-626f-476c-8219-62fb1f07ff71/collection/49560645-3ce550b5-c0a6-4655-9e84-e2e39dc61722?action=share&creator=49560645&active-environment=49560645-672ed582-c583-42ff-ad3f-278b2ee16788

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu môn Advanced Web Design.

---


