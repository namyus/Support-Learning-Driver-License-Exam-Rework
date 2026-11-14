import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../../config/axios';
import './mentor-create-form.scss';
import { toast } from 'react-toastify';

interface CreateMentorPayload {
  username: string;
  password: string;
  fullName: string;
  residenceAddress: string;
  phone: string;
  email: string;
  isTeachingTheory: boolean;
  isTeachingPractice: boolean;
}

function CreateMentorForm() {
  const [inputData, setInputData] = useState<CreateMentorPayload>({
    username: '',
    password: '',
    fullName: '',
    residenceAddress: '',
    phone: '',
    email: '',
    isTeachingTheory: false,
    isTeachingPractice: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  // Same rule as the original form: every text field is required. The Backend
  // DTO declares no format/length rules, so none are enforced here.
  const validateInput = (): string | null => {
    if (
      !inputData.username.trim() ||
      !inputData.password ||
      !inputData.fullName.trim() ||
      !inputData.email.trim() ||
      !inputData.phone.trim() ||
      !inputData.residenceAddress.trim()
    ) {
      return 'Vui lòng điền đầy đủ thông tin.';
    }
    return null;
  };

  const createMentor = async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.post('Mentor/add', inputData);
      toast.success('Tạo giáo viên thành công!');
      navigate('/quan-ly-giao-vien');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
      };
      if (axiosErr.response?.data?.error) {
        setError(axiosErr.response.data.error);
      } else if (axiosErr.response?.status === 409) {
        setError('Tên đăng nhập hoặc email đã tồn tại.');
      } else {
        setError('Không thể tạo giáo viên. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void createMentor();
  };

  return (
    <div className="create-mentor-container">
      <div className="create-mentor-title">
        <div className="create-mentor-title__text">
          <h1>Tạo giáo viên mới</h1>
          <p>Khởi tạo tài khoản giảng viên và thiết lập phân công giảng dạy</p>
        </div>
        <button
          type="button"
          className="mentor-form-btn mentor-form-btn--secondary"
          onClick={() => navigate('/quan-ly-giao-vien')}
        >
          ← Quay lại danh sách
        </button>
      </div>

      <div className="create-mentor-form">
        {error && (
          <div className="mentor-form-alert mentor-form-alert--error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mentor-form-grid">
            <div className="mentor-form-field">
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

            <div className="mentor-form-field">
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

            <div className="mentor-form-field">
              <label htmlFor="fullName">
                Tên giáo viên <span className="required-mark">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Ví dụ: Trần Văn B"
                value={inputData.fullName}
                onChange={(e) => {
                  setInputData({ ...inputData, fullName: e.target.value });
                  if (error) setError(null);
                }}
                required
              />
            </div>

            <div className="mentor-form-field">
              <label htmlFor="residenceAddress">
                Địa chỉ cư trú <span className="required-mark">*</span>
              </label>
              <input
                id="residenceAddress"
                type="text"
                name="residenceAddress"
                placeholder="Nhập địa chỉ liên hệ"
                value={inputData.residenceAddress}
                onChange={(e) => {
                  setInputData({ ...inputData, residenceAddress: e.target.value });
                  if (error) setError(null);
                }}
                required
              />
            </div>

            <div className="mentor-form-field">
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

            <div className="mentor-form-field">
              <label htmlFor="email">
                Email liên hệ <span className="required-mark">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="giaovien@fdriving.vn"
                value={inputData.email}
                onChange={(e) => {
                  setInputData({ ...inputData, email: e.target.value });
                  if (error) setError(null);
                }}
                required
              />
            </div>

            <div className="mentor-form-field mentor-form-field--full">
              <span className="checkbox-section-label">Phân công giảng dạy</span>
              <div className="mentor-checkbox-group">
                <label className="mentor-checkbox-card" htmlFor="isTeachingTheory">
                  <input
                    id="isTeachingTheory"
                    type="checkbox"
                    name="isTeachingTheory"
                    checked={inputData.isTeachingTheory}
                    onChange={(e) =>
                      setInputData({ ...inputData, isTeachingTheory: e.target.checked })
                    }
                  />
                  <div className="mentor-checkbox-card__content">
                    <strong>Dạy lý thuyết</strong>
                    <span>Phụ trách giảng dạy các lớp học lý thuyết</span>
                  </div>
                </label>

                <label className="mentor-checkbox-card" htmlFor="isTeachingPractice">
                  <input
                    id="isTeachingPractice"
                    type="checkbox"
                    name="isTeachingPractice"
                    checked={inputData.isTeachingPractice}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        isTeachingPractice: e.target.checked,
                      })
                    }
                  />
                  <div className="mentor-checkbox-card__content">
                    <strong>Dạy thực hành</strong>
                    <span>Phụ trách hướng dẫn lái xe thực hành</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="mentor-form-actions">
            <button
              type="button"
              className="mentor-form-btn mentor-form-btn--secondary"
              disabled={isSubmitting}
              onClick={() => navigate('/quan-ly-giao-vien')}
            >
              Huỷ bỏ
            </button>
            <button
              className="mentor-form-btn mentor-form-btn--primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo giáo viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMentorForm;
