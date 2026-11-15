import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './member-table.scss';
import api from '../../../../../config/axios';
import { toast } from 'react-toastify';

interface MemberRecord {
  memberID: number;
  userID?: number;
  fullName: string;
  dob?: string;
  gender?: string;
  residenceAddress?: string;
  phone: string;
  email: string;
  identityCardNumber?: string;
  nationality?: string;
  drivingLicenseNumber?: string;
  drivingLicenseTier?: string;
  isPaid: boolean;
  courseId?: string;
}

type PaymentFilter = 'all' | 'paid' | 'unpaid';

function MemberTable() {
  const [data, setData] = useState<MemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const getAllMembers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get('Members');
      const res: MemberRecord[] = Array.isArray(response.data) ? response.data : [];
      setData(res);
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể tải danh sách thành viên. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMemberIsPaidAndFetchData = async (
    e: React.MouseEvent<HTMLButtonElement>,
    member: MemberRecord
  ) => {
    e.stopPropagation();
    const actionLabel = member.isPaid
      ? 'chuyển sang trạng thái CHƯA THANH TOÁN'
      : 'xác nhận ĐÃ THANH TOÁN';
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${actionLabel} cho thành viên "${member.fullName}" (Mã TV: ${member.memberID}) không?`
    );
    if (!confirmed) return;

    try {
      setUpdatingMemberId(member.memberID);
      const updateResponse = await api.put(`Member/editIsPaid?memberId=${member.memberID}`);

      if (updateResponse.status === 200) {
        toast.success('Cập nhật trạng thái thanh toán thành công!');
        await getAllMembers();
      } else {
        toast.error('Cập nhật trạng thái thanh toán thất bại.');
      }
    } catch (error: unknown) {
      console.error('Error updating or fetching member data:', error);
      const axiosErr = error as { response?: { data?: { error?: string } } };
      toast.error(
        axiosErr.response?.data?.error ||
          'Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại.'
      );
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleInspectMember = async (
    e: React.MouseEvent<HTMLButtonElement>,
    member: MemberRecord
  ) => {
    e.stopPropagation();
    setSelectedMember(member);
    try {
      const detailRes = await api.get(`Member?memberId=${member.memberID}`);
      if (detailRes.data && typeof detailRes.data === 'object') {
        setSelectedMember((prev) =>
          prev && prev.memberID === member.memberID
            ? { ...prev, ...detailRes.data }
            : prev
        );
      }
    } catch {
      // Keep the row summary data in modal if detail endpoint fails
    }
  };

  useEffect(() => {
    void getAllMembers();
  }, [getAllMembers]);

  const formatDate = (dbDate?: string) => {
    if (!dbDate) return '—';
    const date = new Date(dbDate);
    if (Number.isNaN(date.getTime())) return '—';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return data.filter((member) => {
      if (paymentFilter === 'paid' && !member.isPaid) return false;
      if (paymentFilter === 'unpaid' && member.isPaid) return false;

      if (!query) return true;

      const matchId = String(member.memberID ?? '').toLowerCase().includes(query);
      const matchName = (member.fullName ?? '').toLowerCase().includes(query);
      const matchPhone = (member.phone ?? '').toLowerCase().includes(query);
      const matchEmail = (member.email ?? '').toLowerCase().includes(query);
      const matchCourse = (member.courseId ?? '').toLowerCase().includes(query);
      const matchAddress = (member.residenceAddress ?? '')
        .toLowerCase()
        .includes(query);
      return (
        matchId ||
        matchName ||
        matchPhone ||
        matchEmail ||
        matchCourse ||
        matchAddress
      );
    });
  }, [data, searchQuery, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const paidCount = useMemo(() => data.filter((m) => m.isPaid).length, [data]);

  return (
    <div className="member-table-container">
      <div className="member-table-header">
        <div className="member-table-header__title-group">
          <h1 className="member-table-title">Danh sách thành viên</h1>
          <p className="member-table-subtitle">
            Quản lý hồ sơ đăng ký khoá học và xác nhận trạng thái thanh toán của thành viên
          </p>
        </div>
      </div>

      <div className="member-summary-strip">
        <div className="member-summary-pill">
          <span className="member-summary-pill__label">Tổng thành viên</span>
          <strong className="member-summary-pill__value">{data.length}</strong>
        </div>
        <div className="member-summary-pill member-summary-pill--success">
          <span className="member-summary-pill__label">Đã thanh toán</span>
          <strong className="member-summary-pill__value">{paidCount}</strong>
        </div>
        <div className="member-summary-pill member-summary-pill--warning">
          <span className="member-summary-pill__label">Chưa thanh toán</span>
          <strong className="member-summary-pill__value">
            {Math.max(0, data.length - paidCount)}
          </strong>
        </div>
      </div>

      <div className="member-table-card">
        <div className="member-table-toolbar">
          <div className="member-table-toolbar__search">
            <label htmlFor="member-search-input" className="sr-only">
              Tìm kiếm thành viên
            </label>
            <input
              id="member-search-input"
              type="search"
              className="member-search-input"
              placeholder="Tìm theo mã TV, họ tên, SĐT, email, khoá học..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="member-table-toolbar__filters">
            <label htmlFor="member-payment-filter" className="member-filter-label">
              Thanh toán:
            </label>
            <select
              id="member-payment-filter"
              className="member-filter-select"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value as PaymentFilter);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả ({data.length})</option>
              <option value="paid">Đã thanh toán ({paidCount})</option>
              <option value="unpaid">
                Chưa thanh toán ({Math.max(0, data.length - paidCount)})
              </option>
            </select>
          </div>
        </div>

        <form onSubmit={handleFormSubmit}>
          {isLoading ? (
            <div className="member-table-state" role="status" aria-live="polite">
              <div className="member-table-spinner" aria-hidden="true" />
              <p>Đang tải danh sách thành viên...</p>
            </div>
          ) : errorMessage ? (
            <div className="member-table-state member-table-state--error" role="alert">
              <p>{errorMessage}</p>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => void getAllMembers()}
              >
                Thử lại
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="member-table-state">
              <p>
                {data.length === 0
                  ? 'Hiện chưa có thành viên nào trong hệ thống.'
                  : 'Không tìm thấy thành viên phù hợp với bộ lọc hiện tại.'}
              </p>
              {data.length > 0 && (
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setPaymentFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="member-table-scroll">
                <table className="table member-data-table">
                  <thead>
                    <tr>
                      <th scope="col" className="col-center">STT</th>
                      <th scope="col">Mã TV</th>
                      <th scope="col">Họ và tên</th>
                      <th scope="col">Ngày sinh</th>
                      <th scope="col">Giới tính</th>
                      <th scope="col">Điện thoại</th>
                      <th scope="col">Email</th>
                      <th scope="col" className="col-center">Khoá học</th>
                      <th scope="col" className="col-center">Thanh toán</th>
                      <th scope="col" className="col-actions">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((member, index) => (
                      <tr key={member.memberID ?? index}>
                        <td className="col-center cell-muted">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td>
                          <span className="member-id-badge">#{member.memberID}</span>
                        </td>
                        <td className="cell-strong">{member.fullName}</td>
                        <td className="cell-mono">{formatDate(member.dob)}</td>
                        <td>{member.gender || '—'}</td>
                        <td className="cell-mono">{member.phone || '—'}</td>
                        <td>{member.email || '—'}</td>
                        <td className="col-center">
                          {member.courseId ? (
                            <span className="course-tag">{member.courseId}</span>
                          ) : (
                            <span className="cell-muted">—</span>
                          )}
                        </td>
                        <td className="col-center">
                          <span
                            className={`status-badge ${
                              member.isPaid
                                ? 'status-badge--paid'
                                : 'status-badge--unpaid'
                            }`}
                          >
                            {member.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </span>
                        </td>
                        <td className="col-actions">
                          <div className="row-actions">
                            <button
                              className="action-btn action-btn--view"
                              type="button"
                              onClick={(e) => void handleInspectMember(e, member)}
                            >
                              Chi tiết
                            </button>
                            <button
                              className="action-btn action-btn--edit"
                              type="button"
                              disabled={updatingMemberId === member.memberID}
                              onClick={(e) =>
                                void updateMemberIsPaidAndFetchData(e, member)
                              }
                            >
                              {updatingMemberId === member.memberID
                                ? 'Đang lưu...'
                                : 'Cập nhật TT'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="member-table-footer">
                <span className="member-table-footer__info">
                  Hiển thị {indexOfFirstItem + 1}–
                  {Math.min(indexOfLastItem, filteredMembers.length)} trong tổng số{' '}
                  {filteredMembers.length} thành viên
                </span>
                {totalPages > 1 && (
                  <nav aria-label="Phân trang thành viên">
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

      {selectedMember && (
        <div
          className="member-detail-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-detail-modal-title"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="member-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="member-detail-modal__header">
              <div>
                <h2 id="member-detail-modal-title">
                  Hồ sơ thành viên #{selectedMember.memberID}
                </h2>
                <p>{selectedMember.fullName}</p>
              </div>
              <button
                type="button"
                className="member-detail-modal__close"
                aria-label="Đóng chi tiết thành viên"
                onClick={() => setSelectedMember(null)}
              >
                ×
              </button>
            </div>
            <div className="member-detail-modal__body">
              <div className="member-detail-grid">
                <div className="member-detail-item">
                  <span>Mã thành viên</span>
                  <strong>#{selectedMember.memberID}</strong>
                </div>
                <div className="member-detail-item">
                  <span>Họ và tên</span>
                  <strong>{selectedMember.fullName || '—'}</strong>
                </div>
                <div className="member-detail-item">
                  <span>Ngày sinh</span>
                  <strong>{formatDate(selectedMember.dob)}</strong>
                </div>
                <div className="member-detail-item">
                  <span>Giới tính</span>
                  <strong>{selectedMember.gender || '—'}</strong>
                </div>
                <div className="member-detail-item">
                  <span>Số điện thoại</span>
                  <strong>{selectedMember.phone || '—'}</strong>
                </div>
                <div className="member-detail-item">
                  <span>Email</span>
                  <strong>{selectedMember.email || '—'}</strong>
                </div>
                <div className="member-detail-item">
                  <span>Số CCCD / CMND</span>
                  <strong>{selectedMember.identityCardNumber || '—'}</strong>
                </div>
                <div className="member-detail-item">
                  <span>Khoá học đăng ký</span>
                  <strong>{selectedMember.courseId || '—'}</strong>
                </div>
                <div className="member-detail-item member-detail-item--full">
                  <span>Địa chỉ cư trú</span>
                  <strong>{selectedMember.residenceAddress || '—'}</strong>
                </div>
                <div className="member-detail-item">
                  <span>Trạng thái thanh toán</span>
                  <strong>
                    {selectedMember.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </strong>
                </div>
              </div>
            </div>
            <div className="member-detail-modal__footer">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setSelectedMember(null)}
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

export default MemberTable;
