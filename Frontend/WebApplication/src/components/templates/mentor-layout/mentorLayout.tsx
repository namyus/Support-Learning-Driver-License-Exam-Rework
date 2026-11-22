import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BsJustify } from 'react-icons/bs';
import api from '../../../config/axios';
import IconButton from '../../atoms/icon-button/iconButton';
import PortalUserInfo from '../../molecules/portal-user-info/portalUserInfo';
import MentorSidebar from '../../organisms/mentor-sidebar/mentorSidebar';
import './mentor-layout.scss';

interface MentorSessionUser {
  userID?: number | string;
  fullName?: string | null;
  username?: string | null;
}

interface MentorProfileRecord {
  mentorId?: number | string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  isTeachingTheory?: boolean | null;
  isTeachingPractice?: boolean | null;
}

function readMentorSessionUser(): MentorSessionUser | null {
  try {
    const rawUser = sessionStorage.getItem('loginedUser');
    return rawUser ? (JSON.parse(rawUser) as MentorSessionUser) : null;
  } catch {
    return null;
  }
}

function readStoredMentorProfile(): MentorProfileRecord | null {
  try {
    const rawMentor = sessionStorage.getItem('loginedMentor');
    return rawMentor ? (JSON.parse(rawMentor) as MentorProfileRecord) : null;
  } catch {
    return null;
  }
}

function MentorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user] = useState(readMentorSessionUser);
  const [mentor, setMentor] = useState<MentorProfileRecord | null>(readStoredMentorProfile);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    const userID = user?.userID;
    if (userID == null) return;

    const loadMentorProfile = async () => {
      try {
        const response = await api.get('Mentor/user/' + userID);
        if (response.data) {
          setMentor(response.data as MentorProfileRecord);
          sessionStorage.setItem('loginedMentor', JSON.stringify(response.data));
        }
      } catch (err) {
        console.error(err);
      }
    };

    void loadMentorProfile();
  }, [user?.userID]);

  const displayName =
    mentor?.fullName?.trim() ||
    user?.fullName?.trim() ||
    user?.username?.trim() ||
    'Giảng viên';

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    if (window.matchMedia('(max-width: 992px)').matches) {
      menuToggleRef.current?.focus();
    }
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isSidebarOpen]);

  return (
    <div
      className={`mentor-portal${
        isSidebarOpen ? ' mentor-portal--sidebar-open' : ''
      }`}
    >
      <div className="mentor-portal__grid">
        <MentorSidebar
          isOpen={isSidebarOpen}
          mentorName={displayName}
          onNavigate={closeSidebar}
          onClose={closeSidebar}
        />
        <button
          className="mentor-portal__backdrop"
          type="button"
          aria-label="Đóng menu điều hướng"
          tabIndex={isSidebarOpen ? 0 : -1}
          onClick={closeSidebar}
        />
        <header className="mentor-portal__topbar">
          <div className="mentor-portal__topbar-left">
            <IconButton
              ref={menuToggleRef}
              className="mentor-portal__menu-toggle"
              label={
                isSidebarOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'
              }
              aria-expanded={isSidebarOpen}
              aria-controls="mentor-sidebar"
              onClick={() => setIsSidebarOpen((open) => !open)}
              icon={<BsJustify aria-hidden="true" />}
            />
            <span className="mentor-portal__header-badge">FDRIVING</span>
            <span className="mentor-portal__header-title">
              Cổng thông tin giảng viên đào tạo lái xe
            </span>
          </div>
          <div
            className="mentor-portal__profile"
            aria-label={`Đang đăng nhập: ${displayName}, Giảng viên`}
          >
            <PortalUserInfo
              name={displayName}
              role="Giảng viên"
              avatarSize="sm"
              avatarClassName="mentor-portal__profile-icon"
              textClassName="mentor-portal__profile-copy"
            />
          </div>
        </header>
        <main className="mentor-portal__content">
          <div className="mentor-portal__content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MentorLayout;
