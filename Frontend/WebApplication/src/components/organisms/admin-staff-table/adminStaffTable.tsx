import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './admin-staff-table.scss';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/axios';
import { toast } from 'react-toastify';

interface StaffRecord {
  staffId: number;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  status: boolean;
}

function StaffTable() {
  const [data, setData] = useState<StaffRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const getAllStaff = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get('Staff/list');
      const res: StaffRecord[] = Array.isArray(response.data) ? response.data : [];
      setData(res);
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể tải danh sách nhân viên. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getAllStaff();
  }, [getAllStaff]);

  const filteredStaff = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return data.filter((staff) => {
      if (statusFilter === 'active' && !staff.status) return false;
      if (statusFilter === 'inactive' && staff.status) return false;

      if (!normalizedQuery) return true;

      const matchId = String(staff.staffId ?? '').toLowerCase().includes(normalizedQuery);
      const matchName = (staff.fullName ?? '').toLowerCase().includes(normalizedQuery);
      const matchEmail = (staff.email ?? '').toLowerCase().includes(normalizedQuery);
      const matchPhone = (staff.phone ?? '').toLowerCase().includes(normalizedQuery);
      return matchId || matchName || matchEmail || matchPhone;
    });
  }, [data, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleCreateStaff = () => {
    window.scrollTo(0, 0);
    navigate('tao-nhan-vien');
  };

  const handleUpdate = (staffId: number) => {
    window.scrollTo(0, 0);
    navigate(`cap-nhat-nhan-vien/${staffId}`, { state: { staffId } });
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    staff: StaffRecord
  ) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá nhân viên "${staff.fullName}" (Mã NV: ${staff.staffId}) không?`
    );
    if (!confirmed) return;

    try {
      setDeletingStaffId(staff.staffId);
      await api.delete('Staff/delete/' + staff.staffId);
      toast.success('Xoá nhân viên thành công!');
      await getAllStaff();
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(
        axiosErr.response?.data?.error || 'Không thể xoá nhân viên. Vui lòng thử lại.'
      );
    } finally {
      setDeletingStaffId(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const activeCount = useMemo(
    () => data.filter((item) => item.status).length,
    [data]
  );

  return (
    <div className="staff-table-container">
      <div className="staff-table-header">
        <div className="staff-table-header__title-group">
          <h1 className="staff-table-title">Danh sách nhân viên</h1>
          <p className="staff-table-subtitle">
            Quản lý tài khoản nhân viên, thông tin liên hệ và trạng thái làm việc
          </p>
        </div>
        <div className="staff-table-header__actions">
          <button
            className="admin-btn admin-btn--primary"
            type="button"
            onClick={handleCreateStaff}
          >
            + Tạo nhân viên
          </button>
        </div>
      </div>

      <div className="staff-summary-strip">
        <div className="staff-summary-pill">
          <span className="staff-summary-pill__label">Tổng nhân viên</span>
          <strong className="staff-summary-pill__value">{data.length}</strong>
        </div>
        <div className="staff-summary-pill staff-summary-pill--success">
          <span className="staff-summary-pill__label">Đang làm việc</span>
          <strong className="staff-summary-pill__value">{activeCount}</strong>
        </div>
        <div className="staff-summary-pill staff-summary-pill--muted">
          <span className="staff-summary-pill__label">Ngừng làm việc</span>
          <strong className="staff-summary-pill__value">
            {Math.max(0, data.length - activeCount)}
          </strong>
        </div>
      </div>

      <div className="staff-table-card">
        <div className="staff-table-toolbar">
          <div className="staff-table-toolbar__search">
            <label htmlFor="staff-search-input" className="sr-only">
              Tìm kiếm nhân viên
            </label>
            <input
              id="staff-search-input"
              type="search"
              className="staff-search-input"
              placeholder="Tìm theo mã NV, họ tên, email hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="staff-table-toolbar__filters">
            <label htmlFor="staff-status-filter" className="staff-filter-label">
              Trạng thái:
            </label>
            <select
              id="staff-status-filter"
              className="staff-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả ({data.length})</option>
              <option value="active">Đang làm ({activeCount})</option>
              <option value="inactive">
                Không làm ({Math.max(0, data.length - activeCount)})
              </option>
            </select>
          </div>
        </div>

        <form onSubmit={handleFormSubmit}>
          {isLoading ? (
            <div className="staff-table-state" role="status" aria-live="polite">
              <div className="staff-table-spinner" aria-hidden="true" />
              <p>Đang tải danh sách nhân viên...</p>
            </div>
          ) : errorMessage ? (
            <div className="staff-table-state staff-table-state--error" role="alert">
              <p>{errorMessage}</p>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => void getAllStaff()}
              >
                Thử lại
              </button>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="staff-table-state">
              <p>
                {data.length === 0
                  ? 'Hiện chưa có nhân viên nào trong hệ thống.'
                  : 'Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.'}
              </p>
              {data.length > 0 && (
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="staff-table-scroll">
                <table className="table staff-data-table">
                  <thead>
                    <tr>
                      <th scope="col" className="col-center">STT</th>
                      <th scope="col">Mã nhân viên</th>
                      <th scope="col">Họ và tên</th>
                      <th scope="col">Email</th>
                      <th scope="col">Điện thoại</th>
                      <th scope="col" className="col-center">Trạng thái</th>
                      <th scope="col" className="col-actions">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((staff, index) => (
                      <tr key={staff.staffId ?? index}>
                        <td className="col-center cell-muted">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td>
                          <span className="staff-id-badge">#{staff.staffId}</span>
                        </td>
                        <td className="cell-strong">{staff.fullName}</td>
                        <td>{staff.email || '—'}</td>
                        <td className="cell-mono">{staff.phone || '—'}</td>
                        <td className="col-center">
                          <span
                            className={`status-badge ${
                              staff.status
                                ? 'status-badge--active'
                                : 'status-badge--inactive'
                            }`}
                          >
                            {staff.status ? 'Đang làm' : 'Không làm'}
                          </span>
                        </td>
                        <td className="col-actions">
                          <div className="row-actions">
                            <button
                              className="action-btn action-btn--edit"
                              onClick={() => handleUpdate(staff.staffId)}
                              type="button"
                            >
                              Cập nhật
                            </button>
                            <button
                              className="action-btn action-btn--delete"
                              type="button"
                              disabled={deletingStaffId === staff.staffId}
                              onClick={(e) => void handleDelete(e, staff)}
                            >
                              {deletingStaffId === staff.staffId ? 'Đang xoá...' : 'Xoá'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="staff-table-footer">
                <span className="staff-table-footer__info">
                  Hiển thị {indexOfFirstItem + 1}–
                  {Math.min(indexOfLastItem, filteredStaff.length)} trong tổng số{' '}
                  {filteredStaff.length} nhân viên
                </span>
                {totalPages > 1 && (
                  <nav aria-label="Phân trang nhân viên">
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

export default StaffTable;
