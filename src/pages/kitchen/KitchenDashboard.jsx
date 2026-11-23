import { useEffect, useState } from 'react';
import Icon from '../../components/Icon';
import { BlockSkeleton, EmptyState, ErrorState } from '../../components/States';
import { StatusBadge, Alert } from '../../components/ui/Badges';
import { useToast } from '../../components/ui/Toast';
import { useAsync } from '../../hooks/useAsync';
import { getKitchenOrders, getKitchenSummary, updateKitchenStatus } from '../../services/api';
import { statusMeta } from '../../data/orderStatus';
import { formatDate, formatDateShort, formatDateTime, number, todayISO } from '../../utils/format';

export default function KitchenDashboard() {
  const { show } = useToast();
  const today = todayISO();

  const [statusFilter, setStatusFilter] = useState('active');
  const [q, setQ] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Ambil data ringkasan KPI dapur
  const {
    data: summary,
    loading: summaryLoading,
    reload: reloadSummary,
  } = useAsync(() => getKitchenSummary(), []);

  // Ambil daftar tiket pesanan dapur (otomatis terurut prioritas jadwal dibutuhkan terdekat)
  const {
    data: orders,
    loading: ordersLoading,
    error: ordersError,
    reload: reloadOrders,
  } = useAsync(
    () => getKitchenOrders({ q, status: statusFilter, date: dateFilter }),
    [q, statusFilter, dateFilter]
  );

  // Sinkronisasi otomatis saat ada event pembaruan pesanan
  useEffect(() => {
    const handleOrdersUpdated = () => {
      reloadSummary();
      reloadOrders();
    };
    window.addEventListener('nk_orders_updated', handleOrdersUpdated);
    return () => window.removeEventListener('nk_orders_updated', handleOrdersUpdated);
  }, [reloadSummary, reloadOrders]);

  // Keyboard shortcut ESC untuk menutup modal rincian
  useEffect(() => {
    if (!selectedOrder) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedOrder(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedOrder]);

  // Handler pembaruan status khusus dapur
  const handleUpdateStatus = async (orderId, nextStatus) => {
    setProcessingId(orderId);
    try {
      const updated = await updateKitchenStatus(orderId, nextStatus);
      show(`Status pesanan ${orderId} berhasil diubah ke "${nextStatus}".`, { tone: 'success' });
      reloadSummary();
      reloadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      show(err?.message || 'Gagal memperbarui status.', { tone: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const resetFilters = () => {
    setQ('');
    setStatusFilter('active');
    setDateFilter('');
  };

  const hasFilter = q.trim() || statusFilter !== 'active' || dateFilter;
  const list = orders || [];

  return (
    <div className="owner-page">
      {/* Header Halaman Sederhana & Bersih */}
      <header className="kitchen-head">
        <h1>Antrean &amp; Produksi Dapur</h1>
        <p>
          Pantau dan proses pesanan yang telah dikonfirmasi Admin berdasarkan prioritas jadwal kebutuhan.
        </p>
      </header>

      {/* Tiga Kartu Statistik Ringkas */}
      <section className="kitchen-kpi-grid" aria-label="Statistik antrean dapur">
        <article className="kitchen-kpi-card">
          <div className="kitchen-kpi-top">
            <span>Perlu Dimasak</span>
            <span className="kpi-ic kpi-ic--warn"><Icon name="clock" size={17} /></span>
          </div>
          <strong className="kitchen-kpi-val">{summaryLoading ? '…' : number(summary?.waitingQueue)}</strong>
          <span className="kitchen-kpi-sub">DP Terverifikasi · Siap dimasak</span>
        </article>

        <article className="kitchen-kpi-card">
          <div className="kitchen-kpi-top">
            <span>Sedang Dipersiapkan</span>
            <span className="kpi-ic kpi-ic--orange"><Icon name="flame" size={17} /></span>
          </div>
          <strong className="kitchen-kpi-val">{summaryLoading ? '…' : number(summary?.cooking)}</strong>
          <span className="kitchen-kpi-sub">Sedang diolah &amp; dimasak tim dapur</span>
        </article>

        <article className="kitchen-kpi-card">
          <div className="kitchen-kpi-top">
            <span>Menunggu Jemputan</span>
            <span className="kpi-ic kpi-ic--ok"><Icon name="check" size={17} /></span>
          </div>
          <strong className="kitchen-kpi-val">{summaryLoading ? '…' : number(summary?.waitingPickup)}</strong>
          <span className="kitchen-kpi-sub">Selesai dikemas · Siap diambil di outlet</span>
        </article>
      </section>

      {/* Area Filter yang Terstruktur & Rapi */}
      <section className="kitchen-filter-panel" aria-label="Filter tiket dapur">
        <div className="kitchen-filter-row">
          <div className="search kitchen-search-box">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari kode pesanan, nama pelanggan, atau menu…"
              aria-label="Cari kode pesanan, nama pelanggan, atau menu"
            />
            {q && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setQ('')}
                aria-label="Bersihkan pencarian"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          {/* Dropdown Status Antrean Dapur */}
          <div className="filter-select-wrap" style={{ minWidth: 210 }}>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status pesanan dapur"
            >
              <option value="active">Semua Antrean Dapur</option>
              <option value="DP Diterima & Masuk Antrean">Perlu Dimasak</option>
              <option value="Sedang Dipersiapkan">Sedang Dipersiapkan</option>
              <option value="Menunggu Jemputan">Menunggu Jemputan</option>
              <option value="Selesai">Riwayat Selesai</option>
            </select>
            <span className="filter-select-icon" aria-hidden="true">
              <Icon name="chevronDown" size={16} />
            </span>
          </div>

          <div className="kitchen-date-box">
            <input
              type="date"
              className="kitchen-date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter berdasarkan jadwal dibutuhkan"
              title="Filter tanggal pesanan dibutuhkan"
            />
          </div>

          {hasFilter && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={resetFilters}
              title="Atur ulang seluruh filter"
            >
              Atur Ulang
            </button>
          )}
        </div>
      </section>

      {/* Header Bagian Antrean & Ringkasan Total Porsi */}
      <div className="kitchen-section-head">
        <h2>
          <Icon name="flame" size={19} />
          <span>Antrean Pesanan Dapur</span>
        </h2>
        <span className="kitchen-porsi-badge">
          <Icon name="rice" size={15} />
          Total <strong>{summaryLoading ? '…' : number(summary?.totalPortions)} Porsi</strong> Aktif
        </span>
      </div>

      {/* Konten Loading & Error States */}
      {ordersLoading && <BlockSkeleton h={340} label="Memuat tiket antrean dapur…" />}
      {ordersError && <ErrorState title="Gagal memuat tiket dapur" onRetry={reloadOrders} />}

      {/* Empty State */}
      {!ordersLoading && !ordersError && list.length === 0 && (
        <EmptyState
          icon="flame"
          title="Tidak ada tiket antrean dapur"
          text={
            hasFilter
              ? 'Tidak ditemukan pesanan dapur yang cocok dengan kata kunci atau filter tanggal.'
              : 'Semua pesanan yang telah dikonfirmasi Admin telah selesai diproses atau belum ada antrean baru yang masuk.'
          }
          action={undefined}
        />
      )}

      {/* ====================================================================
          SATU-SATUNYA TAMPILAN: TIKET DAPUR (KITCHEN CARDS GRID)
          Terurut otomatis berdasarkan jadwal dibutuhkan terdekat
          ==================================================================== */}
      {!ordersLoading && !ordersError && list.length > 0 && (
        <div className="kitchen-cards-grid">
          {list.map((o) => {
            const isToday = o.orderDate === today;
            const totalPortions = (o.lines || []).reduce((s, l) => s + (l.qty || 0), 0);
            const isProcessing = processingId === o.id;
            const currentStatus = statusMeta(o.status).id;

            return (
              <article key={o.id} className="kitchen-card">
                <div>
                  {/* Bagian Header Kartu: Kode Pesanan */}
                  <div className="kitchen-card-top">
                    <span className="kitchen-card-code">{o.id}</span>
                  </div>

                  {/* Nama Pelanggan */}
                  <div className="kitchen-card-customer">
                    <Icon name="user" size={15} />
                    <span>{o.customerAlias || o.customer?.name || 'Pelanggan Nasi Kampus'}</span>
                  </div>

                  {/* Jadwal Dibutuhkan (Prioritas Utama Operasional) */}
                  <div className="kitchen-card-schedule">
                    <div className="kitchen-schedule-info">
                      <div className="kitchen-schedule-date">
                        <Icon name="calendar" size={16} />
                        <span>{formatDateShort(o.orderDate)}</span>
                      </div>
                      <span className="kitchen-schedule-sub">Jadwal pesanan dibutuhkan</span>
                    </div>
                    {isToday && (
                      <span className="kitchen-badge-today">🔥 HARI INI</span>
                    )}
                  </div>

                  {/* Daftar Menu & Jumlah Porsi */}
                  <div className="kitchen-menu-box">
                    {(o.lines || []).map((l, idx) => (
                      <div key={idx} className="kitchen-menu-item">
                        <span className="kitchen-menu-name" title={l.name}>{l.name}</span>
                        <span className="kitchen-menu-qty">{l.qty} porsi</span>
                      </div>
                    ))}
                    <div className="kitchen-menu-total-row">
                      <span>Total Porsi</span>
                      <span className="kitchen-menu-total-val">{totalPortions} Porsi</span>
                    </div>
                  </div>

                  {/* Catatan Khusus Pelanggan (HANYA dirender jika ada catatan) */}
                  {Boolean(o.notes && o.notes.trim()) && (
                    <div className="kitchen-card-notes">
                      <Alert tone="warning" icon="alert">
                        <strong>Catatan:</strong> {o.notes}
                      </Alert>
                    </div>
                  )}
                </div>

                {/* Footer Kartu: Tombol Aksi Sesuai Status & Rincian Pesanan */}
                <div className="kitchen-card-actions">
                  {currentStatus === 'DP Diterima & Masuk Antrean' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-block btn-kitchen-main"
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(o.id, 'Sedang Dipersiapkan')}
                      title="Mulai memasak pesanan ini"
                    >
                      <Icon name="flame" size={16} />
                      <span>{isProcessing ? 'Memperbarui…' : 'Mulai Masak'}</span>
                    </button>
                  )}

                  {currentStatus === 'Sedang Dipersiapkan' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-block btn-kitchen-main"
                      style={{ background: 'var(--color-orange)', borderColor: 'var(--color-orange)' }}
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(o.id, 'Menunggu Jemputan')}
                      title="Tandai pesanan selesai dimasak dan siap diambil"
                    >
                      <Icon name="check" size={16} />
                      <span>{isProcessing ? 'Memperbarui…' : 'Siap Dijemput'}</span>
                    </button>
                  )}

                  {currentStatus === 'Menunggu Jemputan' && (
                    <div className="kitchen-status-text">
                      <Icon name="check" size={15} />
                      <span>Siap Dijemput (Menunggu Pengambilan)</span>
                    </div>
                  )}

                  {currentStatus === 'Selesai' && (
                    <div className="kitchen-status-text" style={{ color: 'var(--color-success)' }}>
                      <Icon name="check" size={15} />
                      <span>Pesanan Selesai Diambil</span>
                    </div>
                  )}

                  {/* Tombol Rincian Pesanan */}
                  <button
                    type="button"
                    className="btn btn-outline btn-block btn-kitchen-secondary"
                    onClick={() => setSelectedOrder(o)}
                    title="Buka rincian lengkap pesanan"
                  >
                    <Icon name="eye" size={15} />
                    <span>Rincian Pesanan</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ====================================================================
          MODAL RINCIAN PESANAN LENGKAP
          ==================================================================== */}
      {selectedOrder && (
        <div
          className="kitchen-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kitchen-modal-title"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="kitchen-modal" onClick={(e) => e.stopPropagation()}>
            <header className="kitchen-modal-head">
              <div>
                <h2 id="kitchen-modal-title">Rincian Pesanan {selectedOrder.id}</h2>
                <span className="muted" style={{ fontSize: '0.8rem' }}>
                  Waktu Pemesanan: {formatDateTime(selectedOrder.createdAt)}
                </span>
              </div>
              <button
                type="button"
                className="owner-close-btn"
                onClick={() => setSelectedOrder(null)}
                aria-label="Tutup rincian pesanan"
              >
                <Icon name="close" size={20} />
              </button>
            </header>

            <div className="kitchen-modal-body">
              {/* Status & Jadwal Kebutuhan */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <span className="muted" style={{ fontSize: '0.78rem', display: 'block', marginBottom: 4 }}>
                    Status Pemrosesan
                  </span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <span className="muted" style={{ fontSize: '0.78rem', display: 'block', marginBottom: 4 }}>
                    Jadwal Pesanan Dibutuhkan
                  </span>
                  <strong style={{ fontSize: '0.94rem', color: 'var(--color-primary)' }}>
                    {formatDate(selectedOrder.orderDate)}
                  </strong>
                </div>
              </div>

              {/* Identitas Pemesan */}
              <div>
                <h3 style={{ fontSize: '0.98rem', marginBottom: 6 }}>Identitas Pemesan</h3>
                <div
                  style={{
                    fontSize: '0.88rem',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div><strong>Nama:</strong> {selectedOrder.customerAlias || selectedOrder.customer?.name || 'Pelanggan Nasi Kampus'}</div>
                  {selectedOrder.customer?.phone && (
                    <div><strong>WhatsApp:</strong> {selectedOrder.customer.phone}</div>
                  )}
                  <div className="muted" style={{ fontSize: '0.8rem' }}>
                    <strong>Lokasi Pengambilan:</strong> Ambil Sendiri di Outlet Dapur Nasi Kampus Samarinda
                  </div>
                </div>
              </div>

              {/* Catatan Khusus Pelanggan jika ada */}
              {Boolean(selectedOrder.notes && selectedOrder.notes.trim()) && (
                <div>
                  <h3 style={{ fontSize: '0.98rem', marginBottom: 6 }}>Catatan Khusus Pelanggan</h3>
                  <Alert tone="warning" icon="alert">
                    <strong style={{ display: 'block', marginBottom: 2 }}>Instruksi Khusus untuk Tim Dapur:</strong>
                    {selectedOrder.notes}
                  </Alert>
                </div>
              )}

              {/* Rincian Menu & Jumlah Porsi */}
              <div>
                <h3 style={{ fontSize: '0.98rem', marginBottom: 6 }}>Daftar Menu &amp; Porsi yang Harus Disiapkan</h3>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(selectedOrder.lines || []).map((l, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.88rem',
                          padding: '4px 0',
                          borderBottom: idx < (selectedOrder.lines || []).length - 1 ? '1px dashed var(--color-border)' : 0,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{l.name}</div>
                          <span className="muted" style={{ fontSize: '0.76rem' }}>
                            Kategori: {l.category === 'nasi-box' ? 'Nasi Kotak' : 'Snack Box'}
                          </span>
                        </div>
                        <span
                          style={{
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            fontSize: '0.84rem',
                          }}
                        >
                          {l.qty} Porsi
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                    }}
                  >
                    <span>Total Seluruh Porsi</span>
                    <span>
                      {(selectedOrder.lines || []).reduce((s, l) => s + (l.qty || 0), 0)} Porsi
                    </span>
                  </div>
                </div>
              </div>

              {/* Riwayat Pemrosesan Status */}
              {Array.isArray(selectedOrder.history) && selectedOrder.history.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.98rem', marginBottom: 6 }}>Riwayat Alur Status</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedOrder.history.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid var(--color-primary)',
                          background: 'var(--color-surface-subtle)',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>{h.status}</span>
                          <span className="muted" style={{ fontSize: '0.74rem' }}>{formatDateTime(h.at)}</span>
                        </div>
                        {h.note && <div className="muted" style={{ marginTop: 2, fontSize: '0.78rem' }}>{h.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <footer className="kitchen-modal-foot">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedOrder(null)}
              >
                Tutup
              </button>

              <div className="row" style={{ gap: 8 }}>
                {statusMeta(selectedOrder.status).id === 'DP Diterima & Masuk Antrean' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm btn-kitchen-main"
                    disabled={processingId === selectedOrder.id}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Sedang Dipersiapkan')}
                  >
                    <Icon name="flame" size={15} />
                    Mulai Masak
                  </button>
                )}

                {statusMeta(selectedOrder.status).id === 'Sedang Dipersiapkan' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm btn-kitchen-main"
                    style={{ background: 'var(--color-orange)', borderColor: 'var(--color-orange)' }}
                    disabled={processingId === selectedOrder.id}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Menunggu Jemputan')}
                  >
                    <Icon name="check" size={15} />
                    Siap Dijemput
                  </button>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
