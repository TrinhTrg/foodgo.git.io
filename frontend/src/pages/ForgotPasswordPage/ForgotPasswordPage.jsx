// src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './ForgotPasswordPage.module.css';
import { FaEnvelope, FaCheckCircle, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getStoredEmails, saveEmail, filterEmails } from '../../utils/emailStorage';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 phút = 600 giây
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [passwordMatchWarning, setPasswordMatchWarning] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPassword, setPendingPassword] = useState('');
  const codeInputRefs = useRef([]);
  const emailInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const { requestPasswordReset, verifyPasswordResetCode, checkPasswordMatch, resetPasswordWithCode } = useAuth();
  const navigate = useNavigate();

  // 
  useEffect(() => {
    const storedEmails = getStoredEmails();
    setEmailSuggestions(storedEmails);
  }, []);

  // Đóng suggestions khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        emailInputRef.current &&
        !emailInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý thay đổi email với autocomplete
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Hiển thị suggestions
    if (value.length > 0) {
      const filtered = filterEmails(value);
      setEmailSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      const allEmails = getStoredEmails();
      setEmailSuggestions(allEmails);
      setShowSuggestions(allEmails.length > 0);
    }
  };

  // Chọn email từ suggestions
  const handleSelectEmail = (selectedEmail) => {
    setEmail(selectedEmail);
    setShowSuggestions(false);
    emailInputRef.current?.focus();
  };

  // Xử lý focus vào email input
  const handleEmailFocus = () => {
    if (email.length === 0) {
      const allEmails = getStoredEmails();
      setEmailSuggestions(allEmails);
      setShowSuggestions(allEmails.length > 0);
    } else {
      const filtered = filterEmails(email);
      setEmailSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowSuggestions(false);

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);

    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      // Lưu email vào lịch sử
      saveEmail(email);
      setSuccess(result.message || 'Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      setStep(2);
      setTimeRemaining(600); // Reset về 10 phút
      setCodeExpiresAt(Date.now() + 600000); // 10 phút từ bây giờ
      setCodeDigits(['', '', '', '', '', '']); // Reset code
      // Focus vào ô đầu tiên
      setTimeout(() => {
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus();
        }
      }, 100);
    } else {
      setError(result.message || 'Gửi mã xác nhận thất bại');
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (step === 2 && codeExpiresAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((codeExpiresAt - Date.now()) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, codeExpiresAt]);

  // Handle code digit input
  const handleCodeDigitChange = (index, value) => {
    // Chỉ cho phép số
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);

    // Auto focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // Auto submit khi đủ 6 số
    if (newDigits.every(d => d !== '') && index === 5) {
      const fullCode = newDigits.join('');
      handleCodeSubmit(fullCode);
    }
  };

  // Handle backspace
  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const digits = pastedData.split('');
      setCodeDigits(digits);
      // Focus vào ô cuối
      codeInputRefs.current[5]?.focus();
      // Auto submit
      setTimeout(() => {
        handleCodeSubmit(pastedData);
      }, 100);
    }
  };

  const handleCodeSubmit = async (e = null) => {
    if (e) e.preventDefault();
    
    const codeToVerify = codeDigits.join('');
    
    if (!codeToVerify || codeToVerify.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số');
      return;
    }

    if (!/^\d{6}$/.test(codeToVerify)) {
      setError('Mã xác nhận phải là 6 chữ số');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const result = await verifyPasswordResetCode(email, codeToVerify);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message || 'Mã xác nhận hợp lệ. Vui lòng đặt mật khẩu mới.');
      setStep(3);
    } else {
      setError(result.message || 'Mã xác nhận không hợp lệ');
      // Clear code on error
      setCodeDigits(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    }
  };

  // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
  useEffect(() => {
    const checkPassword = async () => {
      if (step !== 3 || !newPassword || newPassword.length < 6) {
        setPasswordMatchWarning(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordMatchWarning(false);
        return;
      }

      try {
        const result = await checkPasswordMatch(email, newPassword);
        if (result.success && result.isMatch) {
          setPasswordMatchWarning(true);
        } else {
          setPasswordMatchWarning(false);
        }
      } catch (error) {
        // Nếu lỗi, không hiển thị warning
        setPasswordMatchWarning(false);
      }
    };

    // Debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(checkPassword, 500);
    return () => clearTimeout(timeoutId);
  }, [newPassword, confirmPassword, email, step, checkPasswordMatch]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Nếu mật khẩu trùng với mật khẩu cũ, hiển thị confirmation dialog
    if (passwordMatchWarning) {
      setPendingPassword(newPassword);
      setShowConfirmDialog(true);
      return;
    }

    // Nếu không trùng, tiếp tục đặt lại mật khẩu
    await proceedWithPasswordReset(newPassword);
  };

  const proceedWithPasswordReset = async (password) => {
    setLoading(true);
    setError('');
    setSuccess('');

    const resetCode = codeDigits.join('');
    const result = await resetPasswordWithCode(email, resetCode, password);
    setLoading(false);

    if (result.success) {
      setSuccess('Đặt lại mật khẩu thành công!');
      setTimeout(() => {
        navigate('/dang-nhap');
      }, 2000);
    } else {
      setError(result.message || 'Đặt lại mật khẩu thất bại');
    }
  };

  const handleConfirmDialog = async () => {
    setShowConfirmDialog(false);
    await proceedWithPasswordReset(pendingPassword);
  };

  const handleCancelDialog = () => {
    setShowConfirmDialog(false);
    setPendingPassword('');
    setPasswordMatchWarning(false);
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setCodeDigits(['', '', '', '', '', '']);
    setLoading(true);
    
    const result = await requestPasswordReset(email);
    setLoading(false);
    
    if (result.success) {
      setSuccess(result.message || 'Mã xác nhận mới đã được gửi đến email của bạn.');
      setTimeRemaining(600);
      setCodeExpiresAt(Date.now() + 600000);
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    } else {
      setError(result.message || 'Gửi lại mã thất bại');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.forgotPasswordContainer}>
        {/* Back Button */}
        <div className={styles.backButtonWrapper}>
          <button 
            className={styles.backButton}
            onClick={() => navigate(-1)}
            title="Quay lại"
          >
            <FaArrowLeft /> Quay lại
          </button>
        </div>
        
        <div className={styles.forgotPasswordCard}>
          {step === 2 ? (
            <div className={styles.otpTitleBox}>
              <h1 className={styles.otpTitle}>OTP</h1>
            </div>
          ) : (
            <h1 className={styles.title}>Quên mật khẩu</h1>
          )}
          <p className={styles.subtitle}>
            {step === 1 
              ? 'Nhập email để nhận mã xác nhận đặt lại mật khẩu' 
              : step === 2
              ? `Bạn sẽ nhận được mã OTP từ FoodGo đến tài khoản ${email}`
              : 'Đặt mật khẩu mới cho tài khoản của bạn'
            }
          </p>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <FaEnvelope className={styles.inputIcon} />
                <input
                  ref={emailInputRef}
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={() => {
                    // Delay để cho phép click vào suggestions
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className={styles.input}
                  disabled={loading}
                  autoComplete="email"
                />
                
                {/* Email Suggestions Dropdown */}
                {showSuggestions && emailSuggestions.length > 0 && (
                  <div ref={suggestionsRef} className={styles.suggestionsList}>
                    {emailSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={styles.suggestionItem}
                        onClick={() => handleSelectEmail(suggestion)}
                        onMouseDown={(e) => e.preventDefault()} // Prevent blur
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Đang gửi mã...' : 'Gửi mã xác nhận'}
              </button>
            </form>
          ) : step === 2 ? (
            <div className={styles.otpContainer}>
              <form onSubmit={handleCodeSubmit} className={styles.otpForm}>
                {/* 6 OTP Input Boxes */}
                <div className={styles.otpInputContainer}>
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (codeInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={index === 0 ? handleCodePaste : undefined}
                      className={styles.otpInput}
                      disabled={loading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Countdown Timer */}
                <div className={styles.countdownContainer}>
                  <p className={styles.countdownText}>
                    Xác thực sẽ hết hạn sau{' '}
                    <span className={styles.countdownTime}>
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </p>
                </div>

                {/* Confirm Button */}
                <button
                  type="submit"
                  className={styles.confirmButton}
                  disabled={loading || codeDigits.join('').length !== 6}
                >
                  {loading ? 'Đang xác nhận...' : 'Xác nhận'}
                </button>

                {/* Resend Code Link */}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className={styles.resendLink}
                  disabled={loading}
                >
                  Gửi lại mã OTP
                </button>
              </form>
            </div>
          ) : (
            <>
              <form onSubmit={handlePasswordSubmit} className={styles.form}>
                {passwordMatchWarning && (
                  <div className={styles.passwordWarning}>
                    <p className={styles.warningText}>
                      ⚠️ Mật khẩu này đã từng được sử dụng. Vì lý do bảo mật, bạn nên chọn mật khẩu khác.
                    </p>
                  </div>
                )}
                <div className={styles.inputGroup}>
                  <FaCheckCircle className={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.input}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className={styles.inputGroup}>
                  <FaCheckCircle className={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </form>

              {/* Confirmation Dialog */}
              {showConfirmDialog && (
                <div className={styles.dialogOverlay}>
                  <div className={styles.dialogContent}>
                    <h3 className={styles.dialogTitle}>⚠️ Cảnh báo bảo mật</h3>
                    <p className={styles.dialogMessage}>
                      Mật khẩu bạn đang sử dụng đã từng được sử dụng trước đó. 
                      Để tăng cường bảo mật, chúng tôi khuyến nghị bạn chọn mật khẩu mới.
                    </p>
                    <p className={styles.dialogQuestion}>
                      Bạn có chắc chắn muốn tiếp tục sử dụng mật khẩu này không?
                    </p>
                    <div className={styles.dialogActions}>
                      <button
                        type="button"
                        className={styles.dialogCancelButton}
                        onClick={handleCancelDialog}
                        disabled={loading}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className={styles.dialogConfirmButton}
                        onClick={handleConfirmDialog}
                        disabled={loading}
                      >
                        {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className={styles.footer}>
            <p>
              Nhớ mật khẩu?{' '}
              <Link to="/dang-nhap" className={styles.link}>
                Đăng nhập ngay
              </Link>
            </p>
            <p>
              Chưa có tài khoản?{' '}
              <Link to="/dang-ky" className={styles.link}>
                Đăng ký tại đây
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;