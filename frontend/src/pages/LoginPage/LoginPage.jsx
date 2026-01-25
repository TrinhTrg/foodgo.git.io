import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './LoginPage.module.css';
import { FaUser, FaLock, FaGoogle, FaFacebook, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getStoredEmails, saveEmail, filterEmails } from '../../utils/emailStorage';

// Import thêm từ config
import { auth, googleProvider, facebookProvider } from '../../config/firebase';
import { signInWithPopup } from 'firebase/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const emailInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const { login, loginWithFirebase } = useAuth(); // Lấy thêm loginWithFirebase
  const navigate = useNavigate();

  // Load email suggestions khi component mount
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowSuggestions(false);
    setLoading(true);

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Lưu email vào lịch sử
      saveEmail(email);
      navigate('/');
    } else {
      setError(result.message || 'Đăng nhập thất bại');
    }
  };

  const handleSocialLogin = async (platform) => {
    setError('');

    try {
      let provider;
      if (platform === 'Google') provider = googleProvider;
      else if (platform === 'Facebook') provider = facebookProvider;
      else {
        alert('Chức năng đăng nhập bằng ' + platform + ' đang phát triển');
        return;
      }

      // 1. Login với Firebase Popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. Lấy Token
      const idToken = await user.getIdToken();
      console.log('Firebase ID Token:', idToken);

      // 3. Gửi Token lên Backend
      setLoading(true);
      const loginResult = await loginWithFirebase(idToken);
      setLoading(false);

      if (loginResult.success) {
        // Lưu email vào lịch sử
        if (user.email) {
          saveEmail(user.email);
        }
        navigate('/');
      } else {
        setError(loginResult.message || 'Lỗi kết nối server');
      }

    } catch (err) {
      console.error('Social Login Error:', err);
      // Xử lý các lỗi thường gặp của Firebase
      if (err.code === 'auth/popup-closed-by-user') {
        return; // User tự đóng popup, ko cần báo lỗi
      }
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Email này đã được đăng ký với phương thức đăng nhập khác');
        return;
      }
      setError('Đăng nhập thất bại: ' + err.message);
    }
  };

  return (
    // ... code render giữ nguyên

    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.loginContainer}>
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

        <div className={styles.loginCard}>
          <h1 className={styles.title}>Đăng nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn trở lại!</p>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup} style={{ position: 'relative' }}>
              <FaUser className={styles.inputIcon} />
              <input
                ref={emailInputRef}
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                onFocus={handleEmailFocus}
                onBlur={() => {
                  // Delay để cho phép click vào suggestions
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className={styles.input}
                disabled={loading}
                required
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

            <div className={styles.inputGroup}>
              <FaLock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div className={styles.forgotPasswordLink}>
              <Link to="/quen-mat-khau" className={styles.forgotLink}>
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>Hoặc đăng nhập bằng</span>
          </div>

          <div className={styles.socialButtons}>
            <button
              className={`${styles.socialButton} ${styles.google}`}
              onClick={() => handleSocialLogin('Google')}
              title="Google"
            >
              <FaGoogle />
            </button>
            <button
              className={`${styles.socialButton} ${styles.facebook}`}
              onClick={() => handleSocialLogin('Facebook')}
              title="Facebook"
            >
              <FaFacebook />
            </button>
          </div>

          <div className={styles.footer}>
            <p>
              Chưa có tài khoản?{' '}
              <Link to="/dang-ky" className={styles.link}>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;