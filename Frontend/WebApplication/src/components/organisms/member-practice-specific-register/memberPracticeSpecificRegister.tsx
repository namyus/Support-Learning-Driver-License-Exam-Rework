import { useCallback, useEffect, useState } from 'react';
import './member-practice-specific-register.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CircularProgress } from '@mui/material';
import api from '../../../config/axios';

interface StoredUser {
  userID?: number | string;
}

interface MemberRecord {
  memberID?: number | string;
}

interface StudentRecord {
  studentId?: string | number;
}

interface MentorRecord {
  mentorId?: number | string;
  fullName?: string;
}

interface PracticeClassItem {
  classId: number | string;
  dayOfWeek?: number;
  shift?: string;
}

interface PracticeScheduleItem {
  lessonId?: number | string;
  mentorId?: number | string;
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

function isExpectedNoLessonsError(err: unknown): boolean {
  if (!axios.isAxiosError(err) || err.response?.status !== 404) {
    return false;
  }
  const data = err.response.data as { error?: unknown } | undefined;
  return (
    typeof data?.error === 'string' &&
    data.error.trim() === 'Không tìm thấy buổi học!'
  );
}

function formatPracticeDay(dayOfWeek?: number): string {
  switch (dayOfWeek) {
    case 2:
      return 'Thứ hai';
    case 3:
      return 'Thứ ba';
    case 4:
      return 'Thứ tư';
    case 5:
      return 'Thứ năm';
    case 6:
      return 'Thứ sáu';
    case 7:
      return 'Thứ bảy';
    case 8:
      return 'Chủ nhật';
    default:
      return '—';
  }
}

function PracticeSpecificRegister() {
  const user = readStoredUser();
  const userID = user?.userID;

  const { mentorId, courseId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [mentor, setMentor] = useState<MentorRecord | null>(null);
  const [practiceSchedule, setPracticeSchedule] = useState<
    PracticeScheduleItem[]
  >([]);
  const [practiceClass, setPracticeClass] = useState<PracticeClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAlreadyRegisteredNotice = () => {
    toast.warning('Mỗi học viên chỉ được đăng ký một buổi học thực hành.', {
      autoClose: 7000,
      pauseOnHover: true,
      closeOnClick: true,
    });
  };

  const loadSpecificRegisterData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [classResult, mentorResult, memberResult] = await Promise.all([
        courseId && mentorId
          ? api
              .get<PracticeClassItem[]>(
                'Class/course/mentor/practice?courseId=' +
                  courseId +
                  '&mentorId=' +
                  mentorId
              )
              .then((res) => (Array.isArray(res.data) ? res.data : []))
              .catch((err: unknown) => {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                  return [] as PracticeClassItem[];
                }
                throw err;
              })
          : Promise.resolve([] as PracticeClassItem[]),
        mentorId
          ? api
              .get<MentorRecord>('Mentor/' + mentorId)
              .then((res) => res.data)
              .catch(() => null)
          : Promise.resolve(null),
        userID != null
          ? api
              .get<MemberRecord>('Member/' + userID)
              .then((res) => res.data)
              .catch(() => null)
          : Promise.resolve(null),
      ]);

      setPracticeClass(classResult);
      setMentor(mentorResult);

      if (memberResult?.memberID != null) {
        let studentData: StudentRecord | null = null;
        try {
          const studentRes = await api.get<StudentRecord>(
            'Student/' + memberResult.memberID
          );
          studentData = studentRes.data;
          setStudent(studentData);
          sessionStorage.setItem('loginedStudent', JSON.stringify(studentData));
        } catch (err) {
          console.log(err);
          setStudent(null);
        }

        if (studentData?.studentId != null) {
          try {
            const scheduleRes = await api.get<PracticeScheduleItem[]>(
              'Lesson/practice/student/' + studentData.studentId
            );
            setPracticeSchedule(
              Array.isArray(scheduleRes.data) ? scheduleRes.data : []
            );
          } catch (err) {
            if (isExpectedNoLessonsError(err)) {
              setPracticeSchedule([]);
            } else {
              console.error(err);
              setPracticeSchedule([]);
            }
          }
        } else {
          setPracticeSchedule([]);
        }
      } else {
        setStudent(null);
        setPracticeSchedule([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        'Không thể tải danh sách ca học thực hành. Vui lòng thử lại sau.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId, mentorId, userID]);

  useEffect(() => {
    void loadSpecificRegisterData();
  }, [loadSpecificRegisterData]);

  const handleRegister = async (
    studentId: string | number | undefined,
    classId: number | string
  ) => {
    if (studentId == null) {
      toast.error('Không tìm thấy thông tin học viên để đăng ký.');
      return;
    }
    setIsRegistering(true);
    try {
      const response = await api.post('ClassStudent', {
        studentId: studentId,
        classId: classId,
      });
      if (response.status === 200) {
        toast.success('Đăng ký thành công!');
        navigate('/khoa-hoc-cua-ban');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const serverError = (
          error.response?.data as { error?: unknown } | undefined
        )?.error;
        const messageText =
          typeof serverError === 'string' ? serverError.trim() : '';

        if (status === 409) {
          if (messageText.toLowerCase().includes('đã tồn tại trong lớp học')) {
            toast.warning('Bạn đã đăng ký lớp thực hành này rồi.', {
              autoClose: 7000,
              pauseOnHover: true,
              closeOnClick: true,
            });
          } else if (messageText.toLowerCase().includes('đủ học viên')) {
            toast.warning('Lớp thực hành đã đủ số lượng học viên.');
          } else if (messageText) {
            toast.warning(messageText);
          } else {
            toast.warning(
              'Không thể đăng ký lớp thực hành này. Vui lòng kiểm tra thông tin hoặc liên hệ trung tâm.'
            );
          }
          return;
        }

        if (status === 400 && messageText.toLowerCase().includes('đủ học viên')) {
          toast.warning('Lớp thực hành đã đủ số lượng học viên.');
          return;
        }

        if (messageText) {
          toast.error(messageText);
          return;
        }
      }

      toast.error(
        'Không thể đăng ký lớp thực hành này. Vui lòng kiểm tra thông tin hoặc liên hệ trung tâm.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <section
      className="practice-register-container mh-specific-register-section"
      aria-labelledby="mh-specific-register-heading"
    >
      <div className="title-container mh-specific-header">
        <div className="mh-specific-breadcrumb">
          <Link to="/danh-sach-khoa-hoc" className="mh-specific-back-link">
            ← Quay lại danh sách giảng viên
          </Link>
        </div>
        <h1
          id="mh-specific-register-heading"
          className="practice-container-title mh-section-title"
        >
          Đăng ký lịch học thực hành
        </h1>
        {mentor != null && (
          <p className="practice-container-subtitle mh-specific-mentor-badge">
            Giáo viên: <strong>{mentor.fullName}</strong>
          </p>
        )}
      </div>

      <div className="practice-register-body mh-specific-body">
        <div className="practice-information mh-specific-shifts">
          <div className="mh-shift-chip">
            <span className="mh-shift-label">Ca sáng</span>
            <span className="morning-register">8h00 - 12h00</span>
          </div>
          <div className="mh-shift-chip">
            <span className="mh-shift-label">Ca chiều</span>
            <span className="afternoon-register">13h00 - 17h00</span>
          </div>
        </div>

        {isLoading ? (
          <div className="mh-specific-state" role="status" aria-live="polite">
            <CircularProgress size={34} className="mh-specific-spinner" />
            <p className="mh-specific-state__text">
              Đang tải lịch dạy của giáo viên...
            </p>
          </div>
        ) : errorMessage ? (
          <div
            className="mh-specific-state mh-specific-state--error"
            role="alert"
          >
            <p className="mh-specific-state__text">{errorMessage}</p>
            <button
              type="button"
              className="mh-specific-retry-btn"
              onClick={() => void loadSpecificRegisterData()}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="mh-specific-table-card">
            <div className="mh-specific-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="practice-no">STT</th>
                    <th className="practice-day">Thứ</th>
                    <th className="practice-time">Ca học</th>
                    <th className="practice-time">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {practiceClass.length > 0 ? (
                    practiceClass.map((lesson, index) => (
                      <tr key={lesson.classId ?? index}>
                        <td className="mh-col-center">{index + 1}</td>
                        <td>{formatPracticeDay(lesson.dayOfWeek)}</td>
                        <td>{lesson.shift || '—'}</td>
                        <td className="mh-col-center">
                          {practiceSchedule.length > 0 ? (
                            <button
                              className="btn btn-primary mh-register-btn"
                              type="button"
                              onClick={handleAlreadyRegisteredNotice}
                            >
                              Đăng ký
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary mh-register-btn"
                              type="button"
                              disabled={isRegistering || !student?.studentId}
                              onClick={() =>
                                void handleRegister(
                                  student?.studentId,
                                  lesson.classId
                                )
                              }
                            >
                              {isRegistering ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="mh-empty-row">
                      <td colSpan={4}>
                        <div className="mh-empty-cell" role="status">
                          <p className="mh-empty-title">
                            Giáo viên chưa đăng ký lịch
                          </p>
                          <p className="mh-empty-desc">
                            Hiện chưa có ca học thực hành nào khả dụng từ giáo
                            viên này cho khoá học của bạn.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="practice-register-note mh-specific-note">
          <strong>Lưu ý:</strong> Học viên phải bắt buộc tham gia ca học đêm và
          học đủ các buổi học để có thể tham gia thi bằng lái xe B2.
        </div>
      </div>
    </section>
  );
}

export default PracticeSpecificRegister;
