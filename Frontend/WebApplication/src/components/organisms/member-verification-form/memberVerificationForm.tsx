import React, { useEffect, useState } from 'react';
import './member-verification-form.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../app/store';
import {
  createMember as createMemberThunk,
  fetchMemberByUserIdQuery,
} from '../../../features/members/membersSlice';
import type { CreateMemberPayload } from '../../../features/members/membersTypes';
import type { ApiRejectedPayload } from '../../../features/shared/apiError';

interface StoredUser {
  userID?: number | string;
  fullName?: string;
  phone?: string;
  email?: string;
}

type VerificationInputData = CreateMemberPayload;

function readStoredUser(): StoredUser | null {
  const raw = sessionStorage.getItem('loginedUser');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function readStoredCourseId(): string | number | null {
  const raw = localStorage.getItem('courseID');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as string | number | null;
  } catch {
    return null;
  }
}

function VerificationForm() {
  const dispatch = useAppDispatch();
  const user = readStoredUser();
  const userId = user?.userID ?? null;
  const [member, setMember] = useState<unknown>();
  const { courseName } = useParams();
  const courseID = readStoredCourseId();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inputData, setInputData] = useState<VerificationInputData>({
    dob: '',
    gender: '',
    nationality: '',
    nation: '',
    temporaryAddress: '',
    residenceAddress: '',
    identityCardNumber: '',
    cardProvidedDate: '',
    cardProvidedLocation: '',
    isPaid: false,
    courseId: courseID,
    userId: userId,
    fullName: '',
    phone: '',
    email: '',
  });

  const navigate = useNavigate();
  const requiredFields: Array<keyof VerificationInputData> = [
    'fullName',
    'dob',
    'phone',
    'email',
    'nationality',
    'temporaryAddress',
    'residenceAddress',
    'identityCardNumber',
    'cardProvidedDate',
    'cardProvidedLocation',
    'nation',
  ];
  const namePattern = /^[\p{L} ]{5,32}$/u;
  const nationalityPattern = /^[\p{L} ]{2,32}$/u;
  const nationPattern = /^[\p{L} ]{2,32}$/u;
  const phonePattern = /^0\d{9}$/;
  const cccdPattern = /^0\d{11}$/;

  const createMember = async () => {
    setError('');
    try {
      const dobDate = new Date(inputData.dob);
      const currentDate = new Date();
      const age = currentDate.getFullYear() - dobDate.getFullYear();
      const missingFields = requiredFields.filter((field) => !inputData[field]);

      if (missingFields.length > 0) {
        setError('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      if (!namePattern.test(inputData.fullName)) {
        setError('Họ và tên không hợp lệ!');
        return;
      } else if (age < 18) {
        setError('Bạn chưa đủ 18 tuổi!');
        return;
      } else if (!phonePattern.test(inputData.phone)) {
        setError('Số điện thoại không hợp lệ!');
        return;
      } else if (!nationalityPattern.test(inputData.nationality)) {
        setError('Quốc tịch không hợp lệ!');
        return;
      } else if (!nationPattern.test(inputData.nation)) {
        setError('Dân tộc không hợp lệ!');
        return;
      } else if (
        inputData.residenceAddress === '' ||
        inputData.residenceAddress === null
      ) {
        setError('Địa chỉ không hợp lệ!');
        return;
      } else if (!cccdPattern.test(inputData.identityCardNumber)) {
        setError('Số CMND/CCCD không hợp lệ!');
        return;
      } else if (
        inputData.cardProvidedLocation === '' ||
        inputData.cardProvidedLocation === null
      ) {
        setError('Địa chỉ cung cấp CMND/CCCD không hợp lệ!');
        return;
      }

      setIsSubmitting(true);
      const createdMember = await dispatch(createMemberThunk(inputData)).unwrap();
      setMember(createdMember);
      sessionStorage.setItem('loginedMember', JSON.stringify(createdMember));
      toast.success(`Bạn đã đăng ký khoá học ${courseName} thành công`);
      localStorage.removeItem('courseID');
      navigate('/khoa-hoc-cua-ban');
      window.scroll({
        top: 0,
        behavior: 'instant',
      });
    } catch (err) {
      const rejected = err as ApiRejectedPayload | undefined;
      setError(
        rejected?.error ||
          rejected?.message ||
          'Đăng ký khóa học thất bại. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.scroll({
      top: 0,
      behavior: 'instant',
    });
    void createMember();
  };

  useEffect(() => {
    if (userId == null) {
      return;
    }
    const fetchData = async () => {
      try {
        const data = await dispatch(fetchMemberByUserIdQuery(userId)).unwrap();
        console.log(data);
        sessionStorage.setItem('loginedMember', JSON.stringify(data));
      } catch {
        // Handle any errors that occur during the API request
      }
    };
    void fetchData();
  }, [dispatch, member, userId]);

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: 'instant',
    });
  }, []);

  useEffect(() => {
    if (user) {
      setInputData((prevInputData) => ({
        ...prevInputData,
        fullName: user.fullName ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className="verification-form-container mh-verification-section"
      aria-labelledby="mh-verification-heading"
    >
      <div className="mh-verification-header">
        <div className="mh-verification-breadcrumb">
          <Link to="/#course-section" className="mh-verification-back-link">
            ← Quay lại danh sách khóa học
          </Link>
        </div>
        <h1 id="mh-verification-heading" className="mh-verification-title">
          Xác nhận đăng ký khoá học
        </h1>
        {courseName && (
          <div className="mh-verification-course-badge">
            Khoá học đang đăng ký: <strong>{courseName}</strong>
          </div>
        )}
        <p className="form-title mh-verification-subtitle">
          Các thông tin sau được dùng để hoàn tất hồ sơ thi. Học viên vui lòng
          điền đầy đủ và chính xác!
        </p>
      </div>

      {error && (
        <div className="mh-verification-alert" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className="form-container mh-verification-card">
        <div className="form-content">
          <form
            className="verification-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <fieldset className="mh-form-group-section">
              <legend className="mh-form-section-title">
                1. Thông tin cá nhân
              </legend>
              <div className="mh-form-grid">
                <div className="mh-field mh-field--full">
                  <label htmlFor="vf-fullName">
                    Họ và tên <span className="mh-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="vf-fullName"
                    value={inputData.fullName}
                    onChange={(e) =>
                      setInputData({ ...inputData, fullName: e.target.value })
                    }
                    className="name-input mh-input"
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </div>

                <div className="mh-field dob-container">
                  <label htmlFor="vf-dob">
                    Ngày sinh <span className="mh-required">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    id="vf-dob"
                    value={inputData.dob}
                    onChange={(e) =>
                      setInputData({ ...inputData, dob: e.target.value })
                    }
                    className="date-input mh-input"
                  />
                </div>

                <div className="mh-field gender-container">
                  <span className="mh-field-label">Giới tính</span>
                  <div className="mh-radio-group" role="radiogroup" aria-label="Giới tính">
                    <label className="mh-radio-option male" htmlFor="vf-gender-nam">
                      <input
                        id="vf-gender-nam"
                        type="radio"
                        name="gender"
                        value="nam"
                        checked={inputData.gender === 'nam'}
                        onChange={() =>
                          setInputData((prevData) => ({
                            ...prevData,
                            gender: 'nam',
                          }))
                        }
                      />
                      <span>Nam</span>
                    </label>
                    <label className="mh-radio-option female" htmlFor="vf-gender-nu">
                      <input
                        id="vf-gender-nu"
                        type="radio"
                        name="gender"
                        value="nữ"
                        checked={inputData.gender === 'nữ'}
                        onChange={() =>
                          setInputData((prevData) => ({
                            ...prevData,
                            gender: 'nữ',
                          }))
                        }
                      />
                      <span>Nữ</span>
                    </label>
                  </div>
                </div>

                <div className="mh-field nationality-container">
                  <label htmlFor="vf-nationality">
                    Quốc tịch <span className="mh-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    id="vf-nationality"
                    value={inputData.nationality}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        nationality: e.target.value,
                      })
                    }
                    className="mh-input"
                    placeholder="Ví dụ: Việt Nam"
                  />
                </div>

                <div className="mh-field nation-container">
                  <label htmlFor="vf-nation">
                    Dân tộc <span className="mh-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="nation"
                    id="vf-nation"
                    value={inputData.nation}
                    onChange={(e) =>
                      setInputData({ ...inputData, nation: e.target.value })
                    }
                    className="mh-input"
                    placeholder="Ví dụ: Kinh"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="mh-form-group-section">
              <legend className="mh-form-section-title">
                2. Thông tin liên hệ &amp; cư trú
              </legend>
              <div className="mh-form-grid">
                <div className="mh-field">
                  <label htmlFor="vf-phone">
                    Điện thoại di động <span className="mh-required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="vf-phone"
                    value={inputData.phone}
                    onChange={(e) =>
                      setInputData({ ...inputData, phone: e.target.value })
                    }
                    className="phone-input mh-input"
                    placeholder="0xxxxxxxxx"
                  />
                </div>

                <div className="mh-field">
                  <label htmlFor="vf-email">
                    Email <span className="mh-required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="vf-email"
                    value={inputData.email}
                    onChange={(e) =>
                      setInputData({ ...inputData, email: e.target.value })
                    }
                    className="email-input mh-input"
                    placeholder="example@email.com"
                  />
                </div>

                <div className="mh-field mh-field--full">
                  <label htmlFor="vf-residenceAddress">
                    Nơi đăng ký hộ khẩu thường trú{' '}
                    <span className="mh-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="residenceAddress"
                    id="vf-residenceAddress"
                    value={inputData.residenceAddress}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        residenceAddress: e.target.value,
                      })
                    }
                    className="residence-input mh-input"
                    placeholder="Nhập địa chỉ hộ khẩu thường trú"
                  />
                </div>

                <div className="mh-field mh-field--full">
                  <label htmlFor="vf-tempoAddress">
                    Nơi cư trú <span className="mh-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="tempoAddress"
                    id="vf-tempoAddress"
                    value={inputData.temporaryAddress}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        temporaryAddress: e.target.value,
                      })
                    }
                    className="tempo-input mh-input"
                    placeholder="Nhập địa chỉ cư trú hiện tại"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="mh-form-group-section">
              <legend className="mh-form-section-title">
                3. Giấy tờ tùy thân (CMND/CCCD)
              </legend>
              <div className="mh-form-grid">
                <div className="mh-field mh-field--full">
                  <label htmlFor="vf-cccdNo">
                    Số CMND/CCCD <span className="mh-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="cccdNo"
                    id="vf-cccdNo"
                    value={inputData.identityCardNumber}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        identityCardNumber: e.target.value,
                      })
                    }
                    className="cccd-input mh-input"
                    placeholder="Nhập 12 chữ số bắt đầu bằng 0"
                  />
                </div>

                <div className="mh-field providedCardDate">
                  <label htmlFor="vf-providedCardDate">
                    Cấp ngày <span className="mh-required">*</span>
                  </label>
                  <input
                    type="date"
                    name="providedCardDate"
                    id="vf-providedCardDate"
                    value={inputData.cardProvidedDate}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        cardProvidedDate: e.target.value,
                      })
                    }
                    className="date-input mh-input"
                  />
                </div>

                <div className="mh-field providedCardLocation">
                  <label htmlFor="vf-providedCardLocation">
                    Tại <span className="mh-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="providedCardLocation"
                    id="vf-providedCardLocation"
                    value={inputData.cardProvidedLocation}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        cardProvidedLocation: e.target.value,
                      })
                    }
                    className="mh-input"
                    placeholder="Nơi cấp CMND/CCCD"
                  />
                </div>
              </div>
            </fieldset>

            <div className="mh-form-actions">
              <button
                type="submit"
                className="cont-button mh-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default VerificationForm;
