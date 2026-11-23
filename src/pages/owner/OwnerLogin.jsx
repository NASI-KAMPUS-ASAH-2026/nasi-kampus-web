import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import Icon from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { ownerAuth } from '../../services/ownerAuth';
import { kitchenAuth } from '../../services/kitchenAuth';
import { adminAuth } from '../../services/adminAuth';

export default function OwnerLogin({ defaultRole = 'admin' }) {
  const [role, setRole] = useState(defaultRole);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Silakan masukkan password.');
      return;
    }

    if (role === 'kitchen') {
      kitchenAuth.login();
      navigate('/dapur/dashboard');
    } else if (role === 'owner') {
      ownerAuth.login();
      navigate('/owner/dashboard');
    } else {
      adminAuth.login();
      navigate('/admin/orders');
    }
  };

  return (
    <div className="unified-login-page">
      <a className="skip" href="#unified-login-card">Lewati ke form login</a>

      <div className="unified-login-card" id="unified-login-card" tabIndex={-1}>
        {/* Aksen Lengkung dan Header Visual */}
        <div className="unified-login-hero">
          {/* SVG Aksen Lengkung */}
          <div className="unified-curve-wrap" aria-hidden="true">
            <svg
              className="unified-curve-svg"
              viewBox="0 0 500 160"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 L500,0 L500,90 C350,165 150,165 0,90 Z"
                fill="url(#unifiedGrad)"
              />
              <defs>
                <linearGradient id="unifiedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#991b1b" />
                  <stop offset="50%" stopColor="#b91c1c" />
                  <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Tombol Tema (Terang / Gelap) */}
          <button
            type="button"
            className="unified-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>

          {/* Logo Nasi Kampus langsung tanpa shape lingkaran putih, berukuran besar */}
          <div className="unified-direct-logo-wrap">
            <BrandMark size={165} />
          </div>
        </div>

        {/* Konten Form */}
        <div className="unified-login-content">
          <div className="unified-intro">
            <h1 className="unified-title">Selamat Datang</h1>
            <p className="unified-desc">Masuk ke portal pengelolaan Nasi Kampus Samarinda.</p>
          </div>

          <form onSubmit={handleLogin} className="unified-form" noValidate>
            {/* Pilihan Role (Dropdown) */}
            <div className="unified-field">
              <label htmlFor="role-select" className="unified-label">
                Masuk sebagai
              </label>
              <div className="unified-select-wrap">
                <select
                  id="role-select"
                  className="unified-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="owner">Pemilik</option>
                  <option value="kitchen">Tim Dapur</option>
                </select>
                <Icon name="chevronDown" size={18} className="unified-select-arrow" />
              </div>
            </div>

            {/* Kolom Password */}
            <div className="unified-field">
              <label htmlFor="password-input" className="unified-label">
                Password
              </label>
              <div className="unified-input-wrap">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className={`unified-input${error ? ' has-error' : ''}`}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="unified-pw-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
              {error && <span className="unified-error-msg">{error}</span>}
            </div>

            {/* Tombol Login */}
            <button type="submit" className="btn btn-primary btn-block btn-lg unified-submit-btn">
              Masuk <Icon name="arrow" size={18} />
            </button>
          </form>

          {/* Kembali ke Situs Pelanggan */}
          <div className="unified-back-wrap">
            <Link to="/" className="unified-back-link">
              ← Kembali ke Situs Pelanggan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
