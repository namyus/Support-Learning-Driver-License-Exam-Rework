import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link as ScrollLink, scroller } from 'react-scroll';
import { toast } from 'react-toastify';
import MemberImg from '../../../../assets/imgs/member/member_img.png';
import api from '../../../config/axios';
import { clearAuthenticatedUser, useAppDispatch } from '../../../app/store';
import BrandLogo from '../../atoms/brand-logo/brandLogo';
import UserAvatar from '../../atoms/user-avatar/userAvatar';
import './member-header.scss';

interface LoginUser {
  userID?: number | string;
  username?: string;
}

interface MemberRecord {
  memberID?: number | string;
}

interface StudentRecord {
  pass?: boolean | null;
}

function readSessionValue<T>(key: string): T | null {
  const rawValue = sessionStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`Cannot parse sessionStorage value: ${key}`, error);
    return null;
  }
}

function MemberHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isHomePage = location.pathname === '/';
  const isCoursePage = location.pathname.startsWith('/khoahoc');
  const isExamPage = location.pathname.startsWith('/kiem-tra');
  const isProfilePage = location.pathname.startsWith('/thong-tin-ca-nhan');
  const isRegisteredCoursePage =
    location.pathname.startsWith('/khoa-hoc-cua-ban') ||
    location.pathname.startsWith('/danh-sach-khoa-hoc');
  const isExamDocumentPage = location.pathname.startsWith('/ho-so-thi');

  const user = readSessionValue<LoginUser>('loginedUser');
  const userID = user?.userID;
  const username = user?.username ?? '';

  const [member, setMember] = useState<MemberRecord | null>(() =>
    readSessionValue<MemberRecord>('loginedMember')
  );
  const [, setStudent] = useState<StudentRecord | null>(null);
  const [, setIsPass] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileTriggerRef = useRef<HTMLButtonElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    window.scroll({
      top: 0,
      behavior: 'instant',
    });
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleRouteNavigateClick = () => {
    closeAllMenus();
    handleScroll();
  };

  useEffect(() => {
    let isMounted = true;

    if (userID == null) {
      return () => {
        isMounted = false;
      };
    }

    const getMemberByID = async () => {
      try {
        const response = await api.get<MemberRecord>(`Member/${userID}`);
        if (!isMounted) {
          return;
        }
        setMember(response.data);
        sessionStorage.setItem('loginedMember', JSON.stringify(response.data));
      } catch (error) {
        console.log(error);
      }
    };

    void getMemberByID();

    return () => {
      isMounted = false;
    };
  }, [userID]);

  useEffect(() => {
    const notify = localStorage.getItem('loginSuccessNotify');
    if (notify != null) {
      toast.success(notify);
    }
    localStorage.removeItem('loginSuccessNotify');
  }, []);

  useEffect(() => {
    if (!member?.memberID) {
      return;
    }

    const getStudentById = async () => {
      try {
        const response = await api.get<StudentRecord>(
          'Student/' + member.memberID
        );
        const res = response.data;
        setStudent(res);
        if (res?.pass !== null && res?.pass === true) {
          setIsPass(true);
        }
      } catch (err) {
        console.log(err);
      }
    };

    void getStudentById();
  }, [member]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) {
      return;
    }

    const targetId = location.hash.replace('#', '');
    if (!targetId) {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        scroller.scrollTo(targetId, {
          smooth: true,
          offset: -88,
          duration: 500,
        });
      }
    }, 80);

    return () => {
      window.clearTimeout(scrollTimer);
    };
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!isMobileMenuOpen && !isProfileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      if (isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
        profileTriggerRef.current?.focus();
      } else if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (
        isProfileMenuOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen, isProfileMenuOpen]);

  const handleClickNotMember = () => {
    closeAllMenus();
    toast.info('Bạn cần đăng ký khoá học để sử dụng chức năng');
  };

  const handleLogout = () => {
    closeAllMenus();
    sessionStorage.removeItem('loginedUser');
    sessionStorage.removeItem('loginedMember');
    dispatch(clearAuthenticatedUser());
    navigate('/');
    window.location.reload();
    handleScroll();
  };

  const renderHomeSectionLink = (
    sectionId: string,
    offset: number,
    label: string,
    isActiveOnSubpage = false
  ) => {
    if (isHomePage) {
      return (
        <ScrollLink
          to={sectionId}
          spy={true}
          smooth={true}
          offset={offset}
          duration={500}
          href={`#${sectionId}`}
          className="mh-nav-link"
          onClick={closeAllMenus}
        >
          {label}
        </ScrollLink>
      );
    }

    const targetTo =
      sectionId === 'center-introduction' ? '/' : `/#${sectionId}`;

    return (
      <RouterLink
        to={targetTo}
        className={`mh-nav-link ${isActiveOnSubpage ? 'active' : ''}`}
        aria-current={isActiveOnSubpage ? 'page' : undefined}
        onClick={
          sectionId === 'center-introduction'
            ? handleRouteNavigateClick
            : closeAllMenus
        }
      >
        {label}
      </RouterLink>
    );
  };

  return (
    <div className="member-nav-container">
      <nav className="mh-nav-inner" aria-label="Điều hướng thành viên">
        <div className="mh-nav-brand-wrap">
          {isHomePage ? (
            <ScrollLink
              to="center-introduction"
              spy={true}
              smooth={true}
              offset={-88}
              duration={500}
              href="#center-introduction"
              className="mh-nav-brand"
              onClick={closeAllMenus}
            >
              <BrandLogo
                alt="Trung tâm đào tạo lái xe FDriving"
                className="logo-home"
              />
            </ScrollLink>
          ) : (
            <RouterLink
              to="/"
              className="mh-nav-brand"
              onClick={handleRouteNavigateClick}
            >
              <BrandLogo
                alt="Trung tâm đào tạo lái xe FDriving"
                className="logo-home"
              />
            </RouterLink>
          )}
        </div>

        <div className="mh-nav-mobile-controls">
          <button
            ref={toggleButtonRef}
            type="button"
            className={`mh-nav-toggle ${isMobileMenuOpen ? 'is-active' : ''}`}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mh-primary-nav"
            aria-label={
              isMobileMenuOpen
                ? 'Đóng menu điều hướng'
                : 'Mở menu điều hướng'
            }
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span className="mh-nav-toggle__bar" aria-hidden="true" />
            <span className="mh-nav-toggle__bar" aria-hidden="true" />
            <span className="mh-nav-toggle__bar" aria-hidden="true" />
          </button>
        </div>

        <div
          id="mh-primary-nav"
          className={`mh-nav-menu ${isMobileMenuOpen ? 'is-open' : ''}`}
        >
          <ul className="mh-nav-links">
            <li className="mh-nav-item">
              {renderHomeSectionLink('center-introduction', -88, 'Trang chủ')}
            </li>
            <li className="mh-nav-item">
              {renderHomeSectionLink(
                'course-section',
                -88,
                'Khoá học',
                isCoursePage
              )}
            </li>
            <li className="mh-nav-item">
              {renderHomeSectionLink('news-section', -88, 'Tin tức')}
            </li>
            <li className="mh-nav-item">
              <RouterLink
                to="/kiem-tra"
                className={`mh-nav-link ${isExamPage ? 'active' : ''}`}
                aria-current={isExamPage ? 'page' : undefined}
                onClick={handleRouteNavigateClick}
              >
                Kiểm tra
              </RouterLink>
            </li>
          </ul>

          <div className="mh-nav-actions">
            <div className="mh-account-dropdown" ref={profileDropdownRef}>
              <button
                ref={profileTriggerRef}
                type="button"
                className={`mh-account-trigger ${isProfileMenuOpen ? 'is-open' : ''}`}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                aria-controls="mh-account-menu"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              >
                <UserAvatar
                  src={MemberImg}
                  alt={username || 'Thành viên'}
                  size="sm"
                  className="mh-account-avatar"
                />
                <span className="mh-account-name">
                  {username || 'Tài khoản'}
                </span>
                <svg
                  className="mh-account-chevron"
                  viewBox="0 0 20 20"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 7.5L10 12.5L15 7.5" />
                </svg>
              </button>

              <ul
                id="mh-account-menu"
                role="menu"
                aria-label="Menu tài khoản thành viên"
                className={`mh-account-menu ${isProfileMenuOpen ? 'is-open' : ''}`}
              >
                <li role="none">
                  {member != null ? (
                    <RouterLink
                      role="menuitem"
                      to={`/thong-tin-ca-nhan/${username}`}
                      className={`mh-account-item ${isProfilePage ? 'is-active' : ''}`}
                      aria-current={isProfilePage ? 'page' : undefined}
                      onClick={handleRouteNavigateClick}
                    >
                      Thông tin cá nhân
                    </RouterLink>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      className="mh-account-item"
                      onClick={handleClickNotMember}
                    >
                      Thông tin cá nhân
                    </button>
                  )}
                </li>
                <li role="none">
                  {member != null ? (
                    <RouterLink
                      role="menuitem"
                      to="/khoa-hoc-cua-ban"
                      className={`mh-account-item ${isRegisteredCoursePage ? 'is-active' : ''}`}
                      aria-current={isRegisteredCoursePage ? 'page' : undefined}
                      onClick={handleRouteNavigateClick}
                    >
                      Khoá học của bạn
                    </RouterLink>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      className="mh-account-item"
                      onClick={handleClickNotMember}
                    >
                      Khoá học của bạn
                    </button>
                  )}
                </li>
                <li role="none">
                  {member != null ? (
                    <RouterLink
                      role="menuitem"
                      to="/ho-so-thi"
                      className={`mh-account-item ${isExamDocumentPage ? 'is-active' : ''}`}
                      aria-current={isExamDocumentPage ? 'page' : undefined}
                      onClick={handleRouteNavigateClick}
                    >
                      Hồ sơ thi
                    </RouterLink>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      className="mh-account-item"
                      onClick={handleClickNotMember}
                    >
                      Hồ sơ thi
                    </button>
                  )}
                </li>
                <li role="separator" className="mh-account-divider" />
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="mh-account-item mh-account-item--danger"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default MemberHeader;
