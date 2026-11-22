import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../../config/axios';
import './admin-update-staff-form.scss';
import { toast } from 'react-toastify';

interface StaffUpdateFormData {
  staffId: number;
  fullName: string;
  email: string;
  phone: string;
}

interface LocationState {
  staffId?: number;
}

function UpdateStaffForm() {
  const { staffId: paramStaffId } = useParams<{ staffId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const stateStaffId = (location.state as LocationState | null)?.staffId;
  const resolvedStaffIdRaw = paramStaffId ?? (stateStaffId ? String(stateStaffId) : '');
  const parsedStaffId = Number(resolvedStaffIdRaw);
  const isValidStaffId =
    Boolean(resolvedStaffIdRaw) && Number.isInteger(parsedStaffId) && parsedStaffId > 0;

  const [inputData, setInputData] = useState<StaffUpdateFormData>({
    staffId: isValidStaffId ? parsedStaffId : 0,
    fullName: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getStaffById = useCallback(async () => {
    if (!isValidStaffId) {
      setIsLoading(false);
      setLoadError(
        'Không tìm thấy mã nhân viên hợp lệ để cập nhật. Vui lòng chọn nhân viên từ danh sách.'
      );
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await api.get(`Staff/${parsedStaffId}`);
      const staff = response.data;
      setInputData({
        staffId: Number(staff?.staffId ?? parsedStaffId),
        fullName: staff?.fullName ?? '',
        email: staff?.email ?? '',
        phone: staff?.phone ?? '',
      });
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
      };
      if (axiosErr.response?.status === 404) {
        setLoadError(
          axiosErr.response.data?.error ||
            `Không tìm thấy thông tin nhân viên có mã #${parsedStaffId}.`
        );
      } else {
        setLoadError('Không thể tải thông tin nhân viên. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isValidStaffId, parsedStaffId]);

  useEffect(() => {
    void getStaffById();
  }, [getStaffById]);

  // Same rule as the original form: every field is required. The Backend DTO
  // declares no format/length rules, so none are enforced here.
  const validateInput = (): string | null => {
    if (!isValidStaffId || inputData.staffId <= 0) {
      return 'Mã nhân viên không hợp lệ.';
    }
    if (
      !inputData.fullName.trim() ||
      !inputData.email.trim() ||
      !inputData.phone.trim()
    ) {
      return 'Vui lòng điền đầy đủ thông tin.';
    }
    return null;
  };

  const updateStaff = async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.put('Staff/update', {
        staffId: inputData.staffId,
        fullName: inputData.fullName,
        email: inputData.email,
        phone: inputData.phone,
      });
      toast.success('Cập nhật nhân viên thành công!');
      navigate('/quan-ly-nhan-vien');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
      };
      if (axiosErr.response?.data?.error) {
        setError(axiosErr.response.data.error);
      } else if (axiosErr.response?.status === 409) {
        setError('Email đã tồn tại.');
      } else {
        setError('Không thể cập nhật thông tin nhân viên. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void updateStaff();
  };

  return (
    <div className="update-staff-container">
      <div className="update-staff-title">
        <div className="update-staff-title__text">
          <h1>Cập nhật nhân viên</h1>
          <p>Chỉnh sửa thông tin liên hệ của nhân viên trong hệ thống</p>
        </div>
        <button
          type="button"
          className="staff-form-btn staff-form-btn--secondary"
          onClick={() => navigate('/quan-ly-nhan-vien')}
        >
          ← Quay lại danh sách
        </button>
      </div>

      <div className="update-staff-form">
        {isLoading ? (
          <div className="staff-update-state" role="status" aria-live="polite">
            <div className="staff-update-spinner" aria-hidden="true" />
            <p>Đang tải thông tin nhân viên...</p>
          </div>
        ) : loadError ? (
          <div className="staff-update-state staff-update-state--error" role="alert">
            <p>{loadError}</p>
            <div className="staff-update-state__actions">
              {isValidStaffId && (
                <button
                  type="button"
                  className="staff-form-btn staff-form-btn--secondary"
                  onClick={() => void getStaffById()}
                >
                  Thử lại
                </button>
              )}
              <button
                type="button"
                className="staff-form-btn staff-form-btn--primary"
                onClick={() => navigate('/quan-ly-nhan-vien')}
              >
                Về danh sách nhân viên
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="staff-form-alert staff-form-alert--error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="staff-form-grid">
                <div className="staff-form-field">
                  <label htmlFor="staffId">Mã nhân viên</label>
                  <input
                    id="staffId"
                    type="text"
                    name="staffId"
                    value={inputData.staffId}
                    readOnly
                    disabled
                  />
                </div>

                <div className="staff-form-field">
                  <label htmlFor="fullName">
                    Họ và tên nhân viên <span className="required-mark">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
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
                  {isSubmitting ? 'Đang lưu...' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default UpdateStaffForm;
