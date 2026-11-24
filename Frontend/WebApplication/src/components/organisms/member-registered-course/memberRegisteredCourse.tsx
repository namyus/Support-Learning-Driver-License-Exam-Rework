import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './member-registered-course.scss';
import { CircularProgress } from '@mui/material';
import {
  selectCurrentUser,
  useAppDispatch,
  useAppSelector,
} from '../../../app/store';
import { fetchCourseById } from '../../../features/courses/coursesSlice';
import { fetchTestByStudentId } from '../../../features/exams/examsSlice';
import { fetchMemberByUserId } from '../../../features/members/membersSlice';
import type { MemberRecord } from '../../../features/members/membersTypes';
import { fetchStudentByMemberId } from '../../../features/students/studentsSlice';
import type { StudentRecord } from '../../../features/students/studentsTypes';
import { getApiErrorStatus } from '../../../features/shared/apiError';

const PAYMENT_POLL_INTERVAL_MS = 10000;

interface StoredUser {
  userID?: number | string;
}

interface CourseRecord {
  courseId?: string | number;
  name?: string;
  startDate?: string;
}

interface TheoryStatusRecord {
  pass?: boolean | null;
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

function RegisteredCourse() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectCurrentUser);
  const storedUser = readStoredUser();
  const userID = authUser?.userID ?? storedUser?.userID;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [theoryStatus, setTheoryStatus] = useState<TheoryStatusRecord | null>(
    null
  );

  const isMountedRef = useRef(true);
  const isSyncInFlightRef = useRef(false);
  const confirmedPaidRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    confirmedPaidRef.current = false;
  }, [userID]);

  const loadDependentRecords = useCallback(
    async (memberData: MemberRecord, shouldLoadCourse: boolean) => {
      if (shouldLoadCourse && memberData.courseId != null) {
        try {
          const courseData = (await dispatch(
            fetchCourseById(String(memberData.courseId))
          ).unwrap()) as CourseRecord;
          if (isMountedRef.current) {
            setCourse(courseData);
          }
        } catch (err) {
          console.error(err);
          if (isMountedRef.current) {
            setCourse(null);
          }
        }
      } else if (shouldLoadCourse) {
        if (isMountedRef.current) {
          setCourse(null);
        }
      }

      if (memberData.memberID == null) {
        if (isMountedRef.current) {
          setTheoryStatus(null);
        }
        return;
      }

      let studentData: StudentRecord | null = null;
      try {
        const studentRes = await dispatch(
          fetchStudentByMemberId(memberData.memberID)
        ).unwrap();
        studentData = studentRes.student;
      } catch (err) {
        if (getApiErrorStatus(err) !== 404) {
          console.error(err);
        }
      }

      if (!isMountedRef.current) {
        return;
      }

      if (studentData?.studentId != null) {
        try {
          const theoryData = await dispatch(
            fetchTestByStudentId(studentData.studentId)
          ).unwrap();
          if (isMountedRef.current) {
            setTheoryStatus(theoryData);
          }
        } catch (err) {
          if (getApiErrorStatus(err) !== 404) {
            console.error(err);
          }
          if (isMountedRef.current) {
            setTheoryStatus(null);
          }
        }
      } else {
        setTheoryStatus(null);
      }
    },
    [dispatch]
  );

  const loadEnrolledCourse = useCallback(async () => {
    if (userID == null) {
      confirmedPaidRef.current = false;
      setMember(null);
      setCourse(null);
      setTheoryStatus(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const memberData = await dispatch(fetchMemberByUserId(userID)).unwrap();

      if (!isMountedRef.current) {
        return;
      }

      if (!memberData || memberData.memberID == null) {
        confirmedPaidRef.current = false;
        setMember(null);
        setCourse(null);
        setTheoryStatus(null);
        setIsLoading(false);
        return;
      }

      if (memberData.isPaid === true) {
        confirmedPaidRef.current = true;
      }
      setMember(memberData);
      sessionStorage.setItem('loginedMember', JSON.stringify(memberData));

      await loadDependentRecords(memberData, true);
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }
      if (getApiErrorStatus(err) === 404) {
        confirmedPaidRef.current = false;
        setMember(null);
        setCourse(null);
        setTheoryStatus(null);
      } else {
        console.error(err);
        setErrorMessage(
          'Không thể tải thông tin khoá học của bạn. Vui lòng thử lại sau.'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [dispatch, loadDependentRecords, userID]);

  useEffect(() => {
    void loadEnrolledCourse();
  }, [loadEnrolledCourse]);

  const syncPaymentStatus = useCallback(async () => {
    if (
      userID == null ||
      confirmedPaidRef.current ||
      isSyncInFlightRef.current ||
      !isMountedRef.current
    ) {
      return;
    }

    isSyncInFlightRef.current = true;
    try {
      const latestMember = await dispatch(fetchMemberByUserId(userID)).unwrap();

      if (!isMountedRef.current || !latestMember || latestMember.memberID == null) {
        return;
      }

      if (latestMember.isPaid === true) {
        confirmedPaidRef.current = true;
        setMember(latestMember);
        sessionStorage.setItem('loginedMember', JSON.stringify(latestMember));
        await loadDependentRecords(latestMember, course == null);
      }
    } catch {
      // Transient background sync failure: preserve current UI state and retry on next cycle
    } finally {
      isSyncInFlightRef.current = false;
    }
  }, [course, dispatch, loadDependentRecords, userID]);

  const isPaid = Boolean(member?.isPaid);

  useEffect(() => {
    if (userID == null || member == null || isPaid || isLoading) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void syncPaymentStatus();
    }, PAYMENT_POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncPaymentStatus();
      }
    };

    const handleFocus = () => {
      void syncPaymentStatus();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLoading, isPaid, member, syncPaymentStatus, userID]);

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

  const canAccessPractice = Boolean(
    isPaid && theoryStatus != null && theoryStatus.pass === true
  );

  const renderTheoryExamStatus = () => {
    if (!isPaid) {
      return <span className="mh-status-pill mh-status-pill--muted">—</span>;
    }
    if (!theoryStatus || theoryStatus.pass == null) {
      return (
        <span className="mh-status-pill mh-status-pill--neutral">Chưa thi</span>
      );
    }
    if (theoryStatus.pass === false) {
      return (
        <span className="mh-status-pill mh-status-pill--danger theory-exam theory-exam-fail">
          Không đạt
        </span>
      );
    }
    return (
      <span className="mh-status-pill mh-status-pill--success theory-exam theory-exam-pass">
        Đạt
      </span>
    );
  };

  return (
    <section
      className="registered-course-container mh-enrolled-section"
      aria-labelledby="mh-enrolled-heading"
    >
      <div className="mh-enrolled-header">
        <h1
          id="mh-enrolled-heading"
          className="registered-course-title mh-section-title"
        >
          Khoá học của bạn
        </h1>
      </div>

      {isLoading ? (
        <div className="mh-enrolled-state" role="status" aria-live="polite">
          <CircularProgress size={34} className="mh-enrolled-spinner" />
          <p className="mh-enrolled-state__text">
            Đang tải thông tin khoá học...
          </p>
        </div>
      ) : errorMessage ? (
        <div
          className="mh-enrolled-state mh-enrolled-state--error"
          role="alert"
        >
          <p className="mh-enrolled-state__text">{errorMessage}</p>
          <button
            type="button"
            className="mh-enrolled-retry-btn"
            onClick={() => void loadEnrolledCourse()}
          >
            Thử lại
          </button>
        </div>
      ) : member != null && course != null ? (
        <div className="registered-course-content mh-enrolled-card">
          {!isPaid && (
            <div className="mh-payment-banner" role="alert">
              Bạn cần thanh toán học phí để truy cập vào khoá học.
            </div>
          )}

          <div className="mh-enrolled-summary">
            <div className="mh-enrolled-course-meta">
              <span className="mh-enrolled-eyebrow">Khoá học đã đăng ký</span>
              <h2 className="mh-enrolled-course-name">
                Khoá học {course.name ?? '—'}
              </h2>
              <p className="mh-enrolled-location">
                Địa điểm học: Trung tâm dạy lái xe B2 FDriving
              </p>
            </div>
            <div className="mh-enrolled-payment-badge">
              <span
                className={`mh-status-pill payment-status ${
                  isPaid
                    ? 'mh-status-pill--success payment-finish'
                    : 'mh-status-pill--danger payment-notyet'
                }`}
              >
                {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>

          <dl className="mh-enrolled-info-grid">
            <div className="mh-enrolled-info-item">
              <dt>Ngày khai giảng</dt>
              <dd>{formatDate(course.startDate)}</dd>
            </div>
            <div className="mh-enrolled-info-item">
              <dt>Trạng thái học lý thuyết</dt>
              <dd>
                {isPaid ? (
                  <span
                    className={`mh-status-pill theory-status ${
                      theoryStatus == null
                        ? 'mh-status-pill--warning theory-status-incomplete'
                        : 'mh-status-pill--success theory-status-complete'
                    }`}
                  >
                    {theoryStatus == null ? 'Chưa hoàn thành' : 'Hoàn thành'}
                  </span>
                ) : (
                  <span className="mh-status-pill mh-status-pill--muted">—</span>
                )}
              </dd>
            </div>
            <div className="mh-enrolled-info-item">
              <dt>Trạng thái kiểm tra lý thuyết</dt>
              <dd>{renderTheoryExamStatus()}</dd>
            </div>
            <div className="mh-enrolled-info-item">
              <dt>Trạng thái thanh toán</dt>
              <dd>{isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</dd>
            </div>
          </dl>

          <div className="mh-enrolled-actions-block">
            <h3 className="mh-enrolled-actions-title">
              Lịch học &amp; hồ sơ liên quan
            </h3>
            <div className="mh-enrolled-actions-grid">
              {isPaid ? (
                <Link
                  to="/khoa-hoc-cua-ban/lich-hoc-ly-thuyet"
                  className="mh-action-card"
                >
                  <span className="mh-action-card__title">
                    Lịch học lý thuyết
                  </span>
                  <span className="mh-action-card__desc">
                    Xem danh sách buổi học và giảng viên lý thuyết
                  </span>
                </Link>
              ) : (
                <Link
                  to="/khoa-hoc-cua-ban/lich-hoc-ly-thuyet"
                  className="mh-action-card disabled-link"
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="mh-action-card__title">
                    Lịch học lý thuyết
                  </span>
                  <span className="mh-action-card__desc">
                    Yêu cầu hoàn tất thanh toán học phí
                  </span>
                </Link>
              )}

              {canAccessPractice ? (
                <Link to="/danh-sach-khoa-hoc" className="mh-action-card">
                  <span className="mh-action-card__title">
                    Đăng ký lịch học thực hành
                  </span>
                  <span className="mh-action-card__desc">
                    Chọn giảng viên và khung giờ thực hành phù hợp
                  </span>
                </Link>
              ) : (
                <Link
                  to="/danh-sach-khoa-hoc"
                  className="mh-action-card disabled-link"
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="mh-action-card__title">
                    Đăng ký lịch học thực hành
                  </span>
                  <span className="mh-action-card__desc">
                    Mở khoá sau khi đạt kiểm tra lý thuyết
                  </span>
                </Link>
              )}

              {canAccessPractice ? (
                <Link
                  to="/khoa-hoc-cua-ban/lich-hoc-thuc-hanh"
                  className="mh-action-card"
                >
                  <span className="mh-action-card__title">
                    Lịch học thực hành
                  </span>
                  <span className="mh-action-card__desc">
                    Theo dõi ca học thực hành và trạng thái điểm danh
                  </span>
                </Link>
              ) : (
                <Link
                  to="/khoa-hoc-cua-ban/lich-hoc-thuc-hanh"
                  className="mh-action-card disabled-link"
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="mh-action-card__title">
                    Lịch học thực hành
                  </span>
                  <span className="mh-action-card__desc">
                    Mở khoá sau khi đạt kiểm tra lý thuyết
                  </span>
                </Link>
              )}

              {isPaid ? (
                <Link to="/ho-so-thi" className="mh-action-card">
                  <span className="mh-action-card__title">Hồ sơ thi</span>
                  <span className="mh-action-card__desc">
                    Xem đơn đề nghị học, sát hạch giấy phép lái xe
                  </span>
                </Link>
              ) : (
                <Link
                  to="/ho-so-thi"
                  className="mh-action-card disabled-link"
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="mh-action-card__title">Hồ sơ thi</span>
                  <span className="mh-action-card__desc">
                    Yêu cầu hoàn tất thanh toán học phí
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mh-enrolled-state" role="status">
          <h2 className="mh-enrolled-state__title">
            Bạn chưa đăng ký khoá học nào
          </h2>
          <p className="mh-enrolled-state__text">
            Khám phá các khoá học sắp khai giảng để đăng ký và bắt đầu lộ trình
            học lái xe của bạn.
          </p>
          <Link to="/#course-section" className="mh-enrolled-cta">
            Xem danh sách khoá học
          </Link>
        </div>
      )}
    </section>
  );
}

export default RegisteredCourse;
