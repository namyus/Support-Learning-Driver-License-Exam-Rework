import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './student-table.scss';
import api from '../../../../../config/axios';
import { toast } from 'react-toastify';

interface StudentRecord {
  studentId: string;
  memberId?: number;
  courseId: string;
  fullName: string;
  totalHour?: number | null;
  totalKm?: number | null;
  pass?: boolean | null;
}

function StudentTable() {
  const [data, setData] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const getAllStudent = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get('/Students');
      const res: StudentRecord[] = Array.isArray(response.data) ? response.data : [];
      setData(res);
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể tải danh sách học viên. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getAllStudent();
  }, [getAllStudent]);

  const updateAttendance = async (
    e: React.MouseEvent<HTMLButtonElement>,
    student: StudentRecord
  ) => {
    e.stopPropagation();
    try {
      setUpdatingStudentId(student.studentId);
      await api.patch('Lesson/attendance/' + student.studentId);
      toast.success('Cập nhật điểm danh thành công!');
      await getAllStudent();
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      if (axiosErr.response?.data?.error) {
        toast.error(axiosErr.response.data.error);
      } else {
        toast.error('Không thể cập nhật điểm danh. Vui lòng thử lại.');
      }
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const distinctCourses = useMemo(() => {
    const courseSet = new Set<string>();
    data.forEach((student) => {
      if (student.courseId) {
        courseSet.add(student.courseId);
      }
    });
    return Array.from(courseSet).sort();
  }, [data]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return data.filter((student) => {
      if (courseFilter !== 'all' && student.courseId !== courseFilter) {
        return false;
      }

      if (!query) return true;

      const matchId = (student.studentId ?? '').toLowerCase().includes(query);
      const matchName = (student.fullName ?? '').toLowerCase().includes(query);
      const matchCourse = (student.courseId ?? '').toLowerCase().includes(query);
      const matchMemberId = String(student.memberId ?? '')
        .toLowerCase()
        .includes(query);
      return matchId || matchName || matchCourse || matchMemberId;
    });
  }, [data, searchQuery, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="student-table-container">
      <div className="student-table-header">
        <div className="student-table-header__title-group">
          <h1 className="student-table-title">Danh sách học viên</h1>
          <p className="student-table-subtitle">
            Theo dõi tiến độ buổi học, tổng số giờ học, quãng đường thực hành (Km) và cập nhật điểm danh
          </p>
        </div>
      </div>

      <div className="student-summary-strip">
        <div className="student-summary-pill">
          <span className="student-summary-pill__label">Tổng học viên</span>
          <strong className="student-summary-pill__value">{data.length}</strong>
        </div>
        <div className="student-summary-pill student-summary-pill--info">
          <span className="student-summary-pill__label">Khoá học có học viên</span>
          <strong className="student-summary-pill__value">
            {distinctCourses.length}
          </strong>
        </div>
        <div className="student-summary-pill student-summary-pill--success">
          <span className="student-summary-pill__label">Kết quả hiển thị</span>
          <strong className="student-summary-pill__value">
            {filteredStudents.length}
          </strong>
        </div>
      </div>

      <div className="student-table-card">
        <div className="student-table-toolbar">
          <div className="student-table-toolbar__search">
            <label htmlFor="student-search-input" className="sr-only">
              Tìm kiếm học viên
            </label>
            <input
              id="student-search-input"
              type="search"
              className="student-search-input"
              placeholder="Tìm theo mã học viên, họ tên hoặc mã khoá học..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="student-table-toolbar__filters">
            <label htmlFor="student-course-filter" className="student-filter-label">
              Khoá học:
            </label>
            <select
              id="student-course-filter"
              className="student-filter-select"
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả khoá học ({data.length})</option>
              {distinctCourses.map((courseId) => (
                <option key={courseId} value={courseId}>
                  Khoá {courseId}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleFormSubmit}>
          {isLoading ? (
            <div className="student-table-state" role="status" aria-live="polite">
              <div className="student-table-spinner" aria-hidden="true" />
              <p>Đang tải danh sách học viên...</p>
            </div>
          ) : errorMessage ? (
            <div className="student-table-state student-table-state--error" role="alert">
              <p>{errorMessage}</p>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => void getAllStudent()}
              >
                Thử lại
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="student-table-state">
              <p>
                {data.length === 0
                  ? 'Hiện chưa có học viên nào trong hệ thống.'
                  : 'Không tìm thấy học viên phù hợp với bộ lọc hiện tại.'}
              </p>
              {data.length > 0 && (
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setCourseFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="student-table-scroll">
                <table className="table student-data-table">
                  <thead>
                    <tr>
                      <th scope="col" className="col-center">STT</th>
                      <th scope="col">Mã học viên</th>
                      <th scope="col">Họ và tên</th>
                      <th scope="col" className="col-center">Khoá học</th>
                      <th scope="col" className="col-center">Số giờ đã học</th>
                      <th scope="col" className="col-center">Số Km đã chạy</th>
                      <th scope="col" className="col-actions">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((student, index) => (
                      <tr key={student.studentId ?? index}>
                        <td className="col-center cell-muted">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td>
                          <span className="student-id-badge">{student.studentId}</span>
                        </td>
                        <td className="cell-strong">{student.fullName}</td>
                        <td className="col-center">
                          <span className="course-tag">{student.courseId || '—'}</span>
                        </td>
                        <td className="col-center cell-mono">
                          <span className="metric-pill">
                            {student.totalHour ?? 0} giờ
                          </span>
                        </td>
                        <td className="col-center cell-mono">
                          <span className="metric-pill metric-pill--km">
                            {student.totalKm ?? 0} km
                          </span>
                        </td>
                        <td className="col-actions">
                          <div className="row-actions">
                            <button
                              className="action-btn action-btn--view"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(student);
                              }}
                            >
                              Chi tiết
                            </button>
                            <button
                              className="action-btn action-btn--edit"
                              type="button"
                              disabled={updatingStudentId === student.studentId}
                              onClick={(e) => void updateAttendance(e, student)}
                            >
                              {updatingStudentId === student.studentId
                                ? 'Đang cập nhật...'
                                : 'Cập nhật điểm danh'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="student-table-footer">
                <span className="student-table-footer__info">
                  Hiển thị {indexOfFirstItem + 1}–
                  {Math.min(indexOfLastItem, filteredStudents.length)} trong tổng số{' '}
                  {filteredStudents.length} học viên
                </span>
                {totalPages > 1 && (
                  <nav aria-label="Phân trang học viên">
                    <ul className="pagination">
                      <li className={`page-item ${safeCurrentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          type="button"
                          className="page-link"
                          disabled={safeCurrentPage === 1}
                          onClick={() => paginate(safeCurrentPage - 1)}
                        >
                          Trước
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, index) => (
                        <li
                          key={index}
                          className={`page-item ${
                            safeCurrentPage === index + 1 ? 'active' : ''
                          }`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => paginate(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item ${
                          safeCurrentPage === totalPages ? 'disabled' : ''
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          disabled={safeCurrentPage === totalPages}
                          onClick={() => paginate(safeCurrentPage + 1)}
                        >
                          Sau
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </>
          )}
        </form>
      </div>

      {selectedStudent && (
        <div
          className="student-detail-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-detail-modal-title"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="student-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="student-detail-modal__header">
              <div>
                <h2 id="student-detail-modal-title">
                  Tiến độ học viên #{selectedStudent.studentId}
                </h2>
                <p>{selectedStudent.fullName}</p>
              </div>
              <button
                type="button"
                className="student-detail-modal__close"
                aria-label="Đóng chi tiết học viên"
                onClick={() => setSelectedStudent(null)}
              >
                ×
              </button>
            </div>
            <div className="student-detail-modal__body">
              <div className="student-detail-grid">
                <div className="student-detail-item">
                  <span>Mã học viên</span>
                  <strong>{selectedStudent.studentId}</strong>
                </div>
                <div className="student-detail-item">
                  <span>Mã thành viên</span>
                  <strong>
                    {selectedStudent.memberId ? `#${selectedStudent.memberId}` : '—'}
                  </strong>
                </div>
                <div className="student-detail-item">
                  <span>Họ và tên</span>
                  <strong>{selectedStudent.fullName || '—'}</strong>
                </div>
                <div className="student-detail-item">
                  <span>Khoá học</span>
                  <strong>{selectedStudent.courseId || '—'}</strong>
                </div>
                <div className="student-detail-item">
                  <span>Tổng số giờ đã học</span>
                  <strong>{selectedStudent.totalHour ?? 0} giờ</strong>
                </div>
                <div className="student-detail-item">
                  <span>Tổng quãng đường thực hành</span>
                  <strong>{selectedStudent.totalKm ?? 0} km</strong>
                </div>
              </div>
            </div>
            <div className="student-detail-modal__footer">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setSelectedStudent(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentTable;
