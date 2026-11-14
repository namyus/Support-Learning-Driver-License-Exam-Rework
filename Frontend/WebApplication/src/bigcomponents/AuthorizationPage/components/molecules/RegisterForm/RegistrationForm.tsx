import React, { useState } from 'react';
import './index.scss';
import axios from 'axios';
import api from '../../../../../config/axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../../../assets/images/logo.png';
import {
  faCircleExclamation,
  faEye,
  faEyeSlash,
  faLock,
  faPhone,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

interface RegistrationFormData {
  username: string;
  password: string;
  fullName: string;
  phone: string;
  status: boolean;
}

interface RegisterErrorResponse {
  error?: string;
}

function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegistrationFormData>({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    status: true,
  });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const phoneFormat = /^0\d{9}$/;
  const nameFormat = /^[\p{L} ]{5,32}$/u;
  const navigate = useNavigate();
  const requiredFields: Array<keyof Pick<RegistrationFormData, 'username' | 'password' | 'fullName' | 'phone'>> = [
    'username',
    'password',
    'fullName',
    'phone',
  ];

  const handleRegister = async () => {
    if (isSubmitting) {
      return;
    }

    setError(null);

    const missingFields = requiredFields.filter((field) => {
      const value = formData[field];
      return field === 'password' ? !value : !value.trim();
    });

    if (missingFields.length > 0 || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!nameFormat.test(formData.fullName) || !nameFormat.test(formData.fullName.trim())) {
      setError('Họ và tên không hợp lệ.');
      return;
    }

    if (!phoneFormat.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ.');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('User/Register', formData);
      navigate('/dang-nhap');
      toast.success('Đăng ký thành công!');
    } catch (err: unknown) {
      if (axios.isAxiosError<RegisterErrorResponse>(err)) {
        const backendError = err.response?.data?.error;
        if (typeof backendError === 'string' && backendError.trim().length > 0) {
          setError(backendError);
          return;
        }
      }
      setError('Không thể hoàn tất đăng ký lúc này. Vui lòng kiểm tra kết nối và thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleRegister();
  };

  return (
    <section className="registration-form" aria-labelledby="registration-heading">
      <div className="registration-header">
        <img src={logo} alt="Trung tâm đào tạo lái xe FDriving" className="registration-logo" />
        <h1 id="registration-heading" className="registration-title">
          Đăng ký tài khoản
        </h1>
        <p className="registration-subtitle">
          Tạo tài khoản học viên để đăng ký khóa học lái xe B2 tại FDriving
        </p>
      </div>

      <div className="rectangle-border">
        {error && (
          <div className="error-message" role="alert" aria-live="assertive">
            <FontAwesomeIcon
              icon={faCircleExclamation}
              className="error-icon"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Tên đăng nhập
            </label>
            <div className="inputField">
              <FontAwesomeIcon icon={faUser} className="icon field-icon" aria-hidden="true" />
              <input
                type="text"
                id="username"
                placeholder="Nhập tên đăng nhập"
                name="username"
                value={formData.username}
                autoComplete="username"
                disabled={isSubmitting}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Họ và tên
            </label>
            <div className="inputField">
              <FontAwesomeIcon icon={faUser} className="icon field-icon" aria-hidden="true" />
              <input
                type="text"
                id="fullName"
                placeholder="Nhập họ và tên đầy đủ"
                name="fullName"
                value={formData.fullName}
                autoComplete="name"
                disabled={isSubmitting}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Số điện thoại
            </label>
            <div className="inputField">
              <FontAwesomeIcon icon={faPhone} className="icon field-icon" aria-hidden="true" />
              <input
                type="tel"
                inputMode="numeric"
                id="phone"
                placeholder="Nhập số điện thoại (10 chữ số)"
                name="phone"
                value={formData.phone}
                autoComplete="tel"
                disabled={isSubmitting}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className="inputField">
              <FontAwesomeIcon icon={faLock} className="icon field-icon" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Nhập mật khẩu"
                name="password"
                value={formData.password}
                autoComplete="new-password"
                disabled={isSubmitting}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={showPassword}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Nhập lại mật khẩu
            </label>
            <div className="inputField">
              <FontAwesomeIcon icon={faLock} className="icon field-icon" aria-hidden="true" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Nhập lại mật khẩu xác nhận"
                name="confirmPassword"
                value={confirmPassword}
                autoComplete="new-password"
                disabled={isSubmitting}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? 'Ẩn mật khẩu xác nhận'
                    : 'Hiện mật khẩu xác nhận'
                }
                aria-pressed={showConfirmPassword}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className="registration-buttons">
            <button
              type="submit"
              className="registration-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>

          <div className="registration-footer-links">
            <p className="registration-login-prompt">
              Đã có tài khoản?{' '}
              <Link to="/dang-nhap" className="registration-login-link">
                Đăng nhập
              </Link>
            </p>

            <Link to="/" className="registration-back-home-link">
              ← Quay về trang chủ
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default RegisterForm;

