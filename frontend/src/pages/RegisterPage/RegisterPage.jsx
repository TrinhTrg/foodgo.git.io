import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './RegisterPage.module.css';
import { FaUser, FaLock, FaPhone, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getStoredEmails, saveEmail, filterEmails } from '../../utils/emailStorage';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const emailInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const { register } = useAuth();
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

  // Validate từng trường
  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };
    
    switch (fieldName) {
      case 'name':
        if (!value || value.trim().length === 0) {
          errors.name = 'Họ và tên là bắt buộc';
        } else if (value.trim().length < 2) {
          errors.name = 'Họ và tên phải có ít nhất 2 ký tự';
        } else {
          delete errors.name;
        }
        break;
        
      case 'email':
        if (!value || value.trim().length === 0) {
          errors.email = 'Email là bắt buộc';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.email = 'Email không hợp lệ';
          } else {
            delete errors.email;
          }
        }
        break;
        
      case 'password':
        if (!value || value.length === 0) {
          errors.password = 'Mật khẩu là bắt buộc';
        } else if (value.length < 6) {
          errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else {
          delete errors.password;
        }
        break;
        
      case 'confirmPassword':
        if (!value || value.length === 0) {
          errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (value !== password) {
          errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }
    
    setFieldErrors(errors);
    return !errors[fieldName];
  };

  // Xử lý thay đổi email với autocomplete
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Validate
    validateField('email', value);
    
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
    validateField('email', selectedEmail);
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
    
    // Validate tất cả các trường
    const isNameValid = validateField('name', name);
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      setError('Vui lòng kiểm tra lại thông tin đã nhập');
      setLoading(false);
      return;
    }

    setLoading(true);

    const result = await register({ name, email, password, phone_number: phoneNumber || null });
    setLoading(false);

    if (result.success) {
      // Lưu email vào lịch sử
      saveEmail(email);
      navigate('/');
    } else {
      setError(result.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.registerContainer}>
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
        
        <div className={styles.registerCard}>
          <h1 className={styles.title}>Đăng ký</h1>
          <p className={styles.subtitle}>Tạo tài khoản mới để bắt đầu</p>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <FaUser className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    validateField('name', e.target.value);
                  }}
                  onBlur={() => validateField('name', name)}
                  className={`${styles.input} ${fieldErrors.name ? styles.inputError : ''}`}
                  disabled={loading}
                  required
                />
              </div>
              {fieldErrors.name && (
                <span className={styles.fieldError}>{fieldErrors.name}</span>
              )}
            </div>

            <div className={styles.inputGroup} style={{ position: 'relative' }}>
              <div className={styles.inputWrapper}>
                <FaUser className={styles.inputIcon} />
                <input
                  ref={emailInputRef}
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={() => {
                    validateField('email', email);
                    // Delay để cho phép click vào suggestions
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                  disabled={loading}
                  required
                  list="email-suggestions"
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
              {fieldErrors.email && (
                <span className={styles.fieldError}>{fieldErrors.email}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <FaPhone className={styles.inputIcon} />
                <input
                  type="tel"
                  placeholder="Số điện thoại (tùy chọn)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={styles.input}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu (tối thiểu 6 ký tự) *"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validateField('password', e.target.value);
                    // Re-validate confirm password nếu đã nhập
                    if (confirmPassword) {
                      validateField('confirmPassword', confirmPassword);
                    }
                  }}
                  onBlur={() => validateField('password', password)}
                  className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                  disabled={loading}
                  required
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
              {fieldErrors.password && (
                <span className={styles.fieldError}>{fieldErrors.password}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu *"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateField('confirmPassword', e.target.value);
                  }}
                  onBlur={() => validateField('confirmPassword', confirmPassword)}
                  className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                  disabled={loading}
                  required
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
              {fieldErrors.confirmPassword && (
                <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              Đã có tài khoản?{' '}
              <Link to="/dang-nhap" className={styles.link}>
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;