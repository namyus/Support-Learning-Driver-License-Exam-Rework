import { useEffect, useMemo, useState } from 'react';
import './staff-users-table.scss';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  fetchUsers,
  selectUsersList,
} from '../../../features/members/membersSlice';

function UserTable() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectUsersList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordPage = 10;

  useEffect(() => {
    const getAllUser = async () => {
      try {
        await dispatch(fetchUsers()).unwrap();
      } catch (error) {
        console.error(error);
      }
    };
    void getAllUser();
  }, [dispatch]);

  const activeCount = data.filter((user) => user.status === true).length;
  const inactiveCount = data.filter((user) => user.status === false).length;
  const roles = Array.from(new Set(data.map((user) => String(user.roleId)))).sort();

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    return data.filter((user) => {
      if (statusFilter === 'active' && user.status !== true) return false;
      if (statusFilter === 'inactive' && user.status !== false) return false;
      if (roleFilter !== 'all' && String(user.roleId) !== roleFilter) return false;
      if (!query) return true;
      return [user.userID, user.fullName, user.phone, user.email]
        .some((value) => String(value ?? '').toLocaleLowerCase('vi').includes(query));
    });
  }, [data, searchQuery, statusFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / recordPage));
  const safePage = Math.min(currentPage, totalPages);
  const firstIndex = (safePage - 1) * recordPage;
  const records = filteredData.slice(firstIndex, firstIndex + recordPage);

  return (
    <div className="user-table-container staff-list-page">
      <header className="staff-list-header">
        <div>
          <h1>Danh sách người dùng</h1>
          <p>Tra cứu tài khoản, thông tin liên hệ và vai trò trong hệ thống.</p>
        </div>
      </header>

      <section className="staff-summary-strip" aria-label="Tổng quan người dùng">
        <div className="staff-summary-pill"><span className="staff-summary-pill__label">Tổng người dùng đã tải</span><strong className="staff-summary-pill__value">{data.length}</strong></div>
        <div className="staff-summary-pill staff-summary-pill--success"><span className="staff-summary-pill__label">Đang hoạt động</span><strong className="staff-summary-pill__value">{activeCount}</strong></div>
        <div className="staff-summary-pill staff-summary-pill--muted"><span className="staff-summary-pill__label">Ngừng hoạt động trong dữ liệu đã tải</span><strong className="staff-summary-pill__value">{inactiveCount}</strong></div>
      </section>
      <p className="staff-metrics-note">Số liệu tính trên các bản ghi GET /Users trả về; API hiện chỉ trả tài khoản đang hoạt động.</p>

      <section className="staff-table-card" aria-label="Danh sách người dùng">
        <div className="staff-table-toolbar">
          <div className="staff-table-toolbar__search">
            <label className="staff-sr-only" htmlFor="staff-user-search">Tìm người dùng</label>
            <input id="staff-user-search" className="staff-search-input" type="search" placeholder="Tìm theo mã, họ tên, điện thoại hoặc email..." value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }} />
          </div>
          <div className="staff-table-toolbar__filters">
            <div className="staff-filter-group"><label className="staff-filter-label" htmlFor="staff-user-status">Trạng thái</label>
            <select id="staff-user-status" className="staff-filter-select" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }}>
              <option value="all">Tất cả ({data.length})</option>
              <option value="active">Đang hoạt động ({activeCount})</option>
              <option value="inactive">Ngừng hoạt động ({inactiveCount})</option>
            </select></div>
            <div className="staff-filter-group"><label className="staff-filter-label" htmlFor="staff-user-role">Vai trò</label>
            <select id="staff-user-role" className="staff-filter-select" value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setCurrentPage(1); }}>
              <option value="all">Tất cả vai trò</option>
              {roles.map((role) => <option key={role} value={role}>Vai trò {role}</option>)}
            </select></div>
          </div>
        </div>
        <div className="staff-table-scroll">
          <table className="table staff-data-table">
            <thead><tr><th scope="col">ID</th><th scope="col">Họ và tên</th><th scope="col">Điện thoại</th><th scope="col">Email</th><th scope="col" className="col-center">Trạng thái</th><th scope="col" className="col-center">Vai trò</th></tr></thead>
            <tbody>{records.length ? records.map((user) => (
              <tr key={user.userID}>
                <td><span className="staff-id-badge">#{user.userID}</span></td><td className="cell-strong">{user.fullName || '—'}</td><td className="cell-mono">{user.phone || '—'}</td><td>{user.email || '—'}</td>
                <td className="col-center"><span className={`status-badge ${user.status ? 'status-badge--active' : 'status-badge--inactive'}`}>{user.status ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span></td><td className="col-center">{user.roleId}</td>
              </tr>
            )) : <tr><td colSpan={6}><div className="staff-table-state">{data.length ? 'Không tìm thấy người dùng phù hợp với bộ lọc hiện tại.' : 'Hiện chưa có dữ liệu người dùng.'}</div></td></tr>}</tbody>
          </table>
        </div>
        <footer className="staff-table-footer">
          <span className="staff-table-footer__info">Hiển thị {records.length ? firstIndex + 1 : 0}–{Math.min(firstIndex + recordPage, filteredData.length)} trong {filteredData.length} người dùng</span>
          {filteredData.length > 0 && <nav aria-label="Phân trang người dùng"><ul className="pagination">
            <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}><button type="button" className="page-link" disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)}>Trước</button></li>
            {Array.from({ length: totalPages }, (_, index) => <li key={index} className={`page-item ${safePage === index + 1 ? 'active' : ''}`}><button type="button" className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button></li>)}
            <li className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}><button type="button" className="page-link" disabled={safePage === totalPages} onClick={() => setCurrentPage(safePage + 1)}>Sau</button></li>
          </ul></nav>}
        </footer>
      </section>
    </div>
  );
}

export default UserTable;
