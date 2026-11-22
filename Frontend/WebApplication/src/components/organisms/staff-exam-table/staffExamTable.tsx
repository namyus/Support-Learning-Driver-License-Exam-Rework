import { useEffect, useMemo, useState } from 'react';
import './staff-exam-table.scss';
import { Link } from 'react-router-dom';
import api from '../../../config/axios';
import { toast } from 'react-toastify';

interface ExamRecord {
  examId: number | string;
  courseId?: string | null;
  examName?: string | null;
  examTime?: string | null;
  description?: string | null;
  duration?: number | string | null;
  limitQuestion?: number | string | null;
  limitKeyQuestion?: number | string | null;
  minimumCorrectAnswer?: number | string | null;
  status: boolean;
}

function ExamTable() {
  const [data, setData] = useState<ExamRecord[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordPage = 10;

  const activeCount = data.filter((exam) => exam.status === true).length;
  const inactiveCount = data.filter((exam) => exam.status === false).length;

  const filteredData = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase('vi');
    return data.filter((exam) => {
      if (statusFilter === 'active' && exam.status !== true) return false;
      if (statusFilter === 'inactive' && exam.status !== false) return false;
      if (!query) return true;
      return [exam.examId, exam.courseId, exam.examName, exam.description].some(
        (value) => String(value ?? '').toLocaleLowerCase('vi').includes(query)
      );
    });
  }, [data, searchValue, statusFilter]);

  const npage = Math.ceil(filteredData.length / recordPage);
  const safePage = npage > 0 ? Math.min(currentPage, npage) : 1;
  const lastIndex = safePage * recordPage;
  const firsIndex = lastIndex - recordPage;
  const records = filteredData.slice(firsIndex, lastIndex);
  const numbers = npage > 0 ? [...Array(npage + 1).keys()].slice(1) : [];

  const getAllExams = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const response = await api.get('Exam/list');
      const res: ExamRecord[] = Array.isArray(response.data) ? response.data : [];
      setData(res);
    } catch (err) {
      console.log(err);
      setData([]);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const prePage = () => {
    if (safePage > 1) {
      setCurrentPage(safePage - 1);
    }
  };

  const changeCPage = (id: number) => {
    setCurrentPage(id);
  };

  const nextPage = () => {
    if (npage > 0 && safePage < npage) {
      setCurrentPage(safePage + 1);
    }
  };

  const filter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setCurrentPage(1);
  };

  const formatDate = (dbDate?: string | null) => {
    if (!dbDate) return '—';
    const date = new Date(dbDate);
    if (Number.isNaN(date.getTime())) return '—';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCreate = async (examId: number | string) => {
    try {
      const examIDJson = JSON.stringify(examId);
      await api.post('Test/add', {
        Headers: {
          'Content-Type': 'application/json',
        },
        examId: examIDJson,
      });

      const notificationMessage = 'Tạo bài thi thành công!';
      localStorage.setItem('notificationMessage', notificationMessage);
      location.reload();
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Không thể tạo bài thi.');
    }
  };

  useEffect(() => {
    void getAllExams();
  }, []);

  useEffect(() => {
    const storedNotificationMessage = localStorage.getItem('notificationMessage');

    if (storedNotificationMessage) {
      toast.success(storedNotificationMessage);
      localStorage.removeItem('notificationMessage');
    }
  }, []);

  return (
    <div className="exams-table-container staff-list-page">
      <header className="exams-table-title staff-list-header">
        <div>
          <h1>Danh sách kỳ thi</h1>
          <p>Tra cứu thông tin kỳ thi, chỉ tiêu câu hỏi và khởi tạo bài thi lý thuyết.</p>
        </div>
        <div className="staff-header-actions">
          <Link to="/quan-ly-ky-thi/tao-ky-thi" className="staff-primary-btn">
            <span aria-hidden="true">+</span>
            <span>Thêm kỳ thi</span>
          </Link>
        </div>
      </header>

      <section className="staff-summary-strip" aria-label="Tổng quan kỳ thi">
        <div className="staff-summary-pill">
          <span className="staff-summary-pill__label">Tổng kỳ thi đã tải</span>
          <strong className="staff-summary-pill__value">
            {isLoading || loadError ? '—' : data.length}
          </strong>
        </div>
        <div className="staff-summary-pill staff-summary-pill--success">
          <span className="staff-summary-pill__label">Đã kích hoạt</span>
          <strong className="staff-summary-pill__value">
            {isLoading || loadError ? '—' : activeCount}
          </strong>
        </div>
        <div className="staff-summary-pill staff-summary-pill--muted">
          <span className="staff-summary-pill__label">Chưa kích hoạt</span>
          <strong className="staff-summary-pill__value">
            {isLoading || loadError ? '—' : inactiveCount}
          </strong>
        </div>
      </section>
      <p className="staff-metrics-note">
        Số liệu tính trên các kỳ thi được tải từ API Exam/list.
      </p>

      <div className="exams-table-content">
        <form onSubmit={(event) => event.preventDefault()}>
          <section className="staff-table-card" aria-label="Bảng kỳ thi">
            <div className="staff-table-toolbar">
              <div className="staff-table-toolbar__search search-input">
                <label className="staff-sr-only" htmlFor="staff-exam-search">
                  Tìm kiếm kỳ thi
                </label>
                <input
                  id="staff-exam-search"
                  className="staff-search-input"
                  type="search"
                  name="courseId"
                  placeholder="Tìm theo mã khóa học, mã kỳ thi hoặc tên kỳ thi..."
                  value={searchValue}
                  onChange={filter}
                  autoComplete="off"
                />
              </div>
              <div className="staff-table-toolbar__filters">
                <div className="staff-filter-group">
                  <label className="staff-filter-label" htmlFor="staff-exam-status-filter">
                    Trạng thái
                  </label>
                  <select
                    id="staff-exam-status-filter"
                    className="staff-filter-select"
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">Tất cả ({data.length})</option>
                    <option value="active">Đã kích hoạt ({activeCount})</option>
                    <option value="inactive">Chưa kích hoạt ({inactiveCount})</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="exams-table-scroll staff-table-scroll" role="region" aria-label="Bảng kỳ thi" tabIndex={0}>
              <table className="table staff-data-table">
                <thead>
                  <tr>
                    <th scope="col">Mã kỳ thi</th>
                    <th scope="col">Mã khoá học</th>
                    <th scope="col">Tên kỳ thi</th>
                    <th scope="col">Ngày thi</th>
                    <th scope="col">Mô tả</th>
                    <th scope="col" className="col-center">Thời gian</th>
                    <th scope="col" className="col-center">Số câu hỏi</th>
                    <th scope="col" className="col-center">Số câu liệt</th>
                    <th scope="col" className="col-center">Câu đúng tối thiểu</th>
                    <th scope="col" className="col-center">Trạng thái</th>
                    <th scope="col" className="col-actions">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={11}>
                        <div className="staff-table-state" role="status">
                          Đang tải danh sách kỳ thi…
                        </div>
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={11}>
                        <div className="staff-table-state staff-table-state--error" role="alert">
                          <span>Không thể tải danh sách kỳ thi. Vui lòng thử lại.</span>
                          <button
                            className="staff-retry-btn"
                            type="button"
                            onClick={() => void getAllExams()}
                          >
                            Thử lại
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : records.length > 0 ? (
                    records.map((exam, i) => (
                      <tr key={exam.examId ?? i}>
                        <td>
                          <span className="staff-id-badge">#{exam.examId}</span>
                        </td>
                        <td>
                          <span className="staff-course-tag">{exam.courseId || '—'}</span>
                        </td>
                        <td className="cell-strong">{exam.examName || '—'}</td>
                        <td className="cell-mono">{formatDate(exam.examTime)}</td>
                        <td className="cell-muted">{exam.description || '—'}</td>
                        <td className="col-center cell-mono">{exam.duration} phút</td>
                        <td className="col-center cell-mono">{exam.limitQuestion}</td>
                        <td className="col-center cell-mono">{exam.limitKeyQuestion}</td>
                        <td className="col-center cell-mono">{exam.minimumCorrectAnswer}</td>
                        <td className="col-center">
                          <span
                            className={`status-badge ${
                              exam.status ? 'status-badge--active' : 'status-badge--inactive'
                            }`}
                          >
                            {exam.status ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                          </span>
                        </td>
                        <td className="button col-actions">
                          <div className="row-actions">
                            <button
                              className="action-btn action-btn--create"
                              type="button"
                              onClick={() => void handleCreate(exam.examId)}
                            >
                              Tạo bài thi
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11}>
                        <div className="staff-table-state" role="status">
                          {data.length > 0
                            ? 'Không tìm thấy kỳ thi phù hợp với bộ lọc hiện tại.'
                            : 'Không tìm thấy thông tin. Vui lòng kiểm tra lại!'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="staff-table-footer">
              <span className="staff-table-footer__info">
                Hiển thị {records.length > 0 ? firsIndex + 1 : 0}–
                {Math.min(lastIndex, filteredData.length)} trong {filteredData.length} kỳ thi
              </span>
              <nav aria-label="Phân trang kỳ thi">
                <ul className="pagination">
                  <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={prePage}
                      disabled={safePage === 1}
                    >
                      Trước
                    </button>
                  </li>
                  {numbers.map((n) => (
                    <li
                      className={`page-item ${safePage === n ? 'active' : ''}`}
                      key={n}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => changeCPage(n)}
                      >
                        {n}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      npage === 0 || safePage === npage ? 'disabled' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={nextPage}
                      disabled={npage === 0 || safePage === npage}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </footer>
          </section>
        </form>
      </div>
    </div>
  );
}

export default ExamTable;
