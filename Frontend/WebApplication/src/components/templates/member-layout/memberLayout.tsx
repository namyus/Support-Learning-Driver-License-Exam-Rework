import { useEffect, useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import MemberHeader from '../../organisms/member-header/memberHeader';
import SiteFooter from '../../organisms/site-footer/siteFooter';
import './member-layout.scss';

interface MemberLayoutProps {
  children?: ReactNode;
  headerId?: string;
  footerClassName?: string;
}

function MemberLayout({
  children,
  headerId,
  footerClassName,
}: MemberLayoutProps) {
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
    <div className="member-layout">
      <header id={headerId} className={isScrolled ? 'is-scrolled' : ''}>
        <MemberHeader />
      </header>
      <main className="body-container">{children ?? <Outlet />}</main>
      <footer className={footerClassName}>
        <SiteFooter variant="member" />
      </footer>
    </div>
  );
}

export default MemberLayout;
