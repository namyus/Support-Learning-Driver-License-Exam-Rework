import React, { useCallback, useEffect, useState } from "react";
import './admin-class-table.scss';
import api from '../../../config/axios';
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import {
  BsArrowClockwise,
  BsCalendar2Check,
  BsCalendar3,
  BsCalendarPlus,
  BsGeoAlt,
  BsJournalText,
  BsSearch,
} from "react-icons/bs";

interface ClassItem {
  classId: number | string;
  mentorName: string;
  courseId: string;
  isTheoryClass: boolean;
  dayOfWeek?: string | number;
  shift?: number | string;
}

interface LessonItem {
  lessonId?: number | string;
  lessonContent: string;
  date: string;
  location: string;
}

function formatDate(dbDate: string): string {
  if (!dbDate) return "—";
  const date = new Date(dbDate);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ----------------- Class table -----------------
function ClassTable() {
  const [classs, setClasss] = useState<ClassItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recordPage = 10;

  const getAllClasss = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get("Class");
      const res: ClassItem[] = Array.isArray(response.data) ? response.data : [];
      setClasss(res);
    } catch (error) {
      console.error(error);
      setErrorMessage("Không thể tải danh sách lớp học. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getAllClasss();
  }, [getAllClasss]);

  // Pagination
  const overallIndex = (currentPage - 1) * recordPage;
  const lastIndex = currentPage * recordPage;
  const firstIndex = lastIndex - recordPage;
  const normalizedQuery = searchValue.trim().toLowerCase();

  const filteredResult = classs.filter((classItem) => {
    if (classItem && classItem.courseId) {
      return (
        classItem.courseId.toString().toLowerCase().includes(normalizedQuery) ||
        classItem.mentorName?.toLowerCase().includes(normalizedQuery)
      );
    }
    return false;
  });

  const records = filteredResult.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredResult.length / recordPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const prePage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setCurrentPage(1);
  };

  return (
    <div className="class-table-container">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <span className="admin-page-header__eyebrow">Quản lý lịch học</span>
          <div className="class-table-title">
            <h1>Danh sách lớp học</h1>
          </div>
          <p className="admin-page-header__subtitle">
            Tổng hợp toàn bộ các lớp học lý thuyết và thực hành theo từng khoá đào tạo.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link
            to="/quan-ly-lich-hoc"
            className="admin-nav-tab admin-nav-tab--active"
          >
            Tất cả lớp học
          </Link>
          <Link
            to="/quan-ly-lich-hoc/lop-ly-thuyet"
            className="admin-nav-tab"
          >
            Lớp lý thuyết
          </Link>
          <Link
            to="/quan-ly-lich-hoc/lop-thuc-hanh"
            className="admin-nav-tab"
          >
            Lớp thực hành
          </Link>
        </div>
      </div>

      <div className="class-table-content">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="admin-table-toolbar">
            <div className="search-input admin-toolbar-filters">
              <div className="admin-input-group">
                <label htmlFor="all-class-search" className="visually-hidden">
                  Tìm kiếm theo mã khoá học hoặc tên giáo viên
                </label>
                <BsSearch
                  className="admin-input-group__icon"
                  aria-hidden="true"
                />
                <input
                  id="all-class-search"
                  type="text"
                  name="id"
                  placeholder="Tìm theo mã khoá học hoặc tên giáo viên..."
                  onChange={handleSearch}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="admin-toolbar-meta">
              <span className="admin-count-pill">
                Tổng số: <strong>{filteredResult.length}</strong> lớp học
              </span>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => void getAllClasss()}
                title="Làm mới dữ liệu"
              >
                <BsArrowClockwise aria-hidden="true" />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="admin-table-alert" role="alert">
              <span>{errorMessage}</span>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => void getAllClasss()}
              >
                Thử lại
              </button>
            </div>
          )}

          <div className="admin-table-wrapper">
            <table className="table table-hover table-striped">
              <thead className="table-primary">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Mã lớp học</th>
                  <th scope="col">Tên giáo viên</th>
                  <th scope="col">Mã khóa học</th>
                  <th scope="col" className="text-center">
                    Học phần
                  </th>
                  <th scope="col" className="text-center">
                    Ca học
                  </th>
                </tr>
              </thead>
              <tbody className="table-group-divider align-middle">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="admin-table-state-cell">
                      <div
                        className="admin-table-state"
                        role="status"
                        aria-live="polite"
                      >
                        <div className="admin-spinner" aria-hidden="true" />
                        <p>Đang tải danh sách lớp học...</p>
                      </div>
                    </td>
                  </tr>
                ) : records.length > 0 ? (
                  records.map((item, i) => (
                    <tr key={item.classId ?? i}>
                      <td className="cell-index">{overallIndex + i + 1}</td>
                      <td>
                        <span className="admin-code-chip">#{item.classId}</span>
                      </td>
                      <td className="cell-strong">{item.mentorName}</td>
                      <td>
                        <span className="admin-course-tag">{item.courseId}</span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`admin-type-badge ${
                            item.isTheoryClass
                              ? "admin-type-badge--theory"
                              : "admin-type-badge--practice"
                          }`}
                        >
                          {item.isTheoryClass ? "Lý thuyết" : "Thực hành"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="admin-shift-pill">
                          Ca {item.shift ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="admin-table-state-cell">
                      <div className="admin-table-state admin-table-state--empty">
                        <BsCalendar2Check
                          className="admin-table-state__icon"
                          aria-hidden="true"
                        />
                        <h2>Không tìm thấy thông tin lớp học</h2>
                        <p>
                          Không có lớp học nào khớp với từ khoá tìm kiếm. Vui lòng kiểm tra lại!
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-table-footer">
            <span className="admin-table-footer__info">
              {filteredResult.length > 0
                ? `Hiển thị ${firstIndex + 1}–${Math.min(
                    lastIndex,
                    filteredResult.length
                  )} trên tổng số ${filteredResult.length} lớp học`
                : "Không có dữ liệu hiển thị"}
            </span>
            <nav aria-label="Phân trang danh sách lớp học">
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={prePage}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                </li>
                {pageNumbers.map((number) => (
                  <li
                    key={number}
                    className={`page-item ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => changePage(number)}
                    >
                      {number}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage >= totalPages || totalPages === 0
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={nextPage}
                    disabled={currentPage >= totalPages || totalPages === 0}
                  >
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ClassTable;

// ----------------- Theory class table -----------------
export function TheoryClassTable() {
  const [classs, setClasss] = useState<ClassItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [classInfoLoaded, setClassInfoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recordPage = 10;
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonItem[]>([]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getAllClasss = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get("Class");
      const res: ClassItem[] = Array.isArray(response.data) ? response.data : [];
      const resValid = res.filter((classItem) => classItem.isTheoryClass);
      setClasss(resValid);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Không thể tải danh sách lớp học lý thuyết. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detailsClick = async (classId: number | string) => {
    setClassInfoLoaded(false);
    try {
      const response = await api.get("Lesson/class/" + classId);
      const res: LessonItem[] = Array.isArray(response.data)
        ? response.data
        : [];
      setLesson(res);
    } catch (error) {
      console.error(error);
      setLesson([]);
    } finally {
      setClassInfoLoaded(true);
    }
  };

  useEffect(() => {
    void getAllClasss();
  }, [getAllClasss]);

  // Pagination
  const lastIndex = currentPage * recordPage;
  const firstIndex = lastIndex - recordPage;
  const normalizedQuery = searchValue.trim().toLowerCase();

  const filteredResult = classs.filter((classItem) => {
    if (classItem && classItem.courseId) {
      return (
        classItem.courseId.toString().toLowerCase().includes(normalizedQuery) ||
        classItem.mentorName?.toLowerCase().includes(normalizedQuery)
      );
    }
    return false;
  });

  const records = filteredResult.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredResult.length / recordPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const prePage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setCurrentPage(1);
  };

  // Fix BUG-ADM-12: Store courseId consistently as a plain string
  const handleCreateButton = (courseId: string) => {
    localStorage.setItem("courseId", String(courseId));
    navigate("tao-lop-hoc");
  };

  return (
    <div className="template-container">
      <div className="class-table-container">
        <div className="admin-page-header">
          <div className="admin-page-header__left">
            <span className="admin-page-header__eyebrow">Quản lý lịch học</span>
            <div className="class-table-title">
              <h1>Danh sách lớp học lý thuyết</h1>
            </div>
            <p className="admin-page-header__subtitle">
              Xem chi tiết buổi học và khởi tạo lịch học lý thuyết cho từng khoá đào tạo.
            </p>
          </div>
          <div className="admin-page-header__actions">
            <Link to="/quan-ly-lich-hoc" className="admin-nav-tab">
              Tất cả lớp học
            </Link>
            <Link
              to="/quan-ly-lich-hoc/lop-ly-thuyet"
              className="admin-nav-tab admin-nav-tab--active"
            >
              Lớp lý thuyết
            </Link>
            <Link
              to="/quan-ly-lich-hoc/lop-thuc-hanh"
              className="admin-nav-tab"
            >
              Lớp thực hành
            </Link>
          </div>
        </div>

        <div className="class-table-content">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="admin-table-toolbar">
              <div className="search-input admin-toolbar-filters">
                <div className="admin-input-group">
                  <label
                    htmlFor="theory-class-search"
                    className="visually-hidden"
                  >
                    Tìm kiếm lớp lý thuyết theo mã khoá học
                  </label>
                  <BsSearch
                    className="admin-input-group__icon"
                    aria-hidden="true"
                  />
                  <input
                    id="theory-class-search"
                    type="text"
                    name="id"
                    placeholder="Tìm theo mã khoá học hoặc tên giáo viên..."
                    onChange={handleSearch}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="admin-toolbar-meta">
                <span className="admin-count-pill">
                  Lớp lý thuyết: <strong>{filteredResult.length}</strong> lớp
                </span>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => void getAllClasss()}
                  title="Làm mới dữ liệu"
                >
                  <BsArrowClockwise aria-hidden="true" />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="admin-table-alert" role="alert">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => void getAllClasss()}
                >
                  Thử lại
                </button>
              </div>
            )}

            <div className="admin-table-wrapper">
              <table className="table table-hover table-striped">
                <thead className="table-primary">
                  <tr>
                    <th scope="col">Mã lớp học</th>
                    <th scope="col">Tên giáo viên</th>
                    <th scope="col">Mã khóa học</th>
                    <th scope="col" className="text-center">
                      Học phần
                    </th>
                    <th scope="col" className="text-center">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="table-group-divider align-middle">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="admin-table-state-cell">
                        <div
                          className="admin-table-state"
                          role="status"
                          aria-live="polite"
                        >
                          <div className="admin-spinner" aria-hidden="true" />
                          <p>Đang tải danh sách lớp học lý thuyết...</p>
                        </div>
                      </td>
                    </tr>
                  ) : records.length > 0 ? (
                    records.map((item, i) => (
                      <tr key={item.classId ?? i}>
                        <td>
                          <a
                            href="/"
                            onClick={(e) => {
                              e.preventDefault();
                              handleShow();
                              void detailsClick(item.classId);
                            }}
                            className="admin-entity-link"
                            aria-label={`Xem lịch học của lớp ${item.classId}`}
                          >
                            #{item.classId}
                          </a>
                        </td>
                        <td className="cell-strong">{item.mentorName}</td>
                        <td>
                          <span className="admin-course-tag">
                            {item.courseId}
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            className={`admin-type-badge ${
                              item.isTheoryClass
                                ? "admin-type-badge--theory"
                                : "admin-type-badge--practice"
                            }`}
                          >
                            {item.isTheoryClass ? "Lý thuyết" : "Thực hành"}
                          </span>
                        </td>
                        <td className="button text-center">
                          <div className="admin-row-actions">
                            <button
                              className="btn btn-primary admin-action-btn admin-action-btn--schedule"
                              type="button"
                              onClick={() => handleCreateButton(item.courseId)}
                            >
                              <BsCalendarPlus aria-hidden="true" />
                              <span>Tạo lịch học</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="admin-table-state-cell">
                        <div className="admin-table-state admin-table-state--empty">
                          <BsCalendar2Check
                            className="admin-table-state__icon"
                            aria-hidden="true"
                          />
                          <h2>Không tìm thấy lớp học lý thuyết</h2>
                          <p>
                            Không có lớp học lý thuyết nào khớp với bộ lọc hiện tại. Vui lòng kiểm tra lại!
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-table-footer">
              <span className="admin-table-footer__info">
                {filteredResult.length > 0
                  ? `Hiển thị ${firstIndex + 1}–${Math.min(
                      lastIndex,
                      filteredResult.length
                    )} trên tổng số ${filteredResult.length} lớp lý thuyết`
                  : "Không có dữ liệu hiển thị"}
              </span>
              <nav aria-label="Phân trang danh sách lớp lý thuyết">
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={prePage}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </button>
                  </li>
                  {pageNumbers.map((number) => (
                    <li
                      key={number}
                      className={`page-item ${
                        currentPage === number ? "active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => changePage(number)}
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage >= totalPages || totalPages === 0
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={nextPage}
                      disabled={currentPage >= totalPages || totalPages === 0}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </form>
        </div>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={true}
        backdropClassName="backdrop"
        dialogClassName="admin-class-detail-modal"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thông tin lịch học lý thuyết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="course-information-container">
            {!classInfoLoaded ? (
              <div className="admin-modal-empty" role="status">
                <p>Đang tải chi tiết lịch học...</p>
              </div>
            ) : lesson.length > 0 ? (
              <div className="class-details">
                {lesson.map((item, index) => (
                  <div key={item.lessonId ?? index} className="lesson-detail-card">
                    <div className="lesson-detail-card__header">
                      <span className="lesson-detail-card__badge">
                        Buổi học {index + 1}
                      </span>
                      <span className="lesson-detail-card__date">
                        <BsCalendar3 aria-hidden="true" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <div className="lesson-detail-card__body">
                      <p className="lesson-detail-card__title">
                        <BsJournalText aria-hidden="true" />
                        <span>
                          <strong>Chi tiết: </strong>
                          {item.lessonContent}
                        </span>
                      </p>
                      <p className="lesson-detail-card__meta">
                        <BsGeoAlt aria-hidden="true" />
                        <span>
                          <strong>Địa điểm: </strong>
                          {item.location || "—"}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-modal-empty">
                <h2>Chưa có lịch học chi tiết</h2>
                <p>Lớp học này hiện chưa được phân bổ buổi học nào.</p>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ----------------- Practice Class Table -----------------
export function PracticeClassTable() {
  const navigate = useNavigate();
  const [classs, setClasss] = useState<ClassItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordPage = 10;
  const [classInfoLoaded, setClassInfoLoaded] = useState(false);
  const [lesson, setLesson] = useState<LessonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const detailsClick = async (classId: number | string) => {
    setClassInfoLoaded(false);
    try {
      const response = await api.get("Lesson/class/" + classId);
      const res: LessonItem[] = Array.isArray(response.data)
        ? response.data
        : [];
      setLesson(res);
    } catch (error) {
      console.error(error);
      setLesson([]);
    } finally {
      setClassInfoLoaded(true);
    }
  };

  // Get all classes which are practice classes
  const getAllClasss = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get("Class");
      const res: ClassItem[] = Array.isArray(response.data) ? response.data : [];
      const resValid = res.filter(
        (classItem) => classItem.isTheoryClass === false
      );
      setClasss(resValid);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Không thể tải danh sách lớp học thực hành. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getAllClasss();
  }, [getAllClasss]);

  // Fix BUG-ADM-12: Store courseId as a plain string (matching TheoryClassTable), not JSON.stringify
  const handleCreateButton = (
    classId: number | string,
    courseId: string
  ) => {
    localStorage.setItem("classId", String(classId));
    localStorage.setItem("courseId", String(courseId));
    navigate("tao-lop-hoc");
  };

  // Pagination
  const lastIndex = currentPage * recordPage;
  const firstIndex = lastIndex - recordPage;
  const normalizedQuery = searchValue.trim().toLowerCase();

  const filteredResult = classs.filter((classItem) => {
    if (classItem && classItem.courseId) {
      return (
        classItem.courseId.toString().toLowerCase().includes(normalizedQuery) ||
        classItem.mentorName?.toLowerCase().includes(normalizedQuery)
      );
    }
    return false;
  });

  const records = filteredResult.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredResult.length / recordPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const prePage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setCurrentPage(1);
  };

  return (
    <div className="template-container">
      <div className="class-table-container">
        <div className="admin-page-header">
          <div className="admin-page-header__left">
            <span className="admin-page-header__eyebrow">Quản lý lịch học</span>
            <div className="class-table-title">
              <h1>Danh sách lớp học thực hành</h1>
            </div>
            <p className="admin-page-header__subtitle">
              Theo dõi phân công giáo viên hướng dẫn, thứ, ca học và tạo lịch thực hành cho từng lớp.
            </p>
          </div>
          <div className="admin-page-header__actions">
            <Link to="/quan-ly-lich-hoc" className="admin-nav-tab">
              Tất cả lớp học
            </Link>
            <Link
              to="/quan-ly-lich-hoc/lop-ly-thuyet"
              className="admin-nav-tab"
            >
              Lớp lý thuyết
            </Link>
            <Link
              to="/quan-ly-lich-hoc/lop-thuc-hanh"
              className="admin-nav-tab admin-nav-tab--active"
            >
              Lớp thực hành
            </Link>
          </div>
        </div>

        <div className="class-table-content">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="admin-table-toolbar">
              <div className="search-input admin-toolbar-filters">
                <div className="admin-input-group">
                  <label
                    htmlFor="practice-class-search"
                    className="visually-hidden"
                  >
                    Tìm kiếm lớp thực hành theo mã khoá học
                  </label>
                  <BsSearch
                    className="admin-input-group__icon"
                    aria-hidden="true"
                  />
                  <input
                    id="practice-class-search"
                    type="text"
                    name="id"
                    placeholder="Tìm theo mã khoá học hoặc tên giáo viên..."
                    onChange={handleSearch}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="admin-toolbar-meta">
                <span className="admin-count-pill">
                  Lớp thực hành: <strong>{filteredResult.length}</strong> lớp
                </span>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => void getAllClasss()}
                  title="Làm mới dữ liệu"
                >
                  <BsArrowClockwise aria-hidden="true" />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="admin-table-alert" role="alert">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => void getAllClasss()}
                >
                  Thử lại
                </button>
              </div>
            )}

            <div className="admin-table-wrapper">
              <table className="table table-hover table-striped">
                <thead className="table-primary">
                  <tr>
                    <th scope="col">Mã lớp học</th>
                    <th scope="col">Tên giáo viên</th>
                    <th scope="col">Mã khóa học</th>
                    <th scope="col" className="text-center">
                      Học phần
                    </th>
                    <th scope="col" className="text-center">
                      Thứ
                    </th>
                    <th scope="col" className="text-center">
                      Ca học
                    </th>
                    <th scope="col" className="text-center">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="table-group-divider align-middle">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="admin-table-state-cell">
                        <div
                          className="admin-table-state"
                          role="status"
                          aria-live="polite"
                        >
                          <div className="admin-spinner" aria-hidden="true" />
                          <p>Đang tải danh sách lớp học thực hành...</p>
                        </div>
                      </td>
                    </tr>
                  ) : records.length > 0 ? (
                    records.map((item, i) => (
                      <tr key={item.classId ?? i}>
                        <td>
                          <a
                            href="/"
                            onClick={(e) => {
                              e.preventDefault();
                              handleShow();
                              void detailsClick(item.classId);
                            }}
                            className="admin-entity-link"
                            aria-label={`Xem lịch học của lớp ${item.classId}`}
                          >
                            #{item.classId}
                          </a>
                        </td>
                        <td className="cell-strong">{item.mentorName}</td>
                        <td>
                          <span className="admin-course-tag">
                            {item.courseId}
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            className={`admin-type-badge ${
                              item.isTheoryClass
                                ? "admin-type-badge--theory"
                                : "admin-type-badge--practice"
                            }`}
                          >
                            {item.isTheoryClass ? "Lý thuyết" : "Thực hành"}
                          </span>
                        </td>
                        <td className="text-center cell-date">
                          {item.dayOfWeek ?? "—"}
                        </td>
                        <td className="text-center">
                          <span className="admin-shift-pill">
                            Ca {item.shift ?? "—"}
                          </span>
                        </td>
                        <td className="button text-center">
                          <div className="admin-row-actions">
                            <button
                              className="btn btn-primary admin-action-btn admin-action-btn--schedule"
                              type="button"
                              onClick={() =>
                                handleCreateButton(item.classId, item.courseId)
                              }
                            >
                              <BsCalendarPlus aria-hidden="true" />
                              <span>Tạo lịch học</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="admin-table-state-cell">
                        <div className="admin-table-state admin-table-state--empty">
                          <BsCalendar2Check
                            className="admin-table-state__icon"
                            aria-hidden="true"
                          />
                          <h2>Không tìm thấy lớp học thực hành</h2>
                          <p>
                            Không có lớp học thực hành nào khớp với bộ lọc hiện tại. Vui lòng kiểm tra lại!
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-table-footer">
              <span className="admin-table-footer__info">
                {filteredResult.length > 0
                  ? `Hiển thị ${firstIndex + 1}–${Math.min(
                      lastIndex,
                      filteredResult.length
                    )} trên tổng số ${filteredResult.length} lớp thực hành`
                  : "Không có dữ liệu hiển thị"}
              </span>
              <nav aria-label="Phân trang danh sách lớp thực hành">
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={prePage}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </button>
                  </li>
                  {pageNumbers.map((number) => (
                    <li
                      key={number}
                      className={`page-item ${
                        currentPage === number ? "active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => changePage(number)}
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage >= totalPages || totalPages === 0
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={nextPage}
                      disabled={currentPage >= totalPages || totalPages === 0}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </form>
        </div>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={true}
        backdropClassName="backdrop"
        dialogClassName="admin-class-detail-modal"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thông tin lịch học thực hành</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="course-information-container">
            {!classInfoLoaded ? (
              <div className="admin-modal-empty" role="status">
                <p>Đang tải chi tiết lịch học...</p>
              </div>
            ) : lesson.length > 0 ? (
              <div className="class-details">
                {lesson.map((item, index) => (
                  <div key={item.lessonId ?? index} className="lesson-detail-card">
                    <div className="lesson-detail-card__header">
                      <span className="lesson-detail-card__badge">
                        Buổi học {index + 1}
                      </span>
                      <span className="lesson-detail-card__date">
                        <BsCalendar3 aria-hidden="true" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <div className="lesson-detail-card__body">
                      <p className="lesson-detail-card__title">
                        <BsJournalText aria-hidden="true" />
                        <span>
                          <strong>Chi tiết: </strong>
                          {item.lessonContent}
                        </span>
                      </p>
                      <p className="lesson-detail-card__meta">
                        <BsGeoAlt aria-hidden="true" />
                        <span>
                          <strong>Địa điểm: </strong>
                          {item.location || "—"}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-modal-empty">
                <h2>Chưa có lịch học chi tiết</h2>
                <p>Lớp học thực hành này hiện chưa được phân bổ buổi học nào.</p>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
