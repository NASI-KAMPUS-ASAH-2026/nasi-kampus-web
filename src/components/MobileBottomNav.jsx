import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  // Hanya tampil di halaman pelanggan (tidak di dasbor pemilik atau portal login)
  if (pathname.startsWith('/owner') || pathname === '/login') return null;

  return (
    <nav className="mobile-dock" aria-label="Navigasi bawah mobile">
      <div className="mobile-dock-inner">
        <NavLink to="/" end className={({ isActive }) => `dock-item${isActive ? ' is-active' : ''}`} aria-label="Beranda">
          <Icon name="home" size={22} />
          <span className="dock-label">Beranda</span>
        </NavLink>

        <NavLink to="/menu" className={({ isActive }) => `dock-item${isActive ? ' is-active' : ''}`} aria-label="Menu & Koleksi">
          <Icon name="grid" size={22} />
          <span className="dock-label">Menu</span>
        </NavLink>

        <NavLink to="/lacak-pesanan" className={({ isActive }) => `dock-item${isActive ? ' is-active' : ''}`} aria-label="Lacak Pesanan">
          <Icon name="receipt" size={22} />
          <span className="dock-label">Lacak</span>
        </NavLink>
      </div>
    </nav>
  );
}
