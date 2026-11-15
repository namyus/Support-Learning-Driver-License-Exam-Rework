import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import GuestFooter from './components/organisms/guest-footer/guest-footer';
import GuestHeaderHome from './components/organisms/guest-header-home/guest-header-home';

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
        <div className='guest-home-page'>
            <header className={isScrolled ? 'is-scrolled' : ''}>
                <GuestHeaderHome />
            </header>
            <main className='body-container'>
                <Outlet />
            </main>
            <footer>
                <GuestFooter />
            </footer>
        </div>
    );
}

export default GuestLayout;
