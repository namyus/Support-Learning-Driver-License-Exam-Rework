import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './mentor-table.scss';
import { useNavigate } from 'react-router-dom';
import api from '../../../../../config/axios';
import { toast } from 'react-toastify';

interface MentorRecord {
  mentorId: number;
  userId?: number;
  fullName: string;
  residenceAddress: string;
  phone: string;
  email: string;
  isTeachingTheory: boolean;
  isTeachingPractice: boolean;
  currentCourse?: string | null;
}

type TeachingFilter = 'all' | 'theory' | 'practice' | 'both';

function MentorTable() {
  const [data, setData] = useState<MentorRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingMentorId, setDeletingMentorId] = useState<number | null>(null);

  const [searchValue, setSearchValue] = useState<string>('');
  const [teachingFilter, setTeachingFilter] = useState<TeachingFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const getAllMentors = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get('Mentor/list');
      const res: MentorRecord[] = Array.isArray(response.data) ? response.data : [];
      setData(res);
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể tải danh sách giáo viên. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getAllMentors();
  }, [getAllMentors]);

  const filterMentor = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return data.filter((mentor) => {
      if (teachingFilter === 'theory' && !mentor.isTeachingTheory) return false;
      if (teachingFilter === 'practice' && !mentor.isTeachingPractice) return false;
      if (
        teachingFilter === 'both' &&
        (!mentor.isTeachingTheory || !mentor.isTeachingPractice)
      ) {
        return false;
      }

      if (!query) return true;

      const matchId = String(mentor.mentorId ?? '').toLowerCase().includes(query);
      const matchName = (mentor.fullName ?? '').toLowerCase().includes(query);
      const matchEmail = (mentor.email ?? '').toLowerCase().includes(query);
      const matchPhone = (mentor.phone ?? '').toLowerCase().includes(query);
      const matchAddress = (mentor.residenceAddress ?? '').toLowerCase().includes(query);
      const matchCourse = (mentor.currentCourse ?? '').toLowerCase().includes(query);
      return (
        matchId ||
        matchName ||
        matchEmail ||
        matchPhone ||
        matchAddress ||
        matchCourse
      );
    });
  }, [data, searchValue, teachingFilter]);

  const totalPages = Math.max(1, Math.ceil(filterMentor.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filterMentor.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleCreateMentor = () => {
    window.scrollTo(0, 0);
    navigate('tao-giao-vien');
  };

  const handleUpdate = (mentorId: number) => {
    window.scrollTo(0, 0);
    navigate(`cap-nhat-giao-vien/${mentorId}`, { state: { mentorId } });
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    mentor: MentorRecord
  ) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá giáo viên "${mentor.fullName}" (Mã GV: ${mentor.mentorId}) không?`
    );
    if (!confirmed) return;

    try {
      setDeletingMentorId(mentor.mentorId);
      await api.delete('/Mentor/delete/' + mentor.mentorId);
      toast.success('Xoá giáo viên thành công!');
      await getAllMentors();
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(
        axiosErr.response?.data?.error || 'Không thể xoá giáo viên. Vui lòng thử lại.'
      );
    } finally {
      setDeletingMentorId(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const theoryCount = useMemo(
    () => data.filter((m) => m.isTeachingTheory).length,
    [data]
  );
  const practiceCount = useMemo(
    () => data.filter((m) => m.isTeachingPractice).length,
    [data]
  );

  return (
    <div className="mentor-table-container">
      <div className="mentor-table-header">
        <div className="mentor-table-header__title-group">
          <h1 className="mentor-table-title">Danh sách giáo viên</h1>
          <p className="mentor-table-subtitle">
            Quản lý đội ngũ giảng viên lý thuyết, thực hành và phân công khoá học
          </p>
        </div>
        <div className="mentor-table-header__actions">
          <button
            className="admin-btn admin-btn--primary"
            type="button"
            onClick={handleCreateMentor}
          >
            + Tạo giáo viên
          </button>
        </div>
      </div>

      <div className="mentor-summary-strip">
        <div className="mentor-summary-pill">
          <span className="mentor-summary-pill__label">Tổng giáo viên</span>
          <strong className="mentor-summary-pill__value">{data.length}</strong>
        </div>
        <div className="mentor-summary-pill mentor-summary-pill--info">
          <span className="mentor-summary-pill__label">Dạy lý thuyết</span>
          <strong className="mentor-summary-pill__value">{theoryCount}</strong>
        </div>
        <div className="mentor-summary-pill mentor-summary-pill--success">
          <span className="mentor-summary-pill__label">Dạy thực hành</span>
          <strong className="mentor-summary-pill__value">{practiceCount}</strong>
        </div>
      </div>

      <div className="mentor-table-card">
        <div className="mentor-table-toolbar">
          <div className="mentor-table-toolbar__search">
            <label htmlFor="mentor-search-input" className="sr-only">
              Tìm kiếm giáo viên
            </label>
            <input
              id="mentor-search-input"
              type="search"
              placeholder="Tìm theo mã GV, họ tên, điện thoại, email, địa chỉ, khoá học..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setCurrentPage(1);
              }}
              className="mentor-search-input"
            />
          </div>
          <div className="mentor-table-toolbar__filters">
            <label htmlFor="mentor-teaching-filter" className="mentor-filter-label">
              Phân công:
            </label>
            <select
              id="mentor-teaching-filter"
              className="mentor-filter-select"
              value={teachingFilter}
              onChange={(e) => {
                setTeachingFilter(e.target.value as TeachingFilter);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả ({data.length})</option>
              <option value="theory">Có dạy lý thuyết ({theoryCount})</option>
              <option value="practice">Có dạy thực hành ({practiceCount})</option>
              <option value="both">Dạy cả lý thuyết & thực hành</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleFormSubmit}>
          {isLoading ? (
            <div className="mentor-table-state" role="status" aria-live="polite">
              <div className="mentor-table-spinner" aria-hidden="true" />
              <p>Đang tải danh sách giáo viên...</p>
            </div>
          ) : errorMessage ? (
            <div className="mentor-table-state mentor-table-state--error" role="alert">
              <p>{errorMessage}</p>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => void getAllMentors()}
              >
                Thử lại
              </button>
            </div>
          ) : filterMentor.length === 0 ? (
            <div className="mentor-table-state">
              <p>
                {data.length === 0
                  ? 'Hiện chưa có giáo viên nào trong hệ thống.'
                  : 'Không tìm thấy giáo viên phù hợp với từ khoá hoặc bộ lọc.'}
              </p>
              {data.length > 0 && (
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => {
                    setSearchValue('');
                    setTeachingFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mentor-table-scroll">
                <table className="table mentor-data-table">
                  <thead>
                    <tr>
                      <th scope="col" className="col-center col-stt">STT</th>
                      <th scope="col" className="col-id">Mã GV</th>
                      <th scope="col" className="col-name">Tên giáo viên</th>
                      <th scope="col" className="col-address">Địa chỉ</th>
                      <th scope="col" className="col-phone">Điện thoại</th>
                      <th scope="col" className="col-email">Email</th>
                      <th scope="col" className="col-center col-theory">Dạy lý thuyết</th>
                      <th scope="col" className="col-center col-practice">Dạy thực hành</th>
                      <th scope="col" className="col-center col-course">Khoá phụ trách</th>
                      <th scope="col" className="col-actions">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((mentor, index) => (
                      <tr key={mentor.mentorId ?? index}>
                        <td className="col-center cell-muted">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="col-id">
                          <span className="mentor-id-badge">#{mentor.mentorId}</span>
                        </td>
                        <td className="cell-strong col-name">{mentor.fullName}</td>
                        <td className="col-address">{mentor.residenceAddress || '—'}</td>
                        <td className="cell-mono col-phone">{mentor.phone || '—'}</td>
                        <td className="col-email">{mentor.email || '—'}</td>
                        <td className="col-center">
                          <span
                            className={`status-badge ${
                              mentor.isTeachingTheory
                                ? 'status-badge--active'
                                : 'status-badge--inactive'
                            }`}
                          >
                            {mentor.isTeachingTheory ? 'Có' : 'Không'}
                          </span>
                        </td>
                        <td className="col-center">
                          <span
                            className={`status-badge ${
                              mentor.isTeachingPractice
                                ? 'status-badge--active'
                                : 'status-badge--inactive'
                            }`}
                          >
                            {mentor.isTeachingPractice ? 'Có' : 'Không'}
                          </span>
                        </td>
                        <td className="col-center">
                          {mentor.currentCourse ? (
                            <span className="course-tag">{mentor.currentCourse}</span>
                          ) : (
                            <span className="cell-muted">Chưa phân công</span>
                          )}
                        </td>
                        <td className="col-actions">
                          <div className="row-actions">
                            <button
                              className="action-btn action-btn--edit"
                              onClick={() => handleUpdate(mentor.mentorId)}
                              type="button"
                            >
                              Cập nhật
                            </button>
                            <button
                              className="action-btn action-btn--delete"
                              type="button"
                              disabled={deletingMentorId === mentor.mentorId}
                              onClick={(e) => void handleDelete(e, mentor)}
                            >
                              {deletingMentorId === mentor.mentorId ? 'Đang xoá...' : 'Xoá'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mentor-table-footer">
                <span className="mentor-table-footer__info">
                  Hiển thị {indexOfFirstItem + 1}–
                  {Math.min(indexOfLastItem, filterMentor.length)} trong tổng số{' '}
                  {filterMentor.length} giáo viên
                </span>
                {totalPages > 1 && (
                  <nav aria-label="Phân trang giáo viên">
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
    </div>
  );
}

export default MentorTable;
