import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faChalkboardUser,
  faChevronDown,
  faCreditCard,
  faFileLines,
  faNewspaper,
  faTableColumns,
  faUserGraduate,
  faUsers,
  faUsersCog,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.scss";

interface SidebarProps {
  openSidebarToggle: boolean;
  OpenSidebar: () => void;
}

type SubmenuKey = "khoaHoc" | "lichHoc";

const Sidebar: React.FC<SidebarProps> = ({
  openSidebarToggle,
  OpenSidebar,
}) => {
  const location = useLocation();

  const isCourseRoute = location.pathname.startsWith("/quan-ly-khoa-hoc");
  const isClassRoute = location.pathname.startsWith("/quan-ly-lich-hoc");

  const [menuOpen, setMenuOpen] = useState<Record<SubmenuKey, boolean>>({
    khoaHoc: isCourseRoute,
    lichHoc: isClassRoute,
  });

  useEffect(() => {
    setMenuOpen((prev) => ({
      khoaHoc: prev.khoaHoc || isCourseRoute,
      lichHoc: prev.lichHoc || isClassRoute,
    }));
  }, [isCourseRoute, isClassRoute]);

  useEffect(() => {
    if (!openSidebarToggle) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        OpenSidebar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openSidebarToggle, OpenSidebar]);

  const toggleMenu = (menuKey: SubmenuKey) => {
    setMenuOpen((prevMenuOpen) => ({
      ...prevMenuOpen,
      [menuKey]: !prevMenuOpen[menuKey],
    }));
  };

  const handleLinkClick = () => {
    if (openSidebarToggle) {
      OpenSidebar();
    }
  };

  return (
    <>
      {openSidebarToggle && (
        <div
          className="sidebar-backdrop"
          onClick={OpenSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar"
        className={openSidebarToggle ? "sidebar-responsive" : ""}
        aria-label="Thanh điều hướng quản trị"
      >
        <div className="sidebar-title">
          <div className="sidebar-brand">
            <span className="sidebar-brand-mark">FD</span>
            <div className="sidebar-brand-copy">
              <span className="sidebar-brand-name">FDriving</span>
              <span className="sidebar-brand-subtitle">Admin Portal</span>
            </div>
          </div>
          <button
            type="button"
            className="close_icon"
            onClick={OpenSidebar}
            aria-label="Đóng menu điều hướng"
          >
            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Menu quản trị chính">
          <ul className="sidebar-list">
            <li className="list-header">
              <p className="list-header-title">Điều hướng</p>
            </li>

            <SidebarItem
              icon={<FontAwesomeIcon icon={faTableColumns} />}
              text="Bảng điều khiển"
              link="/bang-dieu-khien"
              onClick={handleLinkClick}
            />

            <li className="list-header">
              <p className="list-header-title">Quản lý hệ thống</p>
            </li>

            <li
              className={`sidebar-list-item has-submenu ${
                isCourseRoute ? "is-group-active" : ""
              } ${menuOpen.khoaHoc ? "is-open" : ""}`}
            >
              <button
                type="button"
                className="sidebar-submenu-toggle"
                onClick={() => toggleMenu("khoaHoc")}
                aria-expanded={menuOpen.khoaHoc}
                aria-controls="sidebar-submenu-courses"
              >
                <span className="sidebar-link-content">
                  <span className="sidebar-item-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faCalendarDays} />
                  </span>
                  <span className="sidebar-item-label">Quản lý khóa học</span>
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`submenu-chevron ${
                    menuOpen.khoaHoc ? "is-open" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {menuOpen.khoaHoc && (
                <ul id="sidebar-submenu-courses" className="sidebar-sublist">
                  <SidebarSubItem
                    text="Danh sách khóa học"
                    link="/quan-ly-khoa-hoc"
                    end
                    onClick={handleLinkClick}
                  />
                  <SidebarSubItem
                    text="Các khóa học chưa mở"
                    link="/quan-ly-khoa-hoc/chua-mo"
                    onClick={handleLinkClick}
                  />
                </ul>
              )}
            </li>

            <li
              className={`sidebar-list-item has-submenu ${
                isClassRoute ? "is-group-active" : ""
              } ${menuOpen.lichHoc ? "is-open" : ""}`}
            >
              <button
                type="button"
                className="sidebar-submenu-toggle"
                onClick={() => toggleMenu("lichHoc")}
                aria-expanded={menuOpen.lichHoc}
                aria-controls="sidebar-submenu-classes"
              >
                <span className="sidebar-link-content">
                  <span className="sidebar-item-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faUserGraduate} />
                  </span>
                  <span className="sidebar-item-label">Quản lý lịch học</span>
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`submenu-chevron ${
                    menuOpen.lichHoc ? "is-open" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {menuOpen.lichHoc && (
                <ul id="sidebar-submenu-classes" className="sidebar-sublist">
                  <SidebarSubItem
                    text="Danh sách lịch học"
                    link="/quan-ly-lich-hoc"
                    end
                    onClick={handleLinkClick}
                  />
                  <SidebarSubItem
                    text="Quản lý lớp học lý thuyết"
                    link="/quan-ly-lich-hoc/lop-ly-thuyet"
                    onClick={handleLinkClick}
                  />
                  <SidebarSubItem
                    text="Quản lý lớp học thực hành"
                    link="/quan-ly-lich-hoc/lop-thuc-hanh"
                    onClick={handleLinkClick}
                  />
                </ul>
              )}
            </li>

            <SidebarItem
              icon={<FontAwesomeIcon icon={faNewspaper} />}
              text="Quản lý tin tức"
              link="/quan-ly-tin-tuc"
              onClick={handleLinkClick}
            />

            <SidebarItem
              icon={<FontAwesomeIcon icon={faUsersCog} />}
              text="Quản lý nhân viên"
              link="/quan-ly-nhan-vien"
              onClick={handleLinkClick}
            />

            <SidebarItem
              icon={<FontAwesomeIcon icon={faChalkboardUser} />}
              text="Quản lý giáo viên"
              link="/quan-ly-giao-vien"
              onClick={handleLinkClick}
            />

            <SidebarItem
              icon={<FontAwesomeIcon icon={faUsers} />}
              text="Quản lý thành viên"
              link="/quan-ly-thanh-vien"
              onClick={handleLinkClick}
            />

            <SidebarItem
              icon={<FontAwesomeIcon icon={faUserGraduate} />}
              text="Quản lý học viên"
              link="/quan-ly-hoc-vien"
              onClick={handleLinkClick}
            />

            <SidebarItem
              icon={<FontAwesomeIcon icon={faFileLines} />}
              text="Quản lý kết quả thi"
              link="/quan-ly-ket-qua"
              onClick={handleLinkClick}
            />

            <SidebarItem
              icon={<FontAwesomeIcon icon={faCreditCard} />}
              text="Quản lý thanh toán"
              link="/quan-ly-thanh-toan"
              onClick={handleLinkClick}
            />

            {/* Report route (/bao-cao) remains intentionally hidden while ReportAdminPage is a stub */}
          </ul>
        </nav>
      </aside>
    </>
  );
};

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  text: string;
  link: string;
  end?: boolean;
  onClick?: () => void;
}> = ({ icon, text, link, end, onClick }) => {
  return (
    <li className="sidebar-list-item">
      <NavLink
        to={link}
        end={end}
        className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`
        }
        onClick={onClick}
      >
        <span className="sidebar-link-content">
          <span className="sidebar-item-icon" aria-hidden="true">
            {icon}
          </span>
          <span className="sidebar-item-label">{text}</span>
        </span>
      </NavLink>
    </li>
  );
};

const SidebarSubItem: React.FC<{
  text: string;
  link: string;
  end?: boolean;
  onClick?: () => void;
}> = ({ text, link, end, onClick }) => {
  return (
    <li className="sidebar-sublist-item">
      <NavLink
        to={link}
        end={end}
        className={({ isActive }) =>
          `sidebar-sublink ${isActive ? "active" : ""}`
        }
        onClick={onClick}
      >
        <span className="sidebar-sublink-dot" aria-hidden="true" />
        <span className="sidebar-item-label">{text}</span>
      </NavLink>
    </li>
  );
};

export default Sidebar;
