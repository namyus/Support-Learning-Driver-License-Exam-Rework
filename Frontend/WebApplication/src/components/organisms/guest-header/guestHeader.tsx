import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-scroll';
import { Button, Modal } from 'react-bootstrap';
import { Link as Forward, useLocation } from 'react-router-dom';
import BrandLogo from '../../atoms/brand-logo/brandLogo';
import IconButton from '../../atoms/icon-button/iconButton';
import './guest-header.scss';

function GuestHeader() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isCoursePage = location.pathname.startsWith('/khoahoc');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleOpenNoticeModal = () => {
    setIsMobileMenuOpen(false);
    setShowNoticeModal(true);
  };

  const handleCloseNoticeModal = () => {
    setShowNoticeModal(false);
  };

  const renderBellIcon = () => (
    <>
      <svg
        className="gh-nav-bell__icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span className="gh-nav-bell__badge" aria-hidden="true" />
    </>
  );

  useEffect(() => {
    const handleOpenModalEvent = () => {
      setShowNoticeModal(true);
    };

    window.addEventListener('gh-open-notice-modal', handleOpenModalEvent);
    return () => {
      window.removeEventListener('gh-open-notice-modal', handleOpenModalEvent);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMobileMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className="guest-nav-home-container">
        <nav className="gh-nav-inner" aria-label="Điều hướng chính">
          <div className="gh-nav-brand-wrap">
            {isHomePage ? (
              <Link
                to="center-introduction"
                smooth={true}
                offset={-90}
                duration={500}
                href="#center-introduction"
                className="gh-nav-brand"
                onClick={closeMobileMenu}
              >
                <BrandLogo
                  alt="Trung tâm đào tạo lái xe FDriving"
                  className="logo-home"
                />
              </Link>
            ) : (
              <Forward
                to="/"
                className="gh-nav-brand"
                onClick={closeMobileMenu}
              >
                <BrandLogo
                  alt="Trung tâm đào tạo lái xe FDriving"
                  className="logo-home"
                />
              </Forward>
            )}
          </div>

          <div className="gh-nav-mobile-controls">
            <IconButton
              className="gh-nav-bell gh-nav-bell--mobile"
              label="Chú ý"
              title="Chú ý"
              onClick={handleOpenNoticeModal}
              icon={renderBellIcon()}
            />

            <button
              ref={toggleButtonRef}
              type="button"
              className={`gh-nav-toggle ${isMobileMenuOpen ? 'is-active' : ''}`}
              aria-expanded={isMobileMenuOpen}
              aria-controls="gh-primary-nav"
              aria-label={
                isMobileMenuOpen
                  ? 'Đóng menu điều hướng'
                  : 'Mở menu điều hướng'
              }
              onClick={handleToggleMobileMenu}
            >
              <span className="gh-nav-toggle__bar" aria-hidden="true" />
              <span className="gh-nav-toggle__bar" aria-hidden="true" />
              <span className="gh-nav-toggle__bar" aria-hidden="true" />
            </button>
          </div>

          <div
            id="gh-primary-nav"
            className={`gh-nav-menu ${isMobileMenuOpen ? 'is-open' : ''}`}
          >
            <ul className="gh-nav-links">
              <li className="nav-home-items">
                {isHomePage ? (
                  <Link
                    to="center-introduction"
                    spy={true}
                    smooth={true}
                    offset={-90}
                    duration={500}
                    href="#center-introduction"
                    className="gh-nav-link"
                    onClick={closeMobileMenu}
                  >
                    Trang chủ
                  </Link>
                ) : (
                  <Forward
                    to="/"
                    className="gh-nav-link"
                    onClick={closeMobileMenu}
                  >
                    Trang chủ
                  </Forward>
                )}
              </li>
              <li className="nav-home-items">
                {isHomePage ? (
                  <Link
                    to="course-section"
                    spy={true}
                    smooth={true}
                    offset={-88}
                    duration={500}
                    href="#course-section"
                    className="gh-nav-link"
                    onClick={closeMobileMenu}
                  >
                    Khóa học
                  </Link>
                ) : (
                  <Forward
                    to="/#course-section"
                    className={`gh-nav-link ${isCoursePage ? 'active' : ''}`}
                    aria-current={isCoursePage ? 'page' : undefined}
                    onClick={closeMobileMenu}
                  >
                    Khóa học
                  </Forward>
                )}
              </li>
              <li className="nav-home-items">
                {isHomePage ? (
                  <Link
                    to="center-consultation"
                    spy={true}
                    smooth={true}
                    offset={-88}
                    duration={500}
                    href="#center-consultation"
                    className="gh-nav-link"
                    onClick={closeMobileMenu}
                  >
                    Tư vấn
                  </Link>
                ) : (
                  <Forward
                    to="/#center-consultation"
                    className="gh-nav-link"
                    onClick={closeMobileMenu}
                  >
                    Tư vấn
                  </Forward>
                )}
              </li>
              <li className="nav-home-items">
                {isHomePage ? (
                  <Link
                    to="news-section"
                    spy={true}
                    smooth={true}
                    offset={-88}
                    duration={500}
                    href="#news-section"
                    className="gh-nav-link"
                    onClick={closeMobileMenu}
                  >
                    Tin tức
                  </Link>
                ) : (
                  <Forward
                    to="/#news-section"
                    className="gh-nav-link"
                    onClick={closeMobileMenu}
                  >
                    Tin tức
                  </Forward>
                )}
              </li>
            </ul>

            <div className="gh-nav-actions">
              <IconButton
                className="gh-nav-bell gh-nav-bell--desktop"
                label="Chú ý"
                title="Chú ý"
                onClick={handleOpenNoticeModal}
                icon={renderBellIcon()}
              />
              <Forward
                to="/dang-nhap"
                className="gh-nav-btn gh-nav-btn--ghost"
                onClick={closeMobileMenu}
              >
                Đăng nhập
              </Forward>
              <Forward
                to="/dang-ky"
                className="gh-nav-btn gh-nav-btn--primary"
                onClick={closeMobileMenu}
              >
                Đăng ký
              </Forward>
            </div>
          </div>
        </nav>
      </div>

      <Modal
        show={showNoticeModal}
        onHide={handleCloseNoticeModal}
        keyboard={true}
        backdrop="static"
        backdropClassName="backdrop"
        dialogClassName="gh-notice-modal"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="gh-notice-modal__title">Chú ý</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-content">
            <p className="gh-notice-modal__body">
              Hiện tại dữ liệu của web vẫn chưa hoàn thiện 100% và nghiệp vụ mà
              đội ngũ phát triển hướng tới vẫn chưa đúng với nghiệp vụ thực tế.
              Vì vậy, để tránh những rắc rối không đáng có, chúng tôi khuyến
              khích bạn hãy liên hệ với một trong các thành viên của đội ngũ
              phát triển để được hỗ trợ tốt nhất. Xin cảm ơn!
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="gh-notice-modal__close"
            onClick={handleCloseNoticeModal}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default GuestHeader;
