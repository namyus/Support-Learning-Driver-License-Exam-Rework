import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../../config/axios';
import './admin-update-mentor-form.scss';
import { toast } from 'react-toastify';

interface MentorUpdateFormData {
  mentorId: number;
  fullName: string;
  email: string;
  phone: string;
  residenceAddress: string;
  isTeachingTheory: boolean;
  isTeachingPractice: boolean;
}

interface LocationState {
  mentorId?: number;
}

function UpdateMentorForm() {
  const { mentorId: paramMentorId } = useParams<{ mentorId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const stateMentorId = (location.state as LocationState | null)?.mentorId;
  const resolvedMentorIdRaw = paramMentorId ?? (stateMentorId ? String(stateMentorId) : '');
  const parsedMentorId = Number(resolvedMentorIdRaw);
  const isValidMentorId =
    Boolean(resolvedMentorIdRaw) && Number.isInteger(parsedMentorId) && parsedMentorId > 0;

  const [inputData, setInputData] = useState<MentorUpdateFormData>({
    mentorId: isValidMentorId ? parsedMentorId : 0,
    fullName: '',
    email: '',
    phone: '',
    residenceAddress: '',
    isTeachingTheory: false,
    isTeachingPractice: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getMentorById = useCallback(async () => {
    if (!isValidMentorId) {
      setIsLoading(false);
      setLoadError(
        'Không tìm thấy mã giáo viên hợp lệ để cập nhật. Vui lòng chọn giáo viên từ danh sách.'
      );
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await api.get(`Mentor/${parsedMentorId}`);
      const mentor = response.data;
      setInputData({
        mentorId: Number(mentor?.mentorId ?? parsedMentorId),
        fullName: mentor?.fullName ?? '',
        email: mentor?.email ?? '',
        phone: mentor?.phone ?? '',
        residenceAddress: mentor?.residenceAddress ?? '',
        isTeachingTheory: Boolean(mentor?.isTeachingTheory),
        isTeachingPractice: Boolean(mentor?.isTeachingPractice),
      });
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
      };
      if (axiosErr.response?.status === 404) {
        setLoadError(
          axiosErr.response.data?.error ||
            `Không tìm thấy thông tin giáo viên có mã #${parsedMentorId}.`
        );
      } else {
        setLoadError('Không thể tải thông tin giáo viên. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isValidMentorId, parsedMentorId]);

  useEffect(() => {
    void getMentorById();
  }, [getMentorById]);

  // Same rule as the original form: every text field is required. The Backend
  // DTO declares no format/length rules, so none are enforced here.
  const validateInput = (): string | null => {
    if (!isValidMentorId || inputData.mentorId <= 0) {
      return 'Mã giáo viên không hợp lệ.';
    }
    if (
      !inputData.fullName.trim() ||
      !inputData.email.trim() ||
      !inputData.phone.trim() ||
      !inputData.residenceAddress.trim()
    ) {
      return 'Vui lòng điền đầy đủ thông tin.';
    }
    return null;
  };

  const updateMentor = async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.put('Mentor/update', {
        mentorId: inputData.mentorId,
        fullName: inputData.fullName,
        email: inputData.email,
        phone: inputData.phone,
        residenceAddress: inputData.residenceAddress,
        isTeachingTheory: inputData.isTeachingTheory,
        isTeachingPractice: inputData.isTeachingPractice,
      });
      toast.success('Cập nhật giáo viên thành công!');
      navigate('/quan-ly-giao-vien');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
      };
      if (axiosErr.response?.data?.error) {
        setError(axiosErr.response.data.error);
      } else if (axiosErr.response?.status === 409) {
        setError('Email đã tồn tại.');
      } else {
        setError('Không thể cập nhật thông tin giáo viên. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void updateMentor();
  };

  return (
    <div className="update-mentor-container">
      <div className="update-mentor-title">
        <div className="update-mentor-title__text">
          <h1>Cập nhật giáo viên</h1>
          <p>Chỉnh sửa thông tin liên hệ và phân công giảng dạy của giáo viên</p>
        </div>
        <button
          type="button"
          className="mentor-form-btn mentor-form-btn--secondary"
          onClick={() => navigate('/quan-ly-giao-vien')}
        >
          ← Quay lại danh sách
        </button>
      </div>

      <div className="update-mentor-form">
        {isLoading ? (
          <div className="mentor-update-state" role="status" aria-live="polite">
            <div className="mentor-update-spinner" aria-hidden="true" />
            <p>Đang tải thông tin giáo viên...</p>
          </div>
        ) : loadError ? (
          <div className="mentor-update-state mentor-update-state--error" role="alert">
            <p>{loadError}</p>
            <div className="mentor-update-state__actions">
              {isValidMentorId && (
                <button
                  type="button"
                  className="mentor-form-btn mentor-form-btn--secondary"
                  onClick={() => void getMentorById()}
                >
                  Thử lại
                </button>
              )}
              <button
                type="button"
                className="mentor-form-btn mentor-form-btn--primary"
                onClick={() => navigate('/quan-ly-giao-vien')}
              >
                Về danh sách giáo viên
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mentor-form-alert mentor-form-alert--error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mentor-form-grid">
                <div className="mentor-form-field">
                  <label htmlFor="mentorId">Mã giáo viên</label>
                  <input
                    id="mentorId"
                    type="text"
                    name="mentorId"
                    value={inputData.mentorId}
                    readOnly
                    disabled
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
                    value={inputData.residenceAddress}
                    onChange={(e) => {
                      setInputData({ ...inputData, residenceAddress: e.target.value });
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
                    value={inputData.email}
                    onChange={(e) => {
                      setInputData({ ...inputData, email: e.target.value });
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
                    value={inputData.phone}
                    onChange={(e) => {
                      setInputData({ ...inputData, phone: e.target.value });
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
                          setInputData({
                            ...inputData,
                            isTeachingTheory: e.target.checked,
                          })
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

export default UpdateMentorForm;
