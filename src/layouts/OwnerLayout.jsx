import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import Icon from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { useScrollToTopOnNavigate } from './CustomerLayout';
import { ownerAuth } from '../services/ownerAuth';
import { kitchenAuth } from '../services/kitchenAuth';

const NAV = [
  { to: '/owner/dashboard', label: 'Ringkasan', icon: 'grid' },
  { to: '/owner/orders', label: 'Daftar Pesanan', icon: 'list' },
  { to: '/owner/ingredients', label: 'Master Bahan', icon: 'box' },
  { to: '/owner/purchases', label: 'Pembelian Bahan', icon: 'receipt' },
  { to: '/owner/reports', label: 'Laporan', icon: 'chart' },
];

export default function OwnerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const toggleRef = useRef(null);
  useScrollToTopOnNavigate();

  useEffect(() => {
    if (kitchenAuth.isAuthenticated() && !ownerAuth.isAuthenticated()) {
      navigate('/dapur/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    ownerAuth.logout();
    navigate('/login');
  };

  return (
    <div className="owner-shell">
      <a className="skip" href="#owner-main">Lewati ke konten dasbor</a>

      {drawerOpen && (
        <div className="owner-backdrop" aria-hidden="true" onClick={() => setDrawerOpen(false)} />
      )}

      <aside id="owner-sidebar" className={`owner-sidebar${drawerOpen ? ' is-open' : ''}`} aria-label="Navigasi dasbor pemilik">
        <div className="owner-sidebar-top">
          <Link to="/owner/dashboard" className="brand owner-brand">
            <BrandMark size={38} />
            <span className="brand-text">
              Nasi Kampus
              <small>Dasbor Pemilik</small>
            </span>
          </Link>
          <button type="button" className="owner-close-btn" onClick={() => setDrawerOpen(false)} aria-label="Tutup menu samping">
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="owner-nav" aria-label="Menu utama pemilik">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `owner-nav-link${isActive ? ' active' : ''}`}>
              <Icon name={n.icon} size={19} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="owner-sidebar-foot">
          <Link to="/" className="owner-foot-link">
            <Icon name="home" size={17} /> Lihat Situs Pelanggan
          </Link>
          <button type="button" className="owner-foot-link owner-foot-btn" onClick={() => setShowLogoutModal(true)}>
            <Icon name="logout" size={17} /> Keluar
          </button>
        </div>
      </aside>

      <div className="owner-content">
        <header className="owner-topbar">
          <div className="owner-topbar-left">
            <button ref={toggleRef} type="button" className="owner-menu-btn" onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen} aria-controls="owner-sidebar" aria-label="Buka menu navigasi pemilik">
              <Icon name="menu" size={22} />
            </button>
            <div>
              <span className="owner-topbar-title">Dasbor Pemilik · Nasi Kampus Samarinda</span>
              <span className="owner-topbar-sub">Manajemen Pesanan &amp; Pemantauan Usaha</span>
            </div>
          </div>
          <div className="owner-topbar-right">
            <button
              type="button"
              className="btn btn-outline btn-sm owner-theme-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
              <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>
          </div>
        </header>

        <main id="owner-main" className="owner-main" tabIndex={-1}>
          <div className="page-transition" key={pathname}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modal Konfirmasi Keluar */}
      {showLogoutModal && (
        <div className="kitchen-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="kitchen-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="kitchen-modal-head">
              <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="logout" size={18} /> Konfirmasi Keluar
              </h3>
              <button
                type="button"
                className="owner-close-btn"
                onClick={() => setShowLogoutModal(false)}
                aria-label="Tutup"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="kitchen-modal-body">
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                Apakah Anda yakin ingin keluar dari akun <strong>Pemilik</strong>? Anda harus masuk kembali untuk mengakses data usaha.
              </p>
            </div>
            <div className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirmLogout}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
