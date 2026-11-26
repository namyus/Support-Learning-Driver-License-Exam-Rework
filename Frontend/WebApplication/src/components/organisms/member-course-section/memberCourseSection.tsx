import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../../app/store';
import { fetchCourseList } from '../../../features/courses/coursesSlice';
import type {
  ApiRejectedPayload,
  CourseRecord,
} from '../../../features/courses/coursesTypes';
import './member-course-section.scss';

function Course() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseRecord[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const recordPage = 3;

  const currentDate = new Date();
  const upcomingCourses = courses.filter((course) => {
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const courseMonth = course.courseMonth ?? 0;
    const courseYear = course.courseYear ?? 0;

    return (
      courseYear > currentYear ||
      (courseYear === currentYear && courseMonth >= currentMonth)
    );
  });

  const isShowingFallbackCourses =
    upcomingCourses.length === 0 && courses.length > 0;
  const filteredCourses = isShowingFallbackCourses
    ? [...courses].reverse()
    : upcomingCourses;

  const npage = Math.ceil(filteredCourses.length / recordPage);
  const lastIndex = currentPage * recordPage;
  const firstIndex = lastIndex - recordPage;
  const records = filteredCourses.slice(firstIndex, lastIndex);
  const numbers = npage > 0 ? [...Array(npage + 1).keys()].slice(1) : [];

  const getCourseData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const allCourses = await dispatch(fetchCourseList()).unwrap();

      if (!Array.isArray(allCourses)) {
        setCourses([]);
        setErrorMessage('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
        setIsLoading(false);
        return;
      }

      const uniqueCourses: CourseRecord[] = [];
      const seen = new Set<string>();

      allCourses.forEach((course) => {
        const courseKey = `${course.courseMonth}/${course.courseYear}`;
        if (!seen.has(courseKey)) {
          seen.add(courseKey);
          uniqueCourses.push(course);
        }
      });

      uniqueCourses.sort((a, b) => {
        if (a.courseYear === b.courseYear) {
          return (a.courseMonth ?? 0) - (b.courseMonth ?? 0);
        }
        return (a.courseYear ?? 0) - (b.courseYear ?? 0);
      });

      setCourses(uniqueCourses);
      setCurrentPage(1);
      setIsLoading(false);
    } catch (error) {
      console.error(error);

      const rejected = error as ApiRejectedPayload | undefined;
      const isKnownNoCourse404 =
        rejected?.status === 404 &&
        rejected?.error === 'Không tìm thấy khóa học!';

      if (isKnownNoCourse404) {
        setCourses([]);
        setErrorMessage(null);
      } else {
        setCourses([]);
        setErrorMessage('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
      }

      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void getCourseData();
  }, [getCourseData]);

  const formatDate = (dbDate?: string) => {
    if (!dbDate) {
      return '';
    }
    const date = new Date(dbDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const prePage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changeCPage = (id: number) => {
    setCurrentPage(id);
  };

  const nextPage = () => {
    if (currentPage < npage) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <section
      className="course-container mh-course-section"
      id="course-section"
      aria-labelledby="mh-course-heading"
    >
      <div className="mh-section-header">
        <h2 id="mh-course-heading" className="mh-section-title">
          {isShowingFallbackCourses ? 'Các khóa học hiện có' : 'Các khoá học'}
        </h2>
        {isShowingFallbackCourses && (
          <p
            className="mh-course-state__text"
            style={{ marginTop: '8px', marginBottom: 0, textAlign: 'center' }}
          >
            Hiện chưa có khóa học sắp khai giảng — hiển thị các khóa học hiện có
            trong hệ thống.
          </p>
        )}
      </div>

      {isLoading ? (
        <div
          className="mh-course-state mh-course-state--loading"
          role="status"
          aria-live="polite"
        >
          <div className="mh-course-state__spinner" aria-hidden="true" />
          <p className="mh-course-state__text">Đang tải danh sách khóa học...</p>
        </div>
      ) : errorMessage ? (
        <div className="mh-course-state mh-course-state--error" role="alert">
          <p className="mh-course-state__text">{errorMessage}</p>
          <button
            type="button"
            className="mh-course-state__retry"
            onClick={() => void getCourseData()}
          >
            Thử lại
          </button>
        </div>
      ) : records.length > 0 ? (
        <div className="course-list mh-course-grid">
          {records.map((course, i) => (
            <article
              className="course-section-1 mh-course-card"
              key={course.courseId ?? `${course.courseMonth}-${course.courseYear}-${i}`}
            >
              <div className="upperbox mh-course-card__header">
                <h3 className="mh-course-card__title">
                  Khóa học tháng {course.courseMonth}/{course.courseYear}
                </h3>
              </div>
              <div className="course-content mh-course-card__body">
                <ul className="course-content-list mh-course-card__list">
                  <li>1. Khai giảng ngày {formatDate(course.startDate)}</li>
                  <li>2. Cam kết học phí trọn gói - hợp lý</li>
                  <li>3. Lịch thi chuẩn - không chậm trễ</li>
                  <li>4. Dịch vụ 1 kèm 1</li>
                  <li>5. Đội ngũ giáo viên chất lượng</li>
                  <li>6. Sau 4 tháng bế giảng khoá</li>
                </ul>
              </div>
              <div className="underbox mh-course-card__footer">
                <Link
                  to={`/khoahoc/${course.courseMonth}/${course.courseYear}`}
                  className="mh-course-card__cta"
                >
                  Xem khoá học
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mh-course-state mh-course-state--empty" role="status">
          <p className="mh-course-state__text">
            Hiện chưa có khóa học sắp khai giảng.
          </p>
        </div>
      )}

      {!isLoading && !errorMessage && filteredCourses.length > recordPage && (
        <nav className="mh-course-pagination" aria-label="Phân trang khóa học">
          <ul className="pagination">
            <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={prePage}
                disabled={currentPage <= 1}
              >
                Prev
              </button>
            </li>
            {numbers.map((n) => (
              <li
                className={`page-item ${currentPage === n ? 'active' : ''}`}
                key={n}
              >
                <button
                  type="button"
                  className="page-link"
                  aria-current={currentPage === n ? 'page' : undefined}
                  onClick={() => changeCPage(n)}
                >
                  {n}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${currentPage >= npage ? 'disabled' : ''}`}
            >
              <button
                type="button"
                className="page-link"
                onClick={nextPage}
                disabled={currentPage >= npage}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </section>
  );
}

export default Course;
