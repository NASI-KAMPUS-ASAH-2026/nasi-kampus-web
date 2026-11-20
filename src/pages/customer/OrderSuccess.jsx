import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BlockSkeleton, EmptyState, ErrorState } from '../../components/States';
import Icon from '../../components/Icon';
import { StatusBadge } from '../../components/ui/Badges';
import { useToast } from '../../components/ui/Toast';
import { useAsync } from '../../hooks/useAsync';
import { getOrder } from '../../services/api';
import { CONFIG } from '../../config';
import { formatDate, formatDateTime, rupiah } from '../../utils/format';
import { buildOrderMessage, buildWhatsAppUrl } from '../../utils/whatsapp';

export default function OrderSuccess() {
  const { id } = useParams();
  const { data: o, loading, error, reload } = useAsync(() => getOrder(id), [id]);
  const { show } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (loading) return <div className="container page"><BlockSkeleton h={420} label="Memuat ringkasan pesanan" /></div>;
  if (error) return <div className="container page"><ErrorState title="Ringkasan pesanan gagal dimuat" onRetry={reload} /></div>;
  if (!o) {
    return (
      <div className="container page">
        <EmptyState
          icon="receipt"
          title="Pesanan tidak ditemukan"
          text="Kode pesanan yang Anda cari tidak tersedia atau tidak ditemukan di perangkat ini."
          action={{ to: '/menu', label: 'Buat Pesanan Baru' }}
          secondary={{ to: '/', label: 'Kembali ke Beranda' }}
        />
      </div>
    );
  }

  const msg = buildOrderMessage(o);
  const waUrl = buildWhatsAppUrl(msg);
  const totalPortions = o.lines.reduce((s, l) => s + l.qty, 0);

  const copyText = async (text, label, setFlag) => {
    try {
      await navigator.clipboard.writeText(text);
      setFlag(true);
      show(`${label} disalin ke papan klip.`);
      setTimeout(() => setFlag(false), 2000);
    } catch {
      show('Gagal menyalin otomatis. Silakan salin manual dari kotak pratinjau.', { tone: 'error' });
    }
  };

  return (
    <div className="container page success-page">
      <div className="success-wrap">
        <div className="panel success-card">
          <div className="success-head">
            <span className="success-check" aria-hidden="true">
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="24" fill="none" />
                <path d="M15 27l7 7 15-15" fill="none" />
              </svg>
            </span>
            <div className="success-badges">
              <StatusBadge status={o.status} />
            </div>
            <h1 className="page-title">Rincian Pesanan Siap Dikonfirmasi</h1>
            <p className="muted">
              Simpan kode referensi di bawah, lalu lanjutkan konfirmasi ketersediaan dan pembayaran kepada admin lewat WhatsApp.
            </p>
          </div>

          <div className="order-code-box" role="region" aria-label="Kode referensi pesanan">
            <div>
              <span className="code-label">Kode Referensi Pesanan</span>
              <strong className="code-value">{o.id}</strong>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => copyText(o.id, 'Kode pesanan', setCopiedId)}>
              <Icon name={copiedId ? 'check' : 'copy'} size={16} /> {copiedId ? 'Tersalin' : 'Salin Kode'}
            </button>
          </div>

          <div className="success-section">
            <h2>Ringkasan Pesanan</h2>
            <dl className="sum-list">
              <div className="sum-row"><dt>Tanggal dibutuhkan</dt><dd>{formatDate(o.orderDate)}</dd></div>
              {o.createdAt && <div className="sum-row"><dt>Waktu dibuat</dt><dd>{formatDateTime(o.createdAt)}</dd></div>}
              <div className="sum-row"><dt>Total kotak</dt><dd>{totalPortions} kotak</dd></div>
            </dl>

            <ul className="order-lines" aria-label="Daftar item pesanan">
              {o.lines.map((l) => {
                const key = l.productId || l.id;
                const unit = l.unitPrice ?? l.price ?? 0;
                return (
                  <li key={key}>
                    <div>
                      <strong>{l.qty} × {l.name}</strong>
                      <span>{rupiah(unit)} / kotak</span>
                    </div>
                    <strong>{rupiah(unit * l.qty)}</strong>
                  </li>
                );
              })}
            </ul>

            <div className="sum-row sum-total">
              <span>Estimasi total pesanan</span>
              <strong>{rupiah(o.total)}</strong>
            </div>
            {o.notes && (
              <div className="order-note">
                <strong>Catatan pesanan:</strong> {o.notes}
              </div>
            )}
          </div>

          <div className="success-section wa-box">
            <div className="wa-box-head">
              <div>
                <h2>Langkah Berikutnya: Konfirmasi WhatsApp Admin</h2>
                <p className="muted">
                  Kirimkan pesan pratinjau berikut ke WhatsApp resmi kami (<strong>{CONFIG.whatsappDisplay}</strong>) atau email <strong>{CONFIG.email}</strong> untuk konfirmasi ketersediaan dan pembayaran (DP / lunas).
                </p>
              </div>
            </div>

            <div className="wa-preview">
              <div className="wa-preview-bar">
                <span><Icon name="chat" size={16} /> Pratinjau pesan otomatis untuk admin</span>
                <button type="button" className="link-btn" onClick={() => copyText(msg, 'Pesan WhatsApp', setCopied)}>
                  <Icon name={copied ? 'check' : 'copy'} size={15} /> {copied ? 'Pesan tersalin' : 'Salin teks pesan'}
                </button>
              </div>
              <pre className="wa-preview-text">{msg}</pre>
            </div>

            {waUrl ? (
              <a className="btn btn-primary btn-lg btn-block" href={waUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="chat" size={20} /> Kirim Konfirmasi ke WhatsApp ({CONFIG.whatsappDisplay}) <Icon name="external" size={16} />
              </a>
            ) : (
              <div className="wa-disabled-wrap">
                <button type="button" className="btn btn-primary btn-lg btn-block" disabled aria-disabled="true">
                  <Icon name="chat" size={20} /> Nomor WhatsApp Admin Belum Dikonfigurasi
                </button>
              </div>
            )}

            <Link to={`/lacak-pesanan?kode=${o.id}`} className="btn btn-outline btn-lg btn-block tracking-direct-btn">
              <Icon name="search" size={18} /> Pantau Status Pesanan Ini
            </Link>
          </div>

          <div className="success-actions">
            <Link className="btn btn-outline" to="/menu"><Icon name="plus" size={16} /> Buat Pesanan Lain</Link>
            <Link className="btn btn-ghost" to="/">Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
