import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';
import BrandMark from './BrandMark';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useScrolled } from '../hooks/useMotion';

export default function Navbar() {
  const { count } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const scrolled = useScrolled(16);
  const isHome = pathname === '/';

  return (
    <header className={`nav nav--glass${isHome ? ' nav--home' : ''}${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="container nav-in">
        {/* Kiri (Desktop) / Tengah (Mobile): Logo Resmi & Nama Brand */}
        <Link to="/" className="brand" aria-label="Nasi Kampus Samarinda, ke beranda">
          <BrandMark size={40} />
          <span className="brand-text">
            Nasi Kampus
            <small>Samarinda</small>
          </span>
        </Link>

        {/* Tengah (Desktop): Urutan Beranda -> Cara Pesan -> Menu -> Lacak Pesanan */}
        <nav id="nav-links" className="nav-pill-bar" aria-label="Navigasi utama">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-pill-link${isActive ? ' is-active' : ''}`}
          >
            Beranda
          </NavLink>
          <a href="/#cara-pesan" className="nav-pill-link">
            Cara Pesan
          </a>
          <NavLink
            to="/menu"
            className={({ isActive }) => `nav-pill-link${isActive ? ' is-active' : ''}`}
          >
            Menu
          </NavLink>
          <NavLink
            to="/lacak-pesanan"
            className={({ isActive }) => `nav-pill-link${isActive ? ' is-active' : ''}`}
          >
            Lacak Pesanan
          </NavLink>
        </nav>

        {/* Aksi Navbar: Keranjang (Kiri Atas di Mobile) & Mode Gelap/Terang */}
        <div className="nav-actions">
          <Link
            to="/cart"
            className="nav-cart-link"
            data-cart-target
            aria-label={`Keranjang belanja, ${count} kotak`}
          >
            <Icon name="cart" size={18} />
            <span className="nav-cart-label">Keranjang ({count})</span>
            {count > 0 && (
              <span className="cart-badge nav-cart-mobile-badge" key={count}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="nav-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
