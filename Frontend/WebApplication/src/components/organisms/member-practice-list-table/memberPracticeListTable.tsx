import { useCallback, useEffect, useState } from 'react';
import './member-practice-list-table.scss';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useAppDispatch } from '../../../app/store';
import { fetchCourseById } from '../../../features/courses/coursesSlice';
import { fetchMemberByUserId } from '../../../features/members/membersSlice';
import { fetchMentors } from '../../../features/mentors/mentorsSlice';
import type { MentorRecord } from '../../../features/mentors/mentorsTypes';

interface StoredUser {
  userID?: number | string;
}

interface CourseRecord {
  courseId?: string | number;
  name?: string;
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

function PracticeList() {
  const dispatch = useAppDispatch();
  const user = readStoredUser();
  const userID = user?.userID;

  const [mentors, setMentors] = useState<MentorRecord[]>([]);
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPracticeList = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [mentorList, memberData] = await Promise.all([
        dispatch(fetchMentors()).unwrap(),
        userID != null
          ? dispatch(fetchMemberByUserId(userID)).unwrap()
          : Promise.resolve(null),
      ]);

      setMentors(Array.isArray(mentorList) ? mentorList : []);

      if (memberData) {
        sessionStorage.setItem('loginedMember', JSON.stringify(memberData));
      }

      if (memberData?.courseId != null) {
        const courseData = (await dispatch(
          fetchCourseById(String(memberData.courseId))
        ).unwrap()) as CourseRecord;
        setCourse(courseData);
      } else {
        setCourse(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        'Không thể tải danh sách giảng viên thực hành. Vui lòng thử lại sau.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, userID]);

  useEffect(() => {
    void loadPracticeList();
  }, [loadPracticeList]);

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: 'instant',
    });
  }, []);

  return (
    <section
      className="practice-list-container mh-practice-list-section"
      aria-labelledby="mh-practice-list-heading"
    >
      <div className="mh-practice-list-header">
        <div className="mh-practice-list-breadcrumb">
          <Link to="/khoa-hoc-cua-ban" className="mh-practice-list-back-link">
            ← Quay lại khoá học của bạn
          </Link>
        </div>
        <h1
          id="mh-practice-list-heading"
          className="practice-list-title mh-section-title"
        >
          {course?.name
            ? `Đăng ký lịch học thực hành khoá học ${course.name}`
            : 'Đăng ký lịch học thực hành'}
        </h1>
      </div>

      {isLoading ? (
        <div
          className="mh-practice-list-state"
          role="status"
          aria-live="polite"
        >
          <CircularProgress size={34} className="mh-practice-list-spinner" />
          <p className="mh-practice-list-state__text">
            Đang tải danh sách giảng viên...
          </p>
        </div>
      ) : errorMessage ? (
        <div
          className="mh-practice-list-state mh-practice-list-state--error"
          role="alert"
        >
          <p className="mh-practice-list-state__text">{errorMessage}</p>
          <button
            type="button"
            className="mh-practice-list-retry-btn"
            onClick={() => void loadPracticeList()}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="mh-practice-list-card">
          <div className="mh-practice-list-wrap">
            <table>
              <thead>
                <tr>
                  <th className="course-no">STT</th>
                  <th className="course-mentor">Giảng viên</th>
                  <th className="course-course">Khoá</th>
                  <th className="course-schedule">Lịch dạy của giáo viên</th>
                </tr>
              </thead>
              <tbody>
                {mentors.length > 0 && course != null ? (
                  mentors.map((item, index) => (
                    <tr
                      key={item.mentorId ?? `${item.fullName ?? 'mentor'}-${index}`}
                    >
                      <td className="course-no-content">{index + 1}</td>
                      <td className="course-mentor-content">
                        {item.fullName || '—'}
                      </td>
                      <td className="course-course-name">
                        <span className="mh-course-pill">
                          {course.name || '—'}
                        </span>
                      </td>
                      <td className="course-schedule-content">
                        <Link
                          to={`/danh-sach-khoa-hoc/khoa-hoc/${item.mentorId}/${course.courseId}`}
                          className="mh-detail-link"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="mh-empty-row">
                    <td colSpan={4}>
                      <div className="mh-empty-cell" role="status">
                        Không có dữ liệu
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default PracticeList;
