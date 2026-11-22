import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import './member-practice-schedule.scss';
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

interface PracticeLessonItem {
  lessonId?: number | string;
  dayOfWeek?: string;
  shift?: string;
  lessonContent?: string;
  date?: string;
  attendance?: boolean;
  mentorId?: number | string;
}

interface MentorRecord {
  mentorId?: number | string;
  fullName?: string;
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

function formatDayOfWeek(day?: string): string {
  switch (day) {
    case 'Monday':
      return 'Thứ hai';
    case 'Tuesday':
      return 'Thứ ba';
    case 'Wednesday':
      return 'Thứ tư';
    case 'Thursday':
      return 'Thứ năm';
    case 'Friday':
      return 'Thứ sáu';
    case 'Saturday':
      return 'Thứ bảy';
    case 'Sunday':
      return 'Chủ nhật';
    default:
      return day || '—';
  }
}

function PracticeSchedule() {
  const user = readStoredUser();
  const userID = user?.userID;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [practiceSchedule, setPracticeSchedule] = useState<
    PracticeLessonItem[]
  >([]);
  const [mentor, setMentor] = useState<MentorRecord | null>(null);

  const loadPracticeSchedule = useCallback(async () => {
    if (userID == null) {
      setPracticeSchedule([]);
      setMentor(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const memberRes = await api.get<MemberRecord>('Member/' + userID);
      const memberData = memberRes.data;
      if (!memberData || memberData.memberID == null) {
        setPracticeSchedule([]);
        setMentor(null);
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('loginedMember', JSON.stringify(memberData));

      const studentRes = await api.get<StudentRecord>(
        'Student/' + memberData.memberID
      );
      const studentData = studentRes.data;
      if (!studentData?.studentId) {
        setPracticeSchedule([]);
        setMentor(null);
        setIsLoading(false);
        return;
      }

      let lessons: PracticeLessonItem[] = [];
      try {
        const lessonRes = await api.get<PracticeLessonItem[]>(
          'Lesson/practice/student/' + studentData.studentId
        );
        lessons = Array.isArray(lessonRes.data) ? lessonRes.data : [];
      } catch (err) {
        if (isExpectedNoLessonsError(err)) {
          lessons = [];
        } else {
          throw err;
        }
      }

      setPracticeSchedule(lessons);

      const uniqueMentorIds = Array.from(
        new Set(
          lessons
            .map((item) => item.mentorId)
            .filter(
              (id): id is number | string => id !== null && id !== undefined
            )
        )
      );

      if (uniqueMentorIds.length === 1) {
        try {
          const mentorRes = await api.get<MentorRecord>(
            'Mentor/' + uniqueMentorIds[0]
          );
          setMentor(mentorRes.data);
        } catch (err) {
          console.error(err);
          setMentor(null);
        }
      } else {
        setMentor(null);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setPracticeSchedule([]);
        setMentor(null);
      } else {
        console.error(err);
        setErrorMessage(
          'Không thể tải lịch học thực hành. Vui lòng thử lại sau.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [userID]);

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

  useEffect(() => {
    void loadPracticeSchedule();
  }, [loadPracticeSchedule]);

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: 'instant',
    });
  }, []);

  return (
    <section
      className="practice-schedule-container mh-practice-section"
      aria-labelledby="mh-practice-heading"
    >
      <div className="title-container mh-practice-header">
        <div className="mh-practice-breadcrumb">
          <Link to="/khoa-hoc-cua-ban" className="mh-practice-back-link">
            ← Quay lại khoá học của bạn
          </Link>
        </div>
        <h1
          id="mh-practice-heading"
          className="practice-container-title mh-section-title"
        >
          Lịch học thực hành
        </h1>
        {mentor != null && (
          <p className="practice-container-subtitle mh-practice-mentor-badge">
            Giáo viên: <strong>{mentor.fullName}</strong>
          </p>
        )}
      </div>

      <div className="practice-schedule-body mh-practice-body">
        <div className="practice-information mh-practice-shifts">
          <div className="mh-shift-chip">
            <span className="mh-shift-label">Ca sáng</span>
            <span className="morning-schedule">8h00 - 12h00</span>
          </div>
          <div className="mh-shift-chip">
            <span className="mh-shift-label">Ca chiều</span>
            <span className="afternoon-schedule">13h00 - 17h00</span>
          </div>
        </div>

        {isLoading ? (
          <div className="mh-practice-state" role="status" aria-live="polite">
            <CircularProgress size={34} className="mh-practice-spinner" />
            <p className="mh-practice-state__text">
              Đang tải lịch học thực hành...
            </p>
          </div>
        ) : errorMessage ? (
          <div
            className="mh-practice-state mh-practice-state--error"
            role="alert"
          >
            <p className="mh-practice-state__text">{errorMessage}</p>
            <button
              type="button"
              className="mh-practice-retry-btn"
              onClick={() => void loadPracticeSchedule()}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="mh-practice-table-card">
            <div className="mh-practice-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="practice-no">STT</th>
                    <th className="practice-day">Thứ</th>
                    <th className="practice-time">Ca học</th>
                    <th className="practice-time">Nội dung</th>
                    <th className="practice-time">Ngày</th>
                    <th className="practice-time">Tình trạng điểm danh</th>
                  </tr>
                </thead>
                <tbody>
                  {practiceSchedule.length > 0 ? (
                    practiceSchedule.map((lesson, index) => (
                      <tr
                        key={
                          lesson.lessonId ??
                          `${lesson.date ?? 'practice'}-${index}`
                        }
                      >
                        <td className="mh-col-center">{index + 1}</td>
                        <td>{formatDayOfWeek(lesson.dayOfWeek)}</td>
                        <td>{lesson.shift || '—'}</td>
                        <td>{lesson.lessonContent || '—'}</td>
                        <td className="mh-col-nowrap">
                          {formatDate(lesson.date)}
                        </td>
                        <td className="mh-col-center">
                          <span
                            className={`mh-attendance-pill ${
                              lesson.attendance
                                ? 'mh-attendance-pill--present'
                                : 'mh-attendance-pill--absent'
                            }`}
                          >
                            {lesson.attendance ? 'Có mặt' : 'Vắng'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="mh-empty-row">
                      <td colSpan={6}>
                        <div className="mh-empty-cell" role="status">
                          <p className="mh-empty-title">
                            Bạn chưa đăng ký khoá học nào!
                          </p>
                          <p className="mh-empty-desc">
                            Hiện chưa có buổi học thực hành nào được xếp cho tài
                            khoản của bạn.
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

        <div className="practice-schedule-note mh-practice-note">
          <strong>Lưu ý:</strong> Học viên phải bắt buộc tham gia ca học đêm và
          học đủ các buổi học để có thể tham gia thi bằng lái xe B2.
        </div>
      </div>
    </section>
  );
}

export default PracticeSchedule;
