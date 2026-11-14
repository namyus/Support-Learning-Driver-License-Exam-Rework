import { useEffect, useRef } from 'react';
import { BsBoxArrowRight, BsClipboardCheck, BsGraphUp, BsHouseDoor, BsNewspaper, BsPeople, BsPersonGear, BsX } from 'react-icons/bs';
import { NavLink, useNavigate } from 'react-router-dom';
import './header.scss';

interface StaffSidebarProps {
  isOpen: boolean;
  onNavigate: () => void;
  onClose: () => void;
}

function StaffSidebar({ isOpen, onNavigate, onClose }: StaffSidebarProps) {
  const navigate = useNavigate();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isOpen) firstLinkRef.current?.focus();
  }, [isOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem('loginedUser');
    navigate('/');
    location.reload();
    window.scroll({ top: 0, behavior: 'instant' });
  };

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `staff-sidebar__link${isActive ? ' is-active' : ''}`;

  return (
    <aside
      id="staff-sidebar"
      className={`staff-sidebar${isOpen ? ' staff-sidebar--open' : ''}`}
      aria-label="Điều hướng nhân viên"
    >
      <div className="staff-sidebar__brand">
        <span className="staff-sidebar__brand-mark" aria-hidden="true">FD</span>
        <span className="staff-sidebar__brand-copy">
          <strong>FDriving</strong>
          <span>Staff Portal</span>
        </span>
        <button className="staff-sidebar__close" type="button" aria-label="Đóng menu điều hướng" onClick={onClose}>
          <BsX aria-hidden="true" />
        </button>
      </div>

      <nav className="staff-sidebar__nav" aria-label="Điều hướng chính">
        <p className="staff-sidebar__section-label">Tổng quan</p>
        <NavLink ref={firstLinkRef} to="/" end className={linkClassName} onClick={onNavigate}>
          <BsHouseDoor aria-hidden="true" /><span>Tổng quan</span>
        </NavLink>

        <p className="staff-sidebar__section-label">Quản lý hệ thống</p>
        <NavLink to="/quan-ly-thanh-vien" className={linkClassName} onClick={onNavigate}>
          <BsPeople aria-hidden="true" /><span>Quản lý thành viên</span>
        </NavLink>
        <NavLink to="/quan-ly-nguoi-dung" className={linkClassName} onClick={onNavigate}>
          <BsPersonGear aria-hidden="true" /><span>Quản lý người dùng</span>
        </NavLink>

        <div className="staff-sidebar__group">
          <NavLink to="/quan-ly-tin-tuc" className={linkClassName} onClick={onNavigate}>
            <BsNewspaper aria-hidden="true" /><span>Quản lý tin tức</span>
          </NavLink>
          <div className="staff-sidebar__subnav">
            <NavLink to="/quan-ly-tin-tuc" end className="staff-sidebar__sublink" onClick={onNavigate}>Tin đang hoạt động</NavLink>
            <NavLink to="/quan-ly-tin-tuc/chua-kich-hoat" className="staff-sidebar__sublink" onClick={onNavigate}>Tin chưa kích hoạt</NavLink>
          </div>
        </div>

        <div className="staff-sidebar__group">
          <NavLink to="/quan-ly-ky-thi" className={linkClassName} onClick={onNavigate}>
            <BsClipboardCheck aria-hidden="true" /><span>Quản lý kỳ thi</span>
          </NavLink>
          <div className="staff-sidebar__subnav">
            <NavLink to="/quan-ly-ky-thi" end className="staff-sidebar__sublink" onClick={onNavigate}>Danh sách kỳ thi</NavLink>
            <NavLink to="/quan-ly-ky-thi/tao-ky-thi" className="staff-sidebar__sublink" onClick={onNavigate}>Tạo kỳ thi</NavLink>
          </div>
        </div>

        <NavLink to="/bao-cao" className={linkClassName} onClick={onNavigate}>
          <BsGraphUp aria-hidden="true" /><span>Báo cáo</span>
        </NavLink>
      </nav>

      <button className="staff-sidebar__logout" type="button" onClick={handleLogout}>
        <BsBoxArrowRight aria-hidden="true" /><span>Đăng xuất</span>
      </button>
    </aside>
  );
}

export default StaffSidebar;
