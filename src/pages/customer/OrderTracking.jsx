import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { StatusBadge, Alert } from '../../components/ui/Badges';
import { BlockSkeleton, EmptyState } from '../../components/States';
import { useToast } from '../../components/ui/Toast';
import { trackOrder, getOrder, getLastOrderId } from '../../services/api';
import { TRACKING_STEPS, statusMeta } from '../../data/orderStatus';
import { formatDate, formatDateTime, rupiah } from '../../utils/format';
import { CONFIG } from '../../config';

export default function OrderTracking() {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get('kode') || params.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { show } = useToast();
  const lastId = getLastOrderId();

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    } else if (lastId) {
      // Auto-load last order placed on this device
      handleSearch(lastId);
    }
  }, [initialQuery]);

  async function handleSearch(searchTerm) {
    const term = (searchTerm || query).trim();
    if (!term) return;
    setLoading(true);
    setSearched(true);
    try {
      const results = await trackOrder(term);
      setOrders(results);
      if (results.length === 1) {
        setSelectedOrder(results[0]);
      } else if (results.length > 1) {
        // If exact match exists, pick it
        const exact = results.find((o) => o.id.toUpperCase() === term.toUpperCase());
        setSelectedOrder(exact || results[0]);
      } else {
        setSelectedOrder(null);
      }
    } catch {
      setOrders([]);
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const next = new URLSearchParams(params);
    next.set('kode', query.trim());
    setParams(next, { replace: true });
    handleSearch(query.trim());
  }

  const copyTrackingLink = async () => {
    if (!selectedOrder) return;
    const url = `${window.location.origin}/lacak-pesanan?kode=${selectedOrder.id}`;
    try {
      await navigator.clipboard.writeText(url);
      show('Tautan pelacakan berhasil disalin ke papan klip.');
    } catch {
      show(url, { tone: 'info' });
    }
  };

  const o = selectedOrder;
  const currentMeta = o ? statusMeta(o.status) : null;
  const currentStep = currentMeta ? currentMeta.step : 1;
  const isCancelled = o && o.status === 'Dibatalkan';

  return (
    <div className="container page tracking-page">
      <header className="page-head tracking-page-head">
        <div>
          <span className="eyebrow eyebrow--light">
            <span className="dot" /> Monitoring Pesanan
          </span>
          <h1 className="page-title">
            Lacak Status <em>Pesanan</em>
          </h1>
          <p className="muted">
            Pantau perkembangan pesanan katering Anda secara berkala mulai dari konfirmasi DP, proses masak di dapur, hingga siap dijemput di outlet Nasi Kampus Samarinda.
          </p>
        </div>
      </header>

      {/* Form Pencarian Kode Pesanan / No. WhatsApp */}
      <section className="panel tracking-search-box" aria-label="Form pencarian pesanan">
        <form onSubmit={onSubmit} className="tracking-search-form">
          <div className="search tracking-input-wrap">
            <Icon name="search" size={18} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kode NK-... / No. WA"
              aria-label="Cari kode pesanan atau nomor WhatsApp"
            />
            {query && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setQuery('')}
                aria-label="Hapus teks"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
            {loading ? <Icon name="loader" size={18} className="spin" /> : <Icon name="search" size={18} />}
            <span>Lacak Pesanan</span>
          </button>
        </form>

        {lastId && (!o || o.id !== lastId) && (
          <div className="tracking-quick-bar">
            <span>Pesanan terakhir di perangkat ini:</span>
            <button
              type="button"
              className="tracking-quick-btn"
              onClick={() => {
                setQuery(lastId);
                const next = new URLSearchParams(params);
                next.set('kode', lastId);
                setParams(next, { replace: true });
                handleSearch(lastId);
              }}
            >
              <strong>{lastId}</strong>
            </button>
          </div>
        )}
      </section>

      {/* Multiple Orders Found List */}
      {orders.length > 1 && (
        <section className="panel tracking-multilist" aria-label="Pilihan pesanan ditemukan">
          <h2 className="tracking-multilist-title">Ditemukan {orders.length} Pesanan Terkait:</h2>
          <div className="tracking-multilist-grid">
            {orders.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tracking-multi-item${o?.id === item.id ? ' is-selected' : ''}`}
                onClick={() => setSelectedOrder(item)}
              >
                <div className="multi-item-top">
                  <strong>{item.id}</strong>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="multi-item-sub">
                  <span>{formatDate(item.orderDate)}</span>
                  <span>{rupiah(item.total)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {loading && <BlockSkeleton h={380} label="Mencari data pesanan…" />}

      {/* Hasil Pelacakan Pesanan */}
      {!loading && o && (
        <article className="panel tracking-card" aria-label={`Rincian status pesanan ${o.id}`}>
          {/* Header Card Pesanan */}
          <div className="tracking-head">
            <div className="tracking-id-block">
              <span className="tracking-id-label">Kode Pesanan</span>
              <div className="tracking-id-row">
                <h2 className="tracking-id-val">{o.id}</h2>
                <button
                  type="button"
                  className="tracking-copy-btn"
                  onClick={copyTrackingLink}
                  title="Salin tautan pelacakan"
                  aria-label="Salin tautan pelacakan"
                >
                  <Icon name="copy" size={16} />
                  <span>Salin Tautan</span>
                </button>
              </div>
            </div>

            <div className="tracking-badge-block">
              <StatusBadge status={o.status} />
              <span className="tracking-created-at">Dibuat: {formatDateTime(o.createdAt)}</span>
            </div>
          </div>

          {/* Stepper Timeline Visual */}
          {isCancelled ? (
            <Alert tone="error" title="Pesanan Dibatalkan" className="tracking-cancelled-alert">
              Pesanan ini telah berstatus dibatalkan berdasarkan kesepakatan bersama melalui WhatsApp. Silakan hubungi admin jika terdapat kekeliruan.
            </Alert>
          ) : (
            <div className="tracking-stepper-wrap" role="region" aria-label="Tahapan status pesanan">
              <ol className="tracking-stepper">
                {TRACKING_STEPS.map((step) => {
                  const isDone = currentStep > step.step;
                  const isCurrent = currentStep === step.step;
                  return (
                    <li
                      key={step.key}
                      className={`stepper-node${isDone ? ' is-done' : ''}${isCurrent ? ' is-current' : ''}`}
                    >
                      <div className="stepper-marker" aria-hidden="true">
                        {isDone ? <Icon name="check" size={14} /> : <span>{step.step}</span>}
                      </div>
                      <div className="stepper-content">
                        <strong className="stepper-title">{step.id}</strong>
                        <span className="stepper-desc">{step.short}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Keterangan Status Terkini */}
          <div className="tracking-current-status-banner">
            <div className="status-banner-icon" aria-hidden="true">
              <Icon name={currentMeta?.tone === 'success' ? 'check' : 'info'} size={22} />
            </div>
            <div className="status-banner-text">
              <strong>Status Terkini: {currentMeta?.id}</strong>
              <p>{currentMeta?.description}</p>
            </div>
          </div>

          {/* Rincian Pengambilan & Pembayaran DP */}
          <div className="tracking-info-grid">
            <div className="tracking-info-col">
              <h3>Metode Pengambilan</h3>
              <dl className="tracking-dl">
                <div>
                  <dt>Sistem</dt>
                  <dd>
                    <strong>Ambil Sendiri di Outlet (Jemputan)</strong>
                  </dd>
                </div>
                <div>
                  <dt>Lokasi Pengambilan</dt>
                  <dd>Dapur &amp; Outlet Nasi Kampus Samarinda, Kalimantan Timur</dd>
                </div>
                <div>
                  <dt>Tanggal Dibutuhkan</dt>
                  <dd>
                    <strong>{formatDate(o.orderDate)}</strong>
                  </dd>
                </div>
                {o.notes && (
                  <div>
                    <dt>Catatan Pemesan</dt>
                    <dd>{o.notes}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="tracking-info-col">
              <h3>Status Negosiasi &amp; DP</h3>
              <dl className="tracking-dl">
                <div>
                  <dt>Pembayaran DP</dt>
                  <dd>
                    {o.dpAmount ? (
                      <span className="dp-verified-badge">
                        <Icon name="check" size={14} /> DP Terverifikasi: {rupiah(o.dpAmount)}
                      </span>
                    ) : (
                      <span className="dp-pending-text">
                        Menunggu kesepakatan DP di WhatsApp (biasanya 30–50%)
                      </span>
                    )}
                  </dd>
                </div>
                {o.dpNotes && (
                  <div>
                    <dt>Catatan Admin</dt>
                    <dd>{o.dpNotes}</dd>
                  </div>
                )}
                <div>
                  <dt>Estimasi Total</dt>
                  <dd>
                    <strong className="tracking-total-price">{rupiah(o.total)}</strong>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Rincian Menu Paket */}
          <div className="tracking-items-section">
            <h3>Rincian Menu ({o.lines?.reduce((s, l) => s + l.qty, 0)} Kotak)</h3>
            <ul className="tracking-lines-list">
              {(o.lines || []).map((l, idx) => (
                <li key={l.productId || idx} className="tracking-line-item">
                  <div className="line-item-main">
                    <strong>{l.name}</strong>
                    <span className="line-item-unit">{rupiah(l.unitPrice)} / kotak</span>
                  </div>
                  <div className="line-item-right">
                    <span className="line-item-qty">{l.qty} porsi</span>
                    <strong className="line-item-subtotal">{rupiah(l.unitPrice * l.qty)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Tombol Kontak WhatsApp untuk Pesanan Ini */}
          <div className="tracking-actions-foot">
            <a
              href={`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
                `Halo Admin Nasi Kampus Samarinda, saya ingin tanya progres pesanan saya dengan kode ${o.id} (${o.customer?.name || 'Pelanggan'}).`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
            >
              <Icon name="whatsapp" size={20} />
              <span>Konfirmasi / Tanya Admin di WhatsApp</span>
            </a>
            <Link to="/menu" className="btn btn-outline">
              <Icon name="plus" size={16} /> Buat Pesanan Baru
            </Link>
          </div>
        </article>
      )}

      {/* State Tidak Ditemukan */}
      {!loading && searched && !o && (
        <EmptyState
          icon="search"
          title="Pesanan Tidak Ditemukan"
          text={`Tidak ada pesanan yang sesuai dengan kata pencarian "${query}". Pastikan kode pesanan sudah sesuai seperti pada format NK-YYYYMM-XXXX atau nomor WhatsApp yang Anda gunakan saat memesan.`}
          action={{
            label: 'Coba Lagi',
            onClick: () => {
              setQuery('');
              setSearched(false);
            },
          }}
          secondary={{ to: '/menu', label: 'Jelajahi Menu' }}
        />
      )}
    </div>
  );
}
