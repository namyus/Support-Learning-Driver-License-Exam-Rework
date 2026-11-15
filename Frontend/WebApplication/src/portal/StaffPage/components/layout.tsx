import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BsJustify, BsPersonCircle } from 'react-icons/bs';
import './staff-general.scss';
import StaffSidebar from './organisms/header/header';

interface StaffSessionUser {
    fullName?: string | null;
    username?: string | null;
}

function readStaffUser(): StaffSessionUser | null {
    try {
        const rawUser = sessionStorage.getItem('loginedUser');
        return rawUser ? JSON.parse(rawUser) as StaffSessionUser : null;
    } catch {
        return null;
    }
}

function StaffLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user] = useState(readStaffUser);
    const menuToggleRef = useRef<HTMLButtonElement>(null);
    const location = useLocation();
    const displayName = user?.fullName?.trim() || user?.username?.trim() || 'Nhân viên';
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
        <div className={`staff-portal${isSidebarOpen ? ' staff-portal--sidebar-open' : ''}`}>
            <div className="staff-portal__grid">
                <StaffSidebar isOpen={isSidebarOpen} onNavigate={closeSidebar} onClose={closeSidebar} />
                <button
                    className="staff-portal__backdrop"
                    type="button"
                    aria-label="Đóng menu điều hướng"
                    tabIndex={isSidebarOpen ? 0 : -1}
                    onClick={closeSidebar}
                />
                <header className="staff-portal__topbar">
                    <div className="staff-portal__topbar-left">
                        <button
                            ref={menuToggleRef}
                            className="staff-portal__menu-toggle"
                            type="button"
                            aria-label={isSidebarOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
                            aria-expanded={isSidebarOpen}
                            aria-controls="staff-sidebar"
                            onClick={() => setIsSidebarOpen((open) => !open)}
                        >
                            <BsJustify aria-hidden="true" />
                        </button>
                        <span className="staff-portal__header-badge">FDRIVING</span>
                        <span className="staff-portal__header-title">Hệ thống quản lý đào tạo lái xe</span>
                    </div>
                    <div className="staff-portal__profile" aria-label={`Đang đăng nhập: ${displayName}, Nhân viên`}>
                        <span className="staff-portal__profile-icon"><BsPersonCircle aria-hidden="true" /></span>
                        <span className="staff-portal__profile-copy">
                            <strong>{displayName}</strong>
                            <span>Nhân viên</span>
                        </span>
                    </div>
                </header>
                <main className="staff-portal__content">
                    <div className="staff-portal__content-inner">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default StaffLayout;
