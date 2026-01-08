const nodemailer = require('nodemailer');

// Tạo transporter cho Gmail
// Sử dụng CÙNG LOGIC như contactController để đảm bảo tương thích
const createTransporter = () => {
    // Sử dụng chính xác cùng logic như contactController
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL || 'truongtrinhttt147@gmail.com',
            pass: process.env.ADMIN_PASSWORD ,
        },
    });
};

// Gửi email thông báo phong Owner
const sendOwnerPromotionEmail = async (userEmail, userName) => {
    try {
        const transporter = createTransporter();

        const emailUser = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'truongtrinhttt147@gmail.com';
        const mailOptions = {
            from: `"FoodGo Admin" <${emailUser}>`,
            to: userEmail,
            subject: '🎉 Chúc mừng! Bạn đã được phong làm Owner trên FoodGo',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7c331); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🎉 Chúc mừng ${userName}!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Bạn đã được phong làm Owner trên FoodGo</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Xin chào <strong>${userName}</strong>,
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Chúng tôi vui mừng thông báo rằng tài khoản của bạn đã được nâng cấp lên <strong style="color: #ff6b35;">Owner</strong>!
            </p>
            
            <h3 style="color: #333;">Với quyền Owner, bạn có thể:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Tạo và quản lý nhà hàng của riêng bạn</li>
              <li>Thêm, sửa, xóa các món ăn trong menu</li>
              <li>Theo dõi đánh giá từ khách hàng</li>
              <li>Cập nhật thông tin nhà hàng bất cứ lúc nào</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background: linear-gradient(135deg, #ff6b35, #f7c331); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px;
                        font-weight: bold;
                        display: inline-block;">
                Bắt đầu quản lý nhà hàng ngay
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.<br/>
              © 2024 FoodGo - Khám phá ẩm thực Việt Nam
            </p>
          </div>
        </div>
      `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent successfully to:', userEmail);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Gửi email thông báo từ chối Owner (nếu cần)
const sendRoleDemotionEmail = async (userEmail, userName, newRole) => {
    try {
        const transporter = createTransporter();

        const roleLabels = {
            user: 'Người dùng',
            owner: 'Owner',
            admin: 'Admin'
        };

        const emailUser = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'truongtrinhttt147@gmail.com';
        const mailOptions = {
            from: `"FoodGo Admin" <${emailUser}>`,
            to: userEmail,
            subject: 'Thông báo thay đổi quyền trên FoodGo',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #333; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Thông báo từ FoodGo</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #666; line-height: 1.6;">
              Xin chào <strong>${userName}</strong>,
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Chúng tôi thông báo rằng quyền của bạn trên FoodGo đã được thay đổi thành: 
              <strong style="color: #333;">${roleLabels[newRole] || newRole}</strong>
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Nếu bạn có thắc mắc về việc thay đổi này, vui lòng liên hệ với Admin.
            </p>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              © 2024 FoodGo - Khám phá ẩm thực Việt Nam
            </p>
          </div>
        </div>
      `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent successfully to:', userEmail);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Gửi email mã xác nhận đặt lại mật khẩu (6 chữ số)
const sendPasswordResetCodeEmail = async (userEmail, userName, resetCode) => {
    try {
        // Validate input
        if (!userEmail || !userName || !resetCode) {
            throw new Error('Missing required parameters: userEmail, userName, or resetCode');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            throw new Error('Invalid email format');
        }

        console.log('📧 Attempting to send password reset code email to:', userEmail);
        
        const transporter = createTransporter();

        const emailUser = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'truongtrinhttt147@gmail.com';
        const mailOptions = {
            from: `"FoodGo" <${emailUser}>`,
            to: userEmail,
            subject: '🔐 Mã xác nhận đặt lại mật khẩu - FoodGo',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7c331); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Đặt lại mật khẩu</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #666; line-height: 1.6;">
              Xin chào <strong>${userName}</strong>,
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản FoodGo của mình. Vui lòng sử dụng mã xác nhận 6 chữ số bên dưới để tiếp tục:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: white; border: 3px solid #ff6b35; border-radius: 10px; padding: 20px; display: inline-block;">
                <div style="font-size: 36px; font-weight: bold; color: #ff6b35; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${resetCode}
                </div>
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              <strong>Lưu ý:</strong>
            </p>
            <ul style="color: #666; line-height: 1.8;">
              <li>Mã này có hiệu lực trong <strong>10 phút</strong></li>
              <li>Không chia sẻ mã này với bất kỳ ai</li>
              <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
            </ul>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.<br/>
              © 2024 FoodGo - Khám phá ẩm thực Việt Nam
            </p>
          </div>
        </div>
      `
        };

        // Verify connection trước khi gửi
        await transporter.verify();
        console.log('SMTP connection verified');

        const result = await transporter.sendMail(mailOptions);
        console.log('📧 Password reset code email sent successfully to:', userEmail);
        console.log('📧 Message ID:', result.messageId);
        console.log('📧 Reset code:', resetCode);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending password reset code email:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOwnerPromotionEmail,
    sendRoleDemotionEmail,
    sendPasswordResetCodeEmail
};
