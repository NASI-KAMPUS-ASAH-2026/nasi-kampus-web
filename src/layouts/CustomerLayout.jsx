import { useEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import WhatsAppFAB from '../components/WhatsAppFAB';

/** Gulir ke atas saat pindah halaman (PUSH/REPLACE); saat Back/Forward (POP) biarkan browser memulihkan posisi. */
export function useScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  const type = useNavigationType();
  useEffect(() => {
    if (type !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, type]);
}

export default function CustomerLayout() {
  const { pathname } = useLocation();
  useScrollToTopOnNavigate();
  return (
    <div className="customer">
      <a className="skip" href="#main">Lewati ke konten</a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <div className="page-transition" key={pathname}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
      <MobileBottomNav />
    </div>
  );
}
