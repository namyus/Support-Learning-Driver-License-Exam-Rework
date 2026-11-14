import React, { useEffect, useRef, useState } from "react";
import {
  BsPersonCircle,
  BsJustify,
  BsChevronDown,
  BsPersonGear,
  BsBoxArrowRight,
} from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import "./Header.scss";

interface HeaderProps {
  OpenSidebar: () => void;
}

interface StoredAdminUser {
  username?: string;
  fullName?: string;
  email?: string;
  roleId?: number;
}

const getStoredUser = (): StoredAdminUser | null => {
  try {
    const rawUser = sessionStorage.getItem("loginedUser");
    return rawUser ? (JSON.parse(rawUser) as StoredAdminUser) : null;
  } catch {
    return null;
  }
};

const Header: React.FC<HeaderProps> = ({ OpenSidebar }) => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const profileItemRef = useRef<HTMLButtonElement>(null);
  const logoutItemRef = useRef<HTMLButtonElement>(null);

  const displayName =
    user?.fullName?.trim() || user?.username?.trim() || "Quản trị viên";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        triggerBtnRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsMenuOpen(true);
      setTimeout(() => profileItemRef.current?.focus(), 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsMenuOpen(true);
      setTimeout(() => logoutItemRef.current?.focus(), 0);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = [profileItemRef.current, logoutItemRef.current].filter(
      Boolean
    ) as HTMLButtonElement[];
    if (items.length === 0) return;

    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement
    );

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex =
        currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex =
        currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const handleProfile = () => {
    setIsMenuOpen(false);
    navigate("/Thong-tin-ca-nhan");
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    sessionStorage.removeItem("loginedUser");
    window.location.href = "/dang-nhap";
  };

  return (
    <div className="Header" role="banner">
      <div className="header-left">
        <div className="menu-icon">
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={OpenSidebar}
            aria-label="Mở menu điều hướng"
          >
            <BsJustify className="icon" aria-hidden="true" />
          </button>
        </div>
        <div className="header-context">
          <span className="header-badge">FDriving</span>
          <span className="header-title">Hệ thống quản trị đào tạo lái xe</span>
        </div>
      </div>

      <div className="header-right" ref={dropdownRef}>
        <button
          ref={triggerBtnRef}
          type="button"
          className={`profile-trigger-btn ${isMenuOpen ? "is-open" : ""}`}
          onClick={toggleMenu}
          onKeyDown={handleTriggerKeyDown}
          aria-label="Tài khoản quản trị viên"
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-controls="admin-profile-menu"
        >
          <span className="profile-avatar" aria-hidden="true">
            <BsPersonCircle className="icon" />
          </span>
          <span className="profile-meta">
            <span className="profile-name">{displayName}</span>
            <span className="profile-role">Quản trị viên</span>
          </span>
          <BsChevronDown
            className={`profile-chevron ${isMenuOpen ? "is-open" : ""}`}
            aria-hidden="true"
          />
        </button>

        {isMenuOpen && (
          <div
            id="admin-profile-menu"
            className="profile-dropdown-menu"
            role="menu"
            aria-label="Tùy chọn tài khoản"
            onKeyDown={handleMenuKeyDown}
          >
            <div className="profile-dropdown-header">
              <p className="dropdown-user-name">{displayName}</p>
              <p className="dropdown-user-role">Quản trị hệ thống (Admin)</p>
            </div>
            <div className="profile-dropdown-divider" role="separator" />
            <button
              ref={profileItemRef}
              type="button"
              role="menuitem"
              className="profile-dropdown-item"
              onClick={handleProfile}
            >
              <BsPersonGear className="dropdown-item-icon" aria-hidden="true" />
              <span>Hồ sơ cá nhân</span>
            </button>
            <button
              ref={logoutItemRef}
              type="button"
              role="menuitem"
              className="profile-dropdown-item profile-dropdown-item--danger"
              onClick={handleLogout}
            >
              <BsBoxArrowRight
                className="dropdown-item-icon"
                aria-hidden="true"
              />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
