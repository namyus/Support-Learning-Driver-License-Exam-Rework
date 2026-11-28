import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './member-course-table.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useAppDispatch } from '../../../app/store';
import { filterAvailableCatalogCourses } from '../../../features/courses/courseHomeFilter';
import { useCourseCatalogNow } from '../../../features/courses/useCourseCatalogNow';
import {
  fetchCourseDetailsByMonth,
  fetchCoursesByMonth,
} from '../../../features/courses/coursesSlice';
import type { ApiRejectedPayload } from '../../../features/courses/coursesTypes';

interface CourseDetailItem {
  courseDetailId?: number;
  courseContent: string;
  courseTimeStart: string;
  courseTimeEnd: string;
  courseId: string;
}

interface CourseItem {
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  limitStudent: number;
  courseFee: number;
}

interface CourseRowItem extends CourseItem {
  details: CourseDetailItem[];
}

function readStoredMember(): Record<string, unknown> | null {
  const raw = sessionStorage.getItem('loginedMember');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function CourseTable() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const member = readStoredMember();

  const { month, year } = useParams();
  const [rawData, setRawData] = useState<CourseRowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const now = useCourseCatalogNow(rawData);
  const data = useMemo(
    () => filterAvailableCatalogCourses(rawData, now),
    [rawData, now]
  );

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const formatDate = (dbDate: string) => {
    const date = new Date(dbDate);
    const day = date.getDate().toString().padStart(2, '0');
    const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const formattedYear = date.getFullYear();
    return `${day}/${formattedMonth}/${formattedYear}`;
  };

  const getCourseData = useCallback(
    async (targetMonth?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const courses = (await dispatch(
          fetchCoursesByMonth({ month: targetMonth, year })
        ).unwrap()) as CourseItem[];
        const courseDetails = (await dispatch(
          fetchCourseDetailsByMonth(targetMonth)
        ).unwrap()) as CourseDetailItem[];

        const tempCourseData: CourseRowItem[] = courses.map((course) => {
          const detailsForCourse = courseDetails.filter(
            (detail) => detail.courseId === course.courseId
          );
          return { ...course, details: detailsForCourse };
        });

        setRawData(tempCourseData);
      } catch (err) {
        console.log(err);
        const rejected = err as ApiRejectedPayload | undefined;
        if (rejected?.status === 404) {
          setRawData([]);
        } else {
          setError('Không thể tải thông tin khóa học. Vui lòng thử lại sau.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, year]
  );

  const handleNavigate = () => {
    navigate('/khoa-hoc-cua-ban');
  };

  useEffect(() => {
    void getCourseData(month);
  }, [getCourseData, month, year]);

  return (
    <section
      className="course-table-container mh-course-table-section"
      id="course-nav"
      aria-labelledby="mh-course-page-title"
    >
      <div className="mh-course-header">
        <div className="mh-course-breadcrumb">
          <Link to="/#course-section" className="mh-course-back-link">
            ← Quay lại danh sách khóa học
          </Link>
        </div>
        <h1
          id="mh-course-page-title"
          className="text-center course-title mh-section-title"
        >
          Thông tin khoá học
        </h1>
      </div>

      <div className="course-table">
        <form onSubmit={handleSubmit}>
          <table>
            <caption className="table-title">
              <h2>
                Các khoá học tháng {month}/{year}
              </h2>
            </caption>
            <thead>
              <tr className="content-title">
                <th scope="col">Thứ tự</th>
                <th scope="col" className="course-course">
                  Khoá học
                </th>
                <th scope="col">Số lượng</th>
                <th scope="col">Nội dung đào tạo</th>
                <th scope="col">Thời gian</th>
                <th scope="col">
                  <span className="mh-sr-only">Đăng ký</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="mh-course-state-row">
                  <td colSpan={6}>
                    <div
                      className="mh-course-state"
                      role="status"
                      aria-live="polite"
                    >
                      <CircularProgress size={32} className="mh-course-spinner" />
                      <p className="mh-course-state-text">
                        Đang tải thông tin khóa học...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr className="mh-course-state-row">
                  <td colSpan={6}>
                    <div
                      className="mh-course-state mh-course-state--error"
                      role="alert"
                    >
                      <p className="mh-course-state-text">{error}</p>
                      <button
                        type="button"
                        className="mh-course-retry-btn"
                        onClick={() => void getCourseData(month)}
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((course, i) => (
                  <tr key={course.courseId || i} className="mh-course-row">
                    <td className="course-no" data-label="Thứ tự">
                      <p className="mh-course-index">{i + 1}</p>
                    </td>
                    <td className="course-date" data-label="Khoá học">
                      <p className="mh-course-name">Khoá {course.name}</p>
                      <p className="mh-course-meta">
                        <span className="mh-meta-label">KG:</span>{' '}
                        {formatDate(course.startDate)}
                      </p>
                      <p className="mh-course-meta">
                        <span className="mh-meta-label">BG:</span>{' '}
                        {formatDate(course.endDate)}
                      </p>
                      <p className="mh-course-fee">
                        Học phí:{' '}
                        <strong>{course.courseFee.toLocaleString()} VNĐ</strong>
                      </p>
                    </td>
                    <td className="course-mem" data-label="Số lượng">
                      <p className="mh-course-limit">
                        {course.limitStudent}{' '}
                        <span className="mh-limit-unit">học viên</span>
                      </p>
                    </td>
                    <td
                      className="course-training-content"
                      data-label="Nội dung đào tạo"
                    >
                      <ol>
                        {course.details.map((detail, j) => (
                          <li key={detail.courseDetailId ?? j}>
                            <span className="mh-detail-content">
                              {detail.courseContent}
                            </span>
                            <span className="mh-detail-time-mobile">
                              {formatDate(detail.courseTimeStart)} -{' '}
                              {formatDate(detail.courseTimeEnd)}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </td>
                    <td className="course-training-time" data-label="Thời gian">
                      <ol>
                        {course.details.map((detail, j) => (
                          <li key={detail.courseDetailId ?? j}>
                            {formatDate(detail.courseTimeStart)} -{' '}
                            {formatDate(detail.courseTimeEnd)}
                          </li>
                        ))}
                      </ol>
                    </td>
                    <td className="course-register" data-label="Đăng ký">
                      {member != null ? (
                        <Button
                          type="button"
                          className="btnRegister btn btn-primary mh-course-register-btn"
                          onClick={handleShow}
                        >
                          Đăng ký
                        </Button>
                      ) : (
                        <Link
                          to={`/khoahoc/xac-nhan-khoa-hoc/${course.name}`}
                          className="btnRegister btn btn-primary mh-course-register-btn"
                          onClick={() =>
                            localStorage.setItem(
                              'courseID',
                              JSON.stringify(course.courseId)
                            )
                          }
                        >
                          Đăng ký
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="mh-course-state-row">
                  <td colSpan={6}>
                    <div
                      className="mh-course-state mh-course-state--empty"
                      role="status"
                    >
                      <h3 className="mh-course-state-title">
                        Hiện chưa có lịch khai giảng
                      </h3>
                      <p className="mh-course-state-text">
                        Chưa có khóa học sắp khai giảng trong tháng {month}/
                        {year}. Vui lòng chọn tháng khác hoặc quay lại trang
                        chủ.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </form>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        backdropClassName="backdrop"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chú ý</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn không thể đăng ký thêm khoá học do bạn đã đăng ký khoá học trước
          đó.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleNavigate}>
            Khoá học của tôi
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

export default CourseTable;
