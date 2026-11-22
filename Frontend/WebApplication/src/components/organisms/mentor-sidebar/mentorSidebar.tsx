import { useEffect, useRef, useState } from 'react';
import {
  BsBoxArrowRight,
  BsCalendarCheck,
  BsCalendarWeek,
  BsHouseDoor,
  BsPersonBadge,
  BsX,
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/axios';
import { clearAuthenticatedUser, useAppDispatch } from '../../../app/store';
import IconButton from '../../atoms/icon-button/iconButton';
import PortalBrand from '../../molecules/portal-brand/portalBrand';
import SidebarNavItem from '../../molecules/sidebar-nav-item/sidebarNavItem';
import './mentor-sidebar.scss';

interface MentorProfile {
  mentorId?: number | string;
  fullName?: string;
}

interface MentorSidebarProps {
  isOpen?: boolean;
  mentorName?: string;
  onNavigate?: () => void;
  onClose?: () => void;
}

function MentorSidebar({
  isOpen = false,
  mentorName,
  onNavigate,
  onClose,
}: MentorSidebarProps) {
  const user = sessionStorage.getItem('loginedUser')
    ? JSON.parse(sessionStorage.getItem('loginedUser')!)
    : null;
  const userID = user?.userID;
  const [mentor, setMentor] = useState<MentorProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem('loginedMentor');
      return stored ? (JSON.parse(stored) as MentorProfile) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isOpen) {
      firstLinkRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (userID == null) {
      return;
    }

    const getMentorbyId = async () => {
      try {
        const response = await api.get('Mentor/user/' + userID);
        setMentor(response.data);
        sessionStorage.setItem('loginedMentor', JSON.stringify(response.data));
      } catch (error) {
        console.log(error);
      }
    };

    void getMentorbyId();
  }, [userID]);

  const handleScroll = () => {
    window.scroll({
      top: 0,
      behavior: 'instant',
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loginedUser');
    sessionStorage.removeItem('loginedMentor');
    dispatch(clearAuthenticatedUser());
    navigate('/');
    location.reload();
    handleScroll();
  };

  const accountLabel =
    mentor?.fullName?.trim() ||
    mentorName?.trim() ||
    user?.fullName?.trim() ||
    user?.username?.trim() ||
    'Giảng viên';

  return (
    <aside
      id="mentor-sidebar"
      className={`mentor-sidebar-panel${
        isOpen ? ' mentor-sidebar-panel--open' : ''
      }`}
      aria-label="Điều hướng giảng viên"
    >
      <div className="mentor-sidebar-panel__brand">
        <PortalBrand
          brandName="FDriving"
          mark="FD"
          subtitle="Mentor Portal"
          markClassName="mentor-sidebar-panel__brand-mark"
          copyClassName="mentor-sidebar-panel__brand-copy"
        />
        <IconButton
          className="mentor-sidebar-panel__close"
          label="Đóng menu điều hướng"
          onClick={onClose}
          icon={<BsX aria-hidden="true" />}
        />
      </div>

      <nav className="mentor-sidebar-panel__nav" aria-label="Điều hướng chính">
        <p className="mentor-sidebar-panel__section-label">Tổng quan</p>
        <SidebarNavItem
          ref={firstLinkRef}
          to="/"
          end
          label="Trang chủ"
          icon={<BsHouseDoor aria-hidden="true" />}
          className="mentor-sidebar-panel__link"
          activeClassName="is-active"
          onClick={onNavigate}
        />

        <p className="mentor-sidebar-panel__section-label">Công cụ &amp; giảng dạy</p>
        <SidebarNavItem
          to="/lich-day"
          label="Lịch dạy"
          icon={<BsCalendarWeek aria-hidden="true" />}
          className="mentor-sidebar-panel__link"
          activeClassName="is-active"
          onClick={onNavigate}
        />
        <SidebarNavItem
          to="/danh-sach-khoa-hoc-giao-vien"
          label="Đăng kí lịch dạy"
          icon={<BsCalendarCheck aria-hidden="true" />}
          className="mentor-sidebar-panel__link"
          activeClassName="is-active"
          onClick={onNavigate}
        />
      </nav>

      <div className="mentor-sidebar-panel__footer">
        <div className="mentor-sidebar-panel__account">
          <span className="mentor-sidebar-panel__account-icon" aria-hidden="true">
            <BsPersonBadge />
          </span>
          <div className="mentor-sidebar-panel__account-copy">
            <span>Tài khoản giảng viên</span>
            <strong>{accountLabel}</strong>
          </div>
        </div>

        <button
          className="mentor-sidebar-panel__logout"
          type="button"
          onClick={handleLogout}
        >
          <BsBoxArrowRight aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

export default MentorSidebar;
