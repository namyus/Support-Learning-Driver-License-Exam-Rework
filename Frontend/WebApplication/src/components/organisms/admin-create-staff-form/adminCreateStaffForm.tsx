import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/axios';
import './admin-create-staff-form.scss';
import { toast } from 'react-toastify';

interface CreateStaffPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
}

function CreateStaffForm() {
  const [inputData, setInputData] = useState<CreateStaffPayload>({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  // Same rule as the original form: every field is required. The Backend DTO
  // declares no format/length rules, so none are enforced here.
  const validateInput = (): string | null => {
    if (
      !inputData.username.trim() ||
      !inputData.password ||
      !inputData.fullName.trim() ||
      !inputData.email.trim() ||
      !inputData.phone.trim()
    ) {
      return 'Vui lòng điền đầy đủ thông tin.';
    }
    return null;
  };

  const createStaff = async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.post('Staff/add', inputData);
      toast.success('Tạo nhân viên thành công!');
      navigate('/quan-ly-nhan-vien');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
      };
      if (axiosErr.response?.data?.error) {
        setError(axiosErr.response.data.error);
      } else if (axiosErr.response?.status === 409) {
        setError('Tên đăng nhập hoặc email đã tồn tại.');
      } else {
        setError('Không thể tạo nhân viên. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void createStaff();
  };

  return (
    <div className="create-staff-container">
      <div className="create-staff-title">
        <div className="create-staff-title__text">
          <h1>Tạo nhân viên mới</h1>
          <p>Khởi tạo tài khoản đăng nhập và hồ sơ thông tin cho nhân viên hệ thống</p>
        </div>
        <button
          type="button"
          className="staff-form-btn staff-form-btn--secondary"
          onClick={() => navigate('/quan-ly-nhan-vien')}
        >
          ← Quay lại danh sách
        </button>
      </div>

      <div className="create-staff-form">
        {error && (
          <div className="staff-form-alert staff-form-alert--error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="staff-form-grid">
            <div className="staff-form-field">
              <label htmlFor="username">
                Tên đăng nhập <span className="required-mark">*</span>
              </label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Nhập tên tài khoản đăng nhập"
                value={inputData.username}
                onChange={(e) => {
                  setInputData({ ...inputData, username: e.target.value });
                  if (error) setError(null);
                }}
                autoComplete="username"
                required
              />
            </div>

            <div className="staff-form-field">
              <label htmlFor="password">
                Mật khẩu <span className="required-mark">*</span>
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Nhập mật khẩu khởi tạo"
                value={inputData.password}
                onChange={(e) => {
                  setInputData({ ...inputData, password: e.target.value });
                  if (error) setError(null);
                }}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="staff-form-field staff-form-field--full">
              <label htmlFor="fullName">
                Họ và tên nhân viên <span className="required-mark">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={inputData.fullName}
                onChange={(e) => {
                  setInputData({ ...inputData, fullName: e.target.value });
                  if (error) setError(null);
                }}
                required
              />
            </div>

            <div className="staff-form-field">
              <label htmlFor="email">
                Email liên hệ <span className="required-mark">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="nhanvien@fdriving.vn"
                value={inputData.email}
                onChange={(e) => {
                  setInputData({ ...inputData, email: e.target.value });
                  if (error) setError(null);
                }}
                required
              />
            </div>

            <div className="staff-form-field">
              <label htmlFor="phone">
                Số điện thoại <span className="required-mark">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="0901234567 (10 chữ số)"
                value={inputData.phone}
                onChange={(e) => {
                  setInputData({ ...inputData, phone: e.target.value });
                  if (error) setError(null);
                }}
                required
              />
            </div>
          </div>

          <div className="staff-form-actions">
            <button
              type="button"
              className="staff-form-btn staff-form-btn--secondary"
              disabled={isSubmitting}
              onClick={() => navigate('/quan-ly-nhan-vien')}
            >
              Huỷ bỏ
            </button>
            <button
              className="staff-form-btn staff-form-btn--primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStaffForm;
