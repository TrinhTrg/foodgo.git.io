const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendPasswordResetCodeEmail } = require('../services/emailService');

// Cấu hình
const ALLOWED_ROLES = ['user', 'owner', 'admin'];
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory storage cho mã reset password (email -> {code, expiresAt, verified})
// Trong production, nên dùng Redis hoặc database
const passwordResetCodes = new Map();

// Hàm tạo mã 6 chữ số
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hàm dọn dẹp mã hết hạn (chạy mỗi phút)
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of passwordResetCodes.entries()) {
    if (data.expiresAt < now) {
      passwordResetCodes.delete(email);
    }
  }
}, 60000); // Chạy mỗi phút

// --- HELPER FUNCTIONS ---

// Tạo Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // Payload chứa userId
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Hàm validate đầu vào (Trả về null nếu OK, trả về string lỗi nếu sai)
const validateRegisterInput = (name, email, password) => {
  if (!name || !email || !password) {
    return 'Tên, email và mật khẩu là bắt buộc';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Định dạng email không hợp lệ';
  }

  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  return null; // Không có lỗi
};

// --- CONTROLLERS ---

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone_number } = req.body;

    // 1. Validate đầu vào
    const errorMsg = validateRegisterInput(name, email, password);
    if (errorMsg) {
      return res.status(400).json({ success: false, message: errorMsg });
    }

    // 2. Validate Role (bảo mật)
    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Role không hợp lệ' });
    }
    const finalRole = role || 'user';

    // 3. Kiểm tra Email tồn tại (Dùng hàm static của Model)
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    // 4. Tạo User (Model User.js đã tự hash password rồi, ko cần làm ở đây)
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: finalRole,
      phone_number: phone_number || null
    });

    // 5. Tạo Token trả về luôn để user đăng nhập ngay
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone_number: user.phone_number
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    // 1. Tìm User
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }

    // 2. So sánh Password (Dùng hàm static của Model)
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }

    // 3. Tạo Token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone_number: user.phone_number
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    // LƯU Ý QUAN TRỌNG: 
    // Middleware auth thường gán userId vào req.userId
    // Nếu middleware gán req.user thì dùng req.user.id
    // Ở đây tôi dùng req.userId cho khớp với hàm generateToken({ userId })
    const userId = req.userId || (req.user && req.user.id);

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.json({ success: true, message: 'Đăng xuất thành công' });
};

// Yêu cầu đặt lại mật khẩu - gửi mã 6 chữ số qua email
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Định dạng email không hợp lệ' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Không tiết lộ email có tồn tại hay không vì lý do bảo mật
      return res.json({ 
        success: true, 
        message: 'Vui lòng kiểm tra email và không chia sẻ mã xác nhận với bất kỳ ai' 
      });
    }

    // Tạo mã 6 chữ số
    const resetCode = generateResetCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 phút

    // Lưu mã vào memory
    passwordResetCodes.set(email.toLowerCase(), {
      code: resetCode,
      expiresAt: expiresAt,
      verified: false
    });

    // Gửi email
    try {
      const emailResult = await sendPasswordResetCodeEmail(email, user.name, resetCode);
      
      if (!emailResult.success) {
        console.error('❌ Failed to send reset code email:', emailResult.error);
        // Log chi tiết để debug
        console.error('Email details:', {
          to: email,
          userName: user.name,
          code: resetCode,
          error: emailResult.error
        });
        // Trả về lỗi thực tế trong development, ẩn trong production
        if (process.env.NODE_ENV === 'development') {
          return res.status(500).json({ 
            success: false, 
            message: `Lỗi gửi email: ${emailResult.error}` 
          });
        }
        // Vẫn trả về success để không tiết lộ lỗi trong production
        return res.json({ 
          success: true, 
          message: 'Vui lòng kiểm tra email và không chia sẻ mã xác nhận với bất kỳ ai' 
        });
      }

      console.log('✅ Password reset code email sent successfully:', {
        to: email,
        userName: user.name,
        code: resetCode,
        messageId: emailResult.messageId
      });

      res.json({ 
        success: true, 
        message: 'Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và không chia sẻ mã với bất kỳ ai.' 
      });
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ 
          success: false, 
          message: `Lỗi gửi email: ${emailError.message}` 
        });
      }
      return res.json({ 
        success: true, 
        message: 'Vui lòng kiểm tra email và không chia sẻ mã xác nhận với bất kỳ ai' 
      });
    }
  } catch (error) {
    next(error);
  }
};

// Xác nhận mã reset password
const verifyPasswordResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mã xác nhận' });
    }

    const storedData = passwordResetCodes.get(email.toLowerCase());
    
    if (!storedData) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
    }

    if (storedData.expiresAt < Date.now()) {
      passwordResetCodes.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'Mã xác nhận đã hết hạn' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không đúng' });
    }

    // Đánh dấu mã đã được xác nhận
    storedData.verified = true;

    res.json({ 
      success: true, 
      message: 'Mã xác nhận hợp lệ. Bạn có thể đặt lại mật khẩu.' 
    });
  } catch (error) {
    next(error);
  }
};

// Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
const checkPasswordMatch = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại' });
    }

    // Kiểm tra nếu user không có password (Firebase users)
    if (!user.password) {
      return res.json({ success: true, isMatch: false, message: 'User không có mật khẩu cũ' });
    }

    // So sánh mật khẩu mới với mật khẩu cũ
    const isMatch = await User.comparePassword(newPassword, user.password);

    if (isMatch) {
      return res.json({ 
        success: true, 
        isMatch: true, 
        message: 'Mật khẩu mới trùng với mật khẩu cũ' 
      });
    }

    return res.json({ 
      success: true, 
      isMatch: false, 
      message: 'Mật khẩu mới khác với mật khẩu cũ' 
    });
  } catch (error) {
    next(error);
  }
};

// Đặt lại mật khẩu sau khi xác nhận mã
const resetPasswordWithCode = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const storedData = passwordResetCodes.get(email.toLowerCase());
    
    if (!storedData) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
    }

    if (storedData.expiresAt < Date.now()) {
      passwordResetCodes.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'Mã xác nhận đã hết hạn' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không đúng' });
    }

    if (!storedData.verified) {
      return res.status(400).json({ success: false, message: 'Vui lòng xác nhận mã trước' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại' });
    }

    // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
    if (user.password) {
      const isMatch = await User.comparePassword(newPassword, user.password);
      if (isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mật khẩu mới không được trùng với mật khẩu cũ. Vui lòng chọn mật khẩu khác.' 
        });
      }
    }

    // Cập nhật mật khẩu
    await User.updatePasswordByEmail(email, newPassword);

    // Xóa mã đã sử dụng
    passwordResetCodes.delete(email.toLowerCase());

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};

// Hàm cũ - giữ lại để tương thích (deprecated)
const forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Thông tin không hợp lệ' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại' });
    }

    // Model User.js đã có hàm updatePasswordByEmail tự hash pass mới
    await User.updatePasswordByEmail(email, newPassword);

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId || (req.user && req.user.id);
    const { name, phone_number } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    // Validate và cập nhật
    const updateData = {};
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Tên không được để trống' });
      }
      updateData.name = name.trim();
    }

    if (phone_number !== undefined) {
      // Validate phone number format (optional, có thể để null)
      if (phone_number && phone_number.trim()) {
        // Basic validation: chỉ cho phép số, dấu +, dấu cách, dấu gạch ngang
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(phone_number.trim())) {
          return res.status(400).json({ 
            success: false, 
            message: 'Số điện thoại không hợp lệ' 
          });
        }
        updateData.phone_number = phone_number.trim();
      } else {
        updateData.phone_number = null;
      }
    }

    // Cập nhật user
    await user.update(updateData);

    // Lấy lại user với phone_number
    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    next(error);
  }
};

const healthCheck = (req, res) => {
  res.json({ success: true, message: 'Users API is working' });
};

// Xuất ra một object gọn gàng
module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  forgotPassword, // Deprecated - giữ lại để tương thích
  requestPasswordReset,
  verifyPasswordResetCode,
  checkPasswordMatch,
  resetPasswordWithCode,
  healthCheck,
  passwordResetCodes, // Export để admin dashboard có thể xem
};