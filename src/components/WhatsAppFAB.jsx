import { useLocation } from 'react-router-dom';
import Icon from './Icon';
import { CONFIG } from '../config';

/**
 * Floating Action Button (FAB) WhatsApp — Standar E-Commerce F&B Indonesia.
 * Diletakkan di sudut kanan bawah (di atas bottom dock navigasi ponsel)
 * agar mudah diakses dengan satu jempol tanpa mengganggu konten.
 */
export default function WhatsAppFAB() {
  const { pathname } = useLocation();

  // Hanya tampil di halaman pelanggan (tidak di dasbor pemilik atau portal login)
  if (pathname.startsWith('/owner') || pathname === '/login') return null;

  const defaultMsg = encodeURIComponent(
    'Halo Nasi Kampus Samarinda, saya ingin tanya seputar pemesanan Nasi Kotak / Snack Box.'
  );

  return (
    <aside className="wa-fab-wrap" aria-label="Layanan WhatsApp">
      <a
        href={`https://wa.me/${CONFIG.whatsappNumber}?text=${defaultMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-fab-btn"
        aria-label="Chat WhatsApp Admin Nasi Kampus (+62 813-5097-1640)"
        title="Chat WhatsApp Admin"
      >
        <span className="wa-fab-pulse" aria-hidden="true" />
        <Icon name="whatsapp" size={28} className="wa-fab-icon" />
        <span className="wa-fab-label">Chat WA</span>
      </a>
    </aside>
  );
}
