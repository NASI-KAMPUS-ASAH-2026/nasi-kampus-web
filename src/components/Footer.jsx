import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import Icon from './Icon';
import { CONFIG } from '../config';

export default function Footer() {
  return (
    <footer className="footer" id="kontak">
      <div className="container footer-in">
        {/* Blok 1: Profil Brand & Kontak Resmi */}
        <div className="footer-col footer-col--brand">
          <Link to="/" className="brand brand--light" aria-label="Nasi Kampus Samarinda, ke beranda">
            <BrandMark size={48} />
            <span className="brand-text">
              Nasi Kampus
              <small>Samarinda</small>
            </span>
          </Link>
          <p className="footer-brand-desc">
            Melayani pemesanan <strong>Nasi Kotak</strong> dan <strong>Snack Box</strong> untuk kegiatan kampus, rapat kantor, seminar, dan acara keluarga di Samarinda.
          </p>

          <div className="footer-brand-contact">
            <h2 className="footer-h">Kontak Resmi</h2>
            <ul className="footer-contact">
              <li>
                <Icon name="pin" size={16} />
                <span>{CONFIG.city}</span>
              </li>
              <li>
                <Icon name="phone" size={16} />
                <a href={`https://wa.me/${CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp: {CONFIG.whatsappDisplay}
                </a>
              </li>
              <li>
                <Icon name="gmail" size={17} className="footer-contact-icon footer-contact-icon--mail" />
                <a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Blok 2: Navigasi Menu */}
        <nav className="footer-col footer-col--nav" aria-label="Navigasi halaman">
          <h2 className="footer-h">Menu &amp; Halaman</h2>
          <ul>
            <li><Link to="/">Beranda</Link></li>
            <li><Link to="/menu">Semua Menu</Link></li>
            <li><Link to="/menu?kategori=nasi-box">Paket Nasi Kotak</Link></li>
            <li><Link to="/menu?kategori=snack-box">Pilihan Snack Box</Link></li>
            <li><Link to="/cart">Keranjang Pesanan</Link></li>
          </ul>
        </nav>

        {/* Blok 3: Alur Pemesanan */}
        <div className="footer-col footer-col--flow">
          <h2 className="footer-h">Alur Pemesanan</h2>
          <p className="footer-note">
            Pilih paket di website, tentukan tanggal acara, lalu lanjutkan konfirmasi ketersediaan dan pembayaran melalui WhatsApp admin resmi kami.
          </p>
        </div>
      </div>

      <div className="container footer-copy">
        <span>© {new Date().getFullYear()} {CONFIG.brand} · {CONFIG.city}</span>
        <span>Pemesanan Online &amp; Konfirmasi WhatsApp</span>
      </div>
    </footer>
  );
}
