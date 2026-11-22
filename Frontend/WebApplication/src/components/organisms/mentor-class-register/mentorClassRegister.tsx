import { useCallback, useEffect, useMemo, useState } from 'react';
import './mentor-class-register.scss';
import api from '../../../config/axios';
import Button from 'react-bootstrap/esm/Button';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../app/store';
import { fetchCourseList } from '../../../features/courses/coursesSlice';
import type { CourseRecord } from '../../../features/courses/coursesTypes';

interface MentorRecord {
  mentorId?: number | string;
  fullName?: string;
}

interface MentorClassScheduleItem {
  classId?: number | string;
  courseId?: string;
}

function MentorClassRegister() {
  const dispatch = useAppDispatch();
  const user = sessionStorage.getItem('loginedUser')
    ? JSON.parse(sessionStorage.getItem('loginedUser')!)
    : null;
  const userId = user?.userID;
  const [course, setCourse] = useState<CourseRecord[]>([]);
  const [mentor, setMentor] = useState<MentorRecord | null>(null);
  const mentorId = mentor?.mentorId;
  const [teachingSchedule, setTeachingSchedule] = useState<
    MentorClassScheduleItem[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const recordPage = 10;
  const navigate = useNavigate();

  const getMentorByID = useCallback(async () => {
    try {
      if (userId == null) return;
      const response = await api.get('Mentor/user/' + userId);
      setMentor(response.data);
    } catch (err) {
      console.error((err as Error).message);
    }
  }, [userId]);

  const getCourseByID = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await dispatch(fetchCourseList()).unwrap();
      setCourse(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error((err as { message?: string })?.message);
      setCourse([]);
      setLoadError('Không thể tải danh sách các khóa học B2.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const getTeachingSchedule = useCallback(async () => {
    try {
      if (!mentorId) return;
      const response = await api.get('Class/' + mentorId);
      setTeachingSchedule(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error((err as Error).message);
    }
  }, [mentorId]);

  const formatDate = (dbDate?: string) => {
    if (!dbDate) return '—';
    const date = new Date(dbDate);
    if (Number.isNaN(date.getTime())) return '—';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isCourseRegistered = (courseId: string) => {
    return teachingSchedule.some((schedule) => schedule.courseId === courseId);
  };

  const handleRegister = (courseId: string) => {
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
    navigate(`/danh-sach-khoa-hoc-giao-vien/dang-ki-lich-day/${courseId}`);
  };

  useEffect(() => {
    void getMentorByID();
  }, [getMentorByID]);

  useEffect(() => {
    if (mentorId) {
      void getTeachingSchedule();
    }
  }, [mentorId, getTeachingSchedule]);

  useEffect(() => {
    void getCourseByID();
  }, [getCourseByID]);

  const registeredCount = course.filter((item) =>
    isCourseRegistered(item.courseId)
  ).length;
  const availableCount = course.length - registeredCount;

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    return course.filter((item) => {
      const registered = teachingSchedule.some(
        (schedule) => schedule.courseId === item.courseId
      );
      if (registrationFilter === 'registered' && !registered) return false;
      if (registrationFilter === 'available' && registered) return false;
      if (!query) return true;
      return [item.courseId, item.name].some((val) =>
        String(val ?? '').toLocaleLowerCase('vi').includes(query)
      );
    });
  }, [course, searchQuery, registrationFilter, teachingSchedule]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / recordPage));
  const safePage = Math.min(currentPage, totalPages);
  const firstIndex = (safePage - 1) * recordPage;
  const records = filteredCourses.slice(firstIndex, firstIndex + recordPage);

  return (
    <div className="mentor-course-register-page">
      <header className="class-register-title mentor-list-header">
        <div>
          <span className="mentor-page-eyebrow">Đăng ký giảng dạy</span>
          <h1>Danh sách các khóa học B2</h1>
          <p>
            Chọn khóa học chưa đăng ký để thiết lập lịch dạy thực hành theo các ca trong tuần.
          </p>
        </div>
      </header>

      <section className="mentor-summary-strip" aria-label="Tổng quan khóa học B2">
        <div className="mentor-summary-pill">
          <span className="mentor-summary-pill__label">Tổng khóa học đã tải</span>
          <strong className="mentor-summary-pill__value">
            {isLoading || loadError ? '—' : course.length}
          </strong>
        </div>
        <div className="mentor-summary-pill mentor-summary-pill--info">
          <span className="mentor-summary-pill__label">Có thể đăng ký dạy</span>
          <strong className="mentor-summary-pill__value">
            {isLoading || loadError ? '—' : availableCount}
          </strong>
        </div>
        <div className="mentor-summary-pill mentor-summary-pill--success">
          <span className="mentor-summary-pill__label">Đã đăng ký lịch dạy</span>
          <strong className="mentor-summary-pill__value">
            {isLoading || loadError ? '—' : registeredCount}
          </strong>
        </div>
      </section>
      <p className="mentor-metrics-note">
        Số liệu tính trên các khóa học trả về từ API Course/list và danh sách lớp của giảng viên.
      </p>

      <div className="class-register-container">
        <form onSubmit={(e) => e.preventDefault()}>
          <section className="mentor-table-card" aria-label="Danh sách khóa học B2">
            <div className="mentor-table-toolbar">
              <div className="mentor-table-toolbar__search">
                <label className="mentor-sr-only" htmlFor="mentor-course-search">
                  Tìm kiếm khóa học
                </label>
                <input
                  id="mentor-course-search"
                  className="mentor-search-input"
                  type="search"
                  placeholder="Tìm theo mã khóa học hoặc tên khóa học..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  autoComplete="off"
                />
              </div>

              <div className="mentor-table-toolbar__filters">
                <div className="mentor-filter-group">
                  <label
                    className="mentor-filter-label"
                    htmlFor="mentor-registration-filter"
                  >
                    Tình trạng
                  </label>
                  <select
                    id="mentor-registration-filter"
                    className="mentor-filter-select"
                    value={registrationFilter}
                    onChange={(e) => {
                      setRegistrationFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">Tất cả ({course.length})</option>
                    <option value="available">
                      Chưa đăng ký ({availableCount})
                    </option>
                    <option value="registered">
                      Đã đăng ký ({registeredCount})
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div
              className="mentor-table-scroll"
              role="region"
              aria-label="Bảng khóa học B2"
              tabIndex={0}
            >
              <table className="class-register-table mentor-data-table">
                <thead className="class-register-table-header">
                  <tr>
                    <th scope="col">STT</th>
                    <th scope="col">Mã khóa học</th>
                    <th scope="col">Tên khóa học</th>
                    <th scope="col">Thời gian đào tạo</th>
                    <th scope="col" className="col-center">
                      Phân loại
                    </th>
                    <th scope="col" className="col-center">
                      Trạng thái đăng ký
                    </th>
                    <th scope="col" className="col-actions">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="class-table-body">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="mentor-table-state" role="status">
                          Đang tải danh sách khóa học…
                        </div>
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={7}>
                        <div
                          className="mentor-table-state mentor-table-state--error"
                          role="alert"
                        >
                          <span>{loadError}</span>
                          <button
                            type="button"
                            className="mentor-retry-btn"
                            onClick={() => void getCourseByID()}
                          >
                            Thử lại
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : records.length > 0 ? (
                    records.map((item, index) => {
                      const registered = isCourseRegistered(item.courseId);
                      return (
                        <tr key={item.courseId}>
                          <td className="cell-index">{firstIndex + index + 1}</td>
                          <td>
                            <span className="mentor-id-badge">{item.courseId}</span>
                          </td>
                          <td className="cell-strong">{item.name}</td>
                          <td className="cell-mono">
                            {formatDate(item.startDate)} – {formatDate(item.endDate)}
                          </td>
                          <td className="col-center">
                            <span className="mentor-type-badge">Thực hành</span>
                          </td>
                          <td className="col-center">
                            <span
                              className={`status-badge ${
                                registered
                                  ? 'status-badge--active'
                                  : 'status-badge--available'
                              }`}
                            >
                              {registered ? 'Đã đăng ký' : 'Chưa đăng ký'}
                            </span>
                          </td>
                          <td className="col-actions">
                            <Button
                              className="mentor-register-btn"
                              onClick={() => handleRegister(item.courseId)}
                              disabled={registered}
                            >
                              {registered ? 'Đã đăng kí' : 'Đăng kí'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <div className="mentor-table-state" role="status">
                          {course.length > 0
                            ? 'Không tìm thấy khóa học phù hợp với bộ lọc hiện tại.'
                            : 'Hiện chưa có dữ liệu khóa học.'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="mentor-table-footer">
              <span className="mentor-table-footer__info">
                Hiển thị {records.length > 0 ? firstIndex + 1 : 0}–
                {Math.min(firstIndex + recordPage, filteredCourses.length)} trong{' '}
                {filteredCourses.length} khóa học
              </span>
              {filteredCourses.length > 0 && (
                <nav aria-label="Phân trang khóa học">
                  <ul className="pagination">
                    <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        disabled={safePage === 1}
                        onClick={() => setCurrentPage(safePage - 1)}
                      >
                        Trước
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <li
                        key={idx + 1}
                        className={`page-item ${
                          safePage === idx + 1 ? 'active' : ''
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          onClick={() => setCurrentPage(idx + 1)}
                        >
                          {idx + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        safePage === totalPages ? 'disabled' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        disabled={safePage === totalPages}
                        onClick={() => setCurrentPage(safePage + 1)}
                      >
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </footer>
          </section>
        </form>
      </div>
    </div>
  );
}

export default MentorClassRegister;
