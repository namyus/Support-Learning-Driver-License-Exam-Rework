import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import GuestHeader from '../../organisms/guest-header/guestHeader';
import SiteFooter from '../../organisms/site-footer/siteFooter';
import './guest-layout.scss';

function GuestLayout() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="guest-home-page">
      <header className={isScrolled ? 'is-scrolled' : ''}>
        <GuestHeader />
      </header>
      <main className="body-container">
        <Outlet />
      </main>
      <footer>
        <SiteFooter variant="guest" />
      </footer>
    </div>
  );
}

export default GuestLayout;
