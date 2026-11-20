import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import Icon from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { ownerAuth } from '../../services/ownerAuth';

export default function OwnerLogin() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const onEnter = () => {
    ownerAuth.login();
    navigate('/owner/dashboard');
  };

  return (
    <div className="owner-login-page">
      <a className="skip" href="#login-main">Lewati ke konten utama</a>
      <div className="owner-login-wrap" id="login-main" tabIndex={-1}>
        <div className="owner-login-card panel">
          <div className="owner-login-top">
            <Link to="/" className="brand">
              <BrandMark size={44} />
              <span className="brand-text">
                Nasi Kampus
                <small>Samarinda · Portal Pemilik</small>
              </span>
            </Link>
            <button
              type="button"
              className="nav-icon-btn owner-login-theme-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>
          </div>

          <div className="owner-login-body">
            <h1>Masuk ke Dasbor Pemilik</h1>
            <p className="muted">
              Kelola pesanan masuk, pembaruan status produksi, verifikasi DP, dan laporan usaha Nasi Kampus Samarinda.
            </p>
          </div>

          <div className="owner-login-actions">
            <button type="button" className="btn btn-primary btn-lg btn-block" onClick={onEnter}>
              Masuk ke Dasbor <Icon name="arrow" size={18} />
            </button>
            <div className="owner-login-links">
              <Link to="/owner/orders" className="link-btn">Daftar Pesanan</Link>
              <Link to="/" className="link-btn"><Icon name="back" size={15} /> Kembali ke Situs Pelanggan</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
