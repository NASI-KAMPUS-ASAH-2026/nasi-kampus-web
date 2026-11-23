import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import Icon from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { useScrollToTopOnNavigate } from './CustomerLayout';
import { adminAuth } from '../services/adminAuth';
import { ADMIN_DUMMY_ORDERS } from '../data/adminDummyData';

const NAV = [
  { to: '/admin/orders', label: 'Manajemen Pesanan', icon: 'list' },
  { to: '/admin/payments', label: 'Pembayaran', icon: 'wallet' },
  { to: '/admin/customers', label: 'Data Pelanggan', icon: 'user' },
];

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [orders, setOrders] = useState(() => ADMIN_DUMMY_ORDERS.map(o => ({ ...o })));
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const toggleRef = useRef(null);
  useScrollToTopOnNavigate();

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate('/admin/login', { replace: true });
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
    adminAuth.logout();
    navigate('/login');
  };

  return (
    <div className="owner-shell">
      <a className="skip" href="#admin-main">Lewati ke konten dasbor</a>

      {drawerOpen && (
        <div className="owner-backdrop" aria-hidden="true" onClick={() => setDrawerOpen(false)} />
      )}

      <aside id="admin-sidebar" className={`owner-sidebar${drawerOpen ? ' is-open' : ''}`} aria-label="Navigasi dasbor admin">
        <div className="owner-sidebar-top">
          <Link to="/admin/orders" className="brand owner-brand">
            <BrandMark size={38} />
            <span className="brand-text">
              Nasi Kampus
              <small>Portal Admin</small>
            </span>
          </Link>
          <button type="button" className="owner-close-btn" onClick={() => setDrawerOpen(false)} aria-label="Tutup menu samping">
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="owner-nav" aria-label="Menu utama admin">
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
              aria-expanded={drawerOpen} aria-controls="admin-sidebar" aria-label="Buka menu navigasi admin">
              <Icon name="menu" size={22} />
            </button>
            <div>
              <span className="owner-topbar-title">Dasbor Admin · Nasi Kampus Samarinda</span>
              <span className="owner-topbar-sub">Manajemen Pesanan &amp; Pembayaran</span>
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

        <main id="admin-main" className="owner-main" tabIndex={-1}>
          <div className="page-transition" key={pathname}>
            <Outlet context={{ orders, setOrders }} />
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
                Apakah Anda yakin ingin keluar dari akun <strong>Admin</strong>? Anda harus masuk kembali untuk mengelola pesanan dan pembayaran.
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
