import './member-information-section.scss';
import MemberImg from '../../../../assets/imgs/member/member_img.png';
import api from '../../../config/axios';
import { useCallback, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useAppDispatch } from '../../../app/store';
import { fetchCourseById } from '../../../features/courses/coursesSlice';

interface StoredUser {
  userID?: number | string;
}

interface MemberRecord {
  memberID?: number | string;
  courseId?: string | number;
  fullName?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  residenceAddress?: string;
  identityCardNumber?: string;
}

interface CourseRecord {
  courseId?: string | number;
  name?: string;
}

interface StudentRecord {
  studentId?: string | number;
}

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

function MemberInformationForm() {
  const dispatch = useAppDispatch();
  const user = readStoredUser();
  const userID = user?.userID;

  const [member, setMember] = useState<MemberRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [student, setStudent] = useState<StudentRecord | null>(null);

  const getMemberByUID = useCallback(async () => {
    if (userID == null) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<MemberRecord>('Member/' + userID);
      setMember(response.data);
    } catch (err) {
      console.log(err);
      setMember(null);
      setErrorMessage('Không thể tải thông tin thành viên. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [userID]);

  useEffect(() => {
    void getMemberByUID();
  }, [getMemberByUID]);

  useEffect(() => {
    if (!member?.courseId) {
      return;
    }
    const getCourseById = async () => {
      try {
        const res = (await dispatch(
          fetchCourseById(String(member.courseId))
        ).unwrap()) as CourseRecord;
        setCourse(res);
      } catch (err) {
        console.log(err);
      }
    };
    void getCourseById();
  }, [dispatch, member]);

  useEffect(() => {
    if (!member?.memberID || !course) {
      return;
    }
    const getStudentById = async () => {
      try {
        const response = await api.get<StudentRecord>(
          'Student/' + member.memberID
        );
        setStudent(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    void getStudentById();
  }, [member, course]);

  const formatDate = (dbDate?: string) => {
    if (!dbDate) {
      return '—';
    }
    const date = new Date(dbDate);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const displayValue = (value?: string | number | null) => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return '—';
    }
    return String(value);
  };

  return (
    <section
      className="member-information-container mh-profile-section"
      aria-labelledby="mh-profile-heading"
    >
      <div className="mh-profile-header">
        <h1
          id="mh-profile-heading"
          className="member-information-title mh-section-title"
        >
          Thông tin thành viên
        </h1>
      </div>

      {isLoading ? (
        <div
          className="mh-profile-state"
          role="status"
          aria-live="polite"
        >
          <CircularProgress size={34} className="mh-profile-spinner" />
          <p className="mh-profile-state__text">Đang tải thông tin thành viên...</p>
        </div>
      ) : errorMessage ? (
        <div className="mh-profile-state mh-profile-state--error" role="alert">
          <p className="mh-profile-state__text">{errorMessage}</p>
          <button
            type="button"
            className="mh-profile-retry-btn"
            onClick={() => void getMemberByUID()}
          >
            Thử lại
          </button>
        </div>
      ) : member !== null && course !== null ? (
        <div className="member-information-content mh-profile-layout">
          <aside className="mh-profile-summary-card">
            <div className="member-avatar mh-profile-avatar">
              <img src={MemberImg} alt="Hình ảnh thành viên" />
            </div>
            <h2 className="mh-profile-name">{displayValue(member.fullName)}</h2>
            <div className="mh-profile-badges">
              <span className="mh-profile-badge mh-profile-badge--primary">
                Mã học viên: {student?.studentId != null ? `${student.studentId}` : 'Chưa cấp'}
              </span>
              <span className="mh-profile-badge mh-profile-badge--neutral">
                Khoá học: {student !== null ? displayValue(course.name) : '—'}
              </span>
            </div>
          </aside>

          <div className="mh-profile-details-card">
            <div className="mh-profile-group">
              <h3 className="mh-profile-group-title">Thông tin cá nhân</h3>
              <dl className="mh-profile-grid">
                <div className="mh-profile-field mh-profile-field--full">
                  <dt>Họ và tên</dt>
                  <dd>{displayValue(member.fullName)}</dd>
                </div>
                <div className="mh-profile-field">
                  <dt>Ngày sinh</dt>
                  <dd>{formatDate(member.dob)}</dd>
                </div>
                <div className="mh-profile-field">
                  <dt>Giới tính</dt>
                  <dd>{displayValue(member.gender)}</dd>
                </div>
                <div className="mh-profile-field">
                  <dt>Quốc tịch</dt>
                  <dd>{displayValue(member.nationality)}</dd>
                </div>
                <div className="mh-profile-field">
                  <dt>Dân tộc</dt>
                  <dd>Kinh</dd>
                </div>
              </dl>
            </div>

            <div className="mh-profile-group">
              <h3 className="mh-profile-group-title">
                Liên hệ &amp; giấy tờ tùy thân
              </h3>
              <dl className="mh-profile-grid">
                <div className="mh-profile-field">
                  <dt>Điện thoại di động</dt>
                  <dd>{displayValue(member.phone)}</dd>
                </div>
                <div className="mh-profile-field">
                  <dt>Email</dt>
                  <dd>{displayValue(member.email)}</dd>
                </div>
                <div className="mh-profile-field mh-profile-field--full">
                  <dt>Địa chỉ thường trú</dt>
                  <dd>{displayValue(member.residenceAddress)}</dd>
                </div>
                <div className="mh-profile-field mh-profile-field--full">
                  <dt>Số CCCD/CMND</dt>
                  <dd>{displayValue(member.identityCardNumber)}</dd>
                </div>
              </dl>
            </div>

            <div className="mh-profile-group">
              <h3 className="mh-profile-group-title">Thông tin học tập</h3>
              <dl className="mh-profile-grid">
                <div className="mh-profile-field">
                  <dt>Mã số học viên</dt>
                  <dd>
                    {student !== null ? displayValue(student.studentId) : '—'}
                  </dd>
                </div>
                <div className="mh-profile-field">
                  <dt>Khoá học</dt>
                  <dd>
                    {student !== null ? displayValue(course.name) : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : (
        <div className="mh-profile-state" role="status">
          <h2 className="mh-profile-state__title">Người dùng chưa có dữ liệu</h2>
          <p className="mh-profile-state__text">
            Hiện chưa có thông tin hồ sơ thành viên gắn với tài khoản này.
          </p>
        </div>
      )}
    </section>
  );
}

export default MemberInformationForm;
