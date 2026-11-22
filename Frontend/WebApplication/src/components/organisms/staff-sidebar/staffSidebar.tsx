import { useEffect, useRef } from 'react';
import {
  BsBoxArrowRight,
  BsClipboardCheck,
  BsGraphUp,
  BsHouseDoor,
  BsNewspaper,
  BsPeople,
  BsPersonGear,
  BsX,
} from 'react-icons/bs';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuthenticatedUser, useAppDispatch } from '../../../app/store';
import IconButton from '../../atoms/icon-button/iconButton';
import PortalBrand from '../../molecules/portal-brand/portalBrand';
import SidebarNavItem from '../../molecules/sidebar-nav-item/sidebarNavItem';
import './staff-sidebar.scss';

interface StaffSidebarProps {
  isOpen: boolean;
  onNavigate: () => void;
  onClose: () => void;
}

function StaffSidebar({ isOpen, onNavigate, onClose }: StaffSidebarProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isOpen) firstLinkRef.current?.focus();
  }, [isOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem('loginedUser');
    dispatch(clearAuthenticatedUser());
    navigate('/');
    location.reload();
    window.scroll({ top: 0, behavior: 'instant' });
  };

  return (
    <aside
      id="staff-sidebar"
      className={`staff-sidebar${isOpen ? ' staff-sidebar--open' : ''}`}
      aria-label="Điều hướng nhân viên"
    >
      <div className="staff-sidebar__brand">
        <PortalBrand
          brandName="FDriving"
          mark="FD"
          subtitle="Staff Portal"
          markClassName="staff-sidebar__brand-mark"
          copyClassName="staff-sidebar__brand-copy"
        />
        <IconButton
          className="staff-sidebar__close"
          label="Đóng menu điều hướng"
          onClick={onClose}
          icon={<BsX aria-hidden="true" />}
        />
      </div>

      <nav className="staff-sidebar__nav" aria-label="Điều hướng chính">
        <p className="staff-sidebar__section-label">Tổng quan</p>
        <SidebarNavItem
          ref={firstLinkRef}
          to="/"
          end
          label="Tổng quan"
          icon={<BsHouseDoor aria-hidden="true" />}
          className="staff-sidebar__link"
          activeClassName="is-active"
          onClick={onNavigate}
        />

        <p className="staff-sidebar__section-label">Quản lý hệ thống</p>
        <SidebarNavItem
          to="/quan-ly-thanh-vien"
          label="Quản lý thành viên"
          icon={<BsPeople aria-hidden="true" />}
          className="staff-sidebar__link"
          activeClassName="is-active"
          onClick={onNavigate}
        />
        <SidebarNavItem
          to="/quan-ly-nguoi-dung"
          label="Quản lý người dùng"
          icon={<BsPersonGear aria-hidden="true" />}
          className="staff-sidebar__link"
          activeClassName="is-active"
          onClick={onNavigate}
        />

        <div className="staff-sidebar__group">
          <SidebarNavItem
            to="/quan-ly-tin-tuc"
            label="Quản lý tin tức"
            icon={<BsNewspaper aria-hidden="true" />}
            className="staff-sidebar__link"
            activeClassName="is-active"
            onClick={onNavigate}
          />
          <div className="staff-sidebar__subnav">
            <NavLink
              to="/quan-ly-tin-tuc"
              end
              className="staff-sidebar__sublink"
              onClick={onNavigate}
            >
              Tin đang hoạt động
            </NavLink>
            <NavLink
              to="/quan-ly-tin-tuc/chua-kich-hoat"
              className="staff-sidebar__sublink"
              onClick={onNavigate}
            >
              Tin chưa kích hoạt
            </NavLink>
          </div>
        </div>

        <div className="staff-sidebar__group">
          <SidebarNavItem
            to="/quan-ly-ky-thi"
            label="Quản lý kỳ thi"
            icon={<BsClipboardCheck aria-hidden="true" />}
            className="staff-sidebar__link"
            activeClassName="is-active"
            onClick={onNavigate}
          />
          <div className="staff-sidebar__subnav">
            <NavLink
              to="/quan-ly-ky-thi"
              end
              className="staff-sidebar__sublink"
              onClick={onNavigate}
            >
              Danh sách kỳ thi
            </NavLink>
            <NavLink
              to="/quan-ly-ky-thi/tao-ky-thi"
              className="staff-sidebar__sublink"
              onClick={onNavigate}
            >
              Tạo kỳ thi
            </NavLink>
          </div>
        </div>

        <SidebarNavItem
          to="/bao-cao"
          label="Báo cáo"
          icon={<BsGraphUp aria-hidden="true" />}
          className="staff-sidebar__link"
          activeClassName="is-active"
          onClick={onNavigate}
        />
      </nav>

      <button
        className="staff-sidebar__logout"
        type="button"
        onClick={handleLogout}
      >
        <BsBoxArrowRight aria-hidden="true" />
        <span>Đăng xuất</span>
      </button>
    </aside>
  );
}

export default StaffSidebar;
