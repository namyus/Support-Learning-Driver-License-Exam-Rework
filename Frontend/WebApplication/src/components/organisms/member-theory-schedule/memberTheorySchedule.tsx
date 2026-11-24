import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import './member-theory-schedule.scss';
import { useAppDispatch } from '../../../app/store';
import { fetchTheoryLessonsByStudentId } from '../../../features/classes/classesSlice';
import { fetchMemberByUserId } from '../../../features/members/membersSlice';
import type { MemberRecord } from '../../../features/members/membersTypes';
import { fetchMentorById } from '../../../features/mentors/mentorsSlice';
import type { MentorRecord } from '../../../features/mentors/mentorsTypes';
import { fetchStudentByMemberId } from '../../../features/students/studentsSlice';
import {
  getApiErrorStatus,
  type ApiRejectedPayload,
} from '../../../features/shared/apiError';

interface StoredUser {
  userID?: number | string;
}

interface TheoryLessonItem {
  lessonId?: number | string;
  date?: string;
  mentorId?: number | string;
  lessonContent?: string;
  location?: string;
}

function readSessionJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isExpectedNoLessonsError(err: unknown): boolean {
  if (getApiErrorStatus(err) !== 404) {
    return false;
  }
  const errorText = (err as ApiRejectedPayload | null)?.error;
  return (
    typeof errorText === 'string' &&
    errorText.trim() === 'Không tìm thấy buổi học!'
  );
}

function TheorySchedule() {
  const dispatch = useAppDispatch();
  const [theorySchedule, setTheorySchedule] = useState<TheoryLessonItem[]>([]);
  const [mentor, setMentor] = useState<MentorRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTheorySchedule = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let memberData = readSessionJson<MemberRecord>('loginedMember');
      if (!memberData?.memberID) {
        const user = readSessionJson<StoredUser>('loginedUser');
        if (user?.userID != null) {
          memberData = await dispatch(fetchMemberByUserId(user.userID)).unwrap();
          if (memberData?.memberID != null) {
            sessionStorage.setItem('loginedMember', JSON.stringify(memberData));
          }
        }
      }

      if (!memberData?.memberID) {
        setTheorySchedule([]);
        setMentor(null);
        setIsLoading(false);
        return;
      }

      const studentRes = await dispatch(
        fetchStudentByMemberId(memberData.memberID)
      ).unwrap();
      const studentData = studentRes.student;

      if (!studentData?.studentId) {
        setTheorySchedule([]);
        setMentor(null);
        setIsLoading(false);
        return;
      }

      let lessons: TheoryLessonItem[] = [];
      try {
        const lessonData = await dispatch(
          fetchTheoryLessonsByStudentId(studentData.studentId)
        ).unwrap();
        lessons = Array.isArray(lessonData) ? lessonData : [];
      } catch (err) {
        if (isExpectedNoLessonsError(err)) {
          lessons = [];
        } else {
          throw err;
        }
      }

      setTheorySchedule(lessons);

      const uniqueMentorIds = Array.from(
        new Set(
          lessons
            .map((item) => item.mentorId)
            .filter((id): id is number | string => id !== null && id !== undefined)
        )
      );

      if (uniqueMentorIds.length > 0) {
        try {
          const mentorRes = await dispatch(
            fetchMentorById(uniqueMentorIds[0])
          ).unwrap();
          setMentor(mentorRes.mentor);
        } catch (err) {
          console.log(err);
          setMentor(null);
        }
      } else {
        setMentor(null);
      }
    } catch (error) {
      if (getApiErrorStatus(error) === 404) {
        setTheorySchedule([]);
        setMentor(null);
      } else {
        console.log(error);
        setErrorMessage(
          'Không thể tải lịch học lý thuyết. Vui lòng thử lại sau.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void loadTheorySchedule();
  }, [loadTheorySchedule]);

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

  return (
    <section
      className="theory-schedule-container mh-schedule-section"
      aria-labelledby="mh-theory-heading"
    >
      <div className="title-container mh-schedule-header">
        <div className="mh-schedule-breadcrumb">
          <Link to="/khoa-hoc-cua-ban" className="mh-schedule-back-link">
            ← Quay lại khoá học của bạn
          </Link>
        </div>
        <h1
          id="mh-theory-heading"
          className="theory-container-title mh-section-title"
        >
          Lịch học lý thuyết
        </h1>
        {theorySchedule.length > 0 && (
          <p className="theory-container-subtitle mh-schedule-subtitle">
            Thời gian học lý thuyết từ ngày{' '}
            <strong>{formatDate(theorySchedule[0].date)}</strong> đến hết ngày{' '}
            <strong>
              {formatDate(theorySchedule[theorySchedule.length - 1].date)}
            </strong>
            <br />
            Buổi sáng từ 7h30 đến 11h30; buổi chiều từ 13h00 đến 17h00
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="mh-schedule-state" role="status" aria-live="polite">
          <CircularProgress size={34} className="mh-schedule-spinner" />
          <p className="mh-schedule-state__text">
            Đang tải lịch học lý thuyết...
          </p>
        </div>
      ) : errorMessage ? (
        <div
          className="mh-schedule-state mh-schedule-state--error"
          role="alert"
        >
          <p className="mh-schedule-state__text">{errorMessage}</p>
          <button
            type="button"
            className="mh-schedule-retry-btn"
            onClick={() => void loadTheorySchedule()}
          >
            Thử lại
          </button>
        </div>
      ) : theorySchedule.length > 0 ? (
        <div className="mh-schedule-table-card">
          <div className="mh-schedule-table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="class-no">STT</th>
                  <th className="class-time">Thời gian</th>
                  <th className="class-mentor">Giáo viên</th>
                  <th className="class-content">Nội dung</th>
                  <th className="class-destination">Địa điểm</th>
                </tr>
              </thead>
              <tbody>
                {theorySchedule.map((item, index) => (
                  <tr key={item.lessonId ?? `${item.date ?? 'lesson'}-${index}`}>
                    <td className="class-no-content">{index + 1}</td>
                    <td className="class-time-content">
                      {formatDate(item.date)}
                    </td>
                    <td className="class-mentor-content">
                      {mentor?.fullName ?? '—'}
                    </td>
                    <td className="class-content-content">
                      {item.lessonContent || '—'}
                    </td>
                    <td className="class-destination-content">
                      {item.location || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mh-schedule-state" role="status">
          <h2 className="mh-schedule-state__title">Chưa có lịch trình học</h2>
          <p className="mh-schedule-state__text">
            Hiện chưa có buổi học lý thuyết nào được xếp cho tài khoản học viên
            này.
          </p>
        </div>
      )}

      <div className="theory-schedule-note mh-schedule-note">
        <strong>Ghi chú:</strong> Học viên tham gia học và điểm danh đầy đủ theo
        quy định. Học viên cần tham gia hơn 90% tổng số buổi học lý thuyết để đủ
        điều kiện tham gia cuộc kiểm tra lý thuyết.
      </div>
    </section>
  );
}

export default TheorySchedule;
