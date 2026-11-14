import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scroller } from 'react-scroll'
import HomeTemplate from '../../templates/guest-home-template/home-template'

function GuestHomePage() {
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) {
            window.scrollTo({ top: 0, behavior: 'instant' });
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
                    offset: targetId === 'center-introduction' ? -90 : -88,
                    duration: 500,
                });
            }
        }, 60);

        return () => {
            window.clearTimeout(scrollTimer);
        };
    }, [location.pathname, location.hash]);

    return (
        <>
            <HomeTemplate />
        </>
    )
}

export default GuestHomePage