import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { BlockSkeleton, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/ui/Badges';
import { useAsync } from '../../hooks/useAsync';
import {
  getOwnerSummary,
  getStockSummary,
  getPurchaseSummary,
  PERIODS,
} from '../../services/api';
import { ORDER_STATUSES } from '../../data/orderStatus';
import { formatDateShort, formatDayMonth, number, rupiah, rupiahShort } from '../../utils/format';
import PurchaseFormModal from '../../components/stock/PurchaseFormModal';

export default function OwnerDashboard() {
  const [days, setDays] = useState(7);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const { data: s, loading, error, reload: reloadOrders } = useAsync(() => getOwnerSummary(days), [days]);
  const { data: stock, reload: reloadStock } = useAsync(() => getStockSummary(), []);
  const { data: purchases, reload: reloadPurchases } = useAsync(() => getPurchaseSummary(days), [days]);

  // Dengarkan event pembaruan reaktif lintas halaman
  useEffect(() => {
    const handleUpdate = () => {
      reloadOrders();
      reloadStock();
      reloadPurchases();
    };
    window.addEventListener('nk_orders_updated', handleUpdate);
    window.addEventListener('nk_stock_updated', handleUpdate);
    window.addEventListener('nk_purchases_updated', handleUpdate);
    return () => {
      window.removeEventListener('nk_orders_updated', handleUpdate);
      window.removeEventListener('nk_stock_updated', handleUpdate);
      window.removeEventListener('nk_purchases_updated', handleUpdate);
    };
  }, [reloadOrders, reloadStock, reloadPurchases]);

  const lowStockItems = stock?.lowStockList || [];

  return (
    <div className="owner-page">
      <header className="owner-page-head">
        <div>
          <h1>Ikhtisar Usaha &amp; Operasional</h1>
          <p className="muted">
            Ringkasan volume pesanan, nilai transaksi, stok bahan baku, dan pengeluaran pembelian terkini.
          </p>
        </div>
        <div className="owner-period" role="group" aria-label="Pilih rentang periode">
          {PERIODS.map((p) => (
            <button key={p.id} type="button" className="chip" aria-pressed={days === p.days} onClick={() => setDays(p.days)}>
              {p.label} terakhir
            </button>
          ))}
        </div>
      </header>

      {loading && <BlockSkeleton h={420} label="Memuat ringkasan pemilik" />}
      {error && <ErrorState title="Ringkasan gagal dimuat" onRetry={reloadOrders} />}

      {!loading && !error && s && (
        <>
          {/* Bagian 1: KPI Pesanan Pelanggan */}
          <section className="kpi-grid" aria-label="Kartu indikator pesanan">
            <article className="kpi-card">
              <div className="kpi-top">
                <span>Total Pesanan ({s.days} hari)</span>
                <span className="kpi-ic kpi-ic--red"><Icon name="receipt" size={18} /></span>
              </div>
              <strong className="kpi-val">{number(s.totalOrders)}</strong>
              <span className="kpi-sub">{formatDateShort(s.from)} – {formatDateShort(s.to)}</span>
            </article>

            <article className="kpi-card">
              <div className="kpi-top">
                <span>Menunggu Konfirmasi</span>
                <span className="kpi-ic kpi-ic--warn"><Icon name="clock" size={18} /></span>
              </div>
              <strong className="kpi-val">{number(s.pending)}</strong>
              <span className="kpi-sub">Perlu ditindaklanjuti admin via WA</span>
            </article>

            <article className="kpi-card">
              <div className="kpi-top">
                <span>Dikonfirmasi &amp; Diproses</span>
                <span className="kpi-ic kpi-ic--orange"><Icon name="box" size={18} /></span>
              </div>
              <strong className="kpi-val">{number(s.inProgress)}</strong>
              <span className="kpi-sub">Sedang disiapkan antrean dapur</span>
            </article>

            <article className="kpi-card">
              <div className="kpi-top">
                <span>Pesanan Selesai</span>
                <span className="kpi-ic kpi-ic--ok"><Icon name="check" size={18} /></span>
              </div>
              <strong className="kpi-val">{number(s.completed)}</strong>
              <span className="kpi-sub">Dibatalkan: {number(s.cancelled)} pesanan</span>
            </article>

            <article className="kpi-card kpi-card--wide">
              <div className="kpi-top">
                <span>Total Nilai Pesanan ({s.days} hari)</span>
                <span className="kpi-ic kpi-ic--orange"><Icon name="wallet" size={18} /></span>
              </div>
              <strong className="kpi-val">{rupiah(s.estimatedValue)}</strong>
              <span className="kpi-sub">
                Total {number(s.totalPortions)} porsi aktif · rata-rata {rupiah(s.averageValue)} / pesanan
              </span>
            </article>
          </section>

          {/* Bagian 2: KPI Bahan & Stok Terkini */}
          <section className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', marginTop: 16 }} aria-label="Indikator stok dan pembelian">
            <article className="kpi-card">
              <div className="kpi-top">
                <span>Total Jenis Bahan</span>
                <span className="kpi-ic kpi-ic--red"><Icon name="box" size={18} /></span>
              </div>
              <strong className="kpi-val">{stock?.totalIngredients || 0}</strong>
              <span className="kpi-sub">
                <Link to="/owner/ingredients" className="link-btn">Kelola Master Bahan →</Link>
              </span>
            </article>

            <article className="kpi-card">
              <div className="kpi-top">
                <span>Bahan Stok Rendah</span>
                <span className="kpi-ic kpi-ic--warn"><Icon name="alert" size={18} /></span>
              </div>
              <strong className="kpi-val" style={{ color: (stock?.lowStockCount || 0) > 0 ? 'var(--color-error)' : 'inherit' }}>
                {stock?.lowStockCount || 0}
              </strong>
              <span className="kpi-sub">
                {(stock?.lowStockCount || 0) > 0 ? 'Perlu segera dilakukan restock' : 'Semua stok di atas batas aman'}
              </span>
            </article>

            <article className="kpi-card">
              <div className="kpi-top">
                <span>Total Pembelian ({s.days} hari)</span>
                <span className="kpi-ic kpi-ic--ok"><Icon name="receipt" size={18} /></span>
              </div>
              <strong className="kpi-val" style={{ color: 'var(--brand-red)' }}>
                {rupiah(purchases?.totalSpent || 0)}
              </strong>
              <span className="kpi-sub">
                {purchases?.txCount || 0} transaksi belanja bahan
              </span>
            </article>
          </section>

          {/* Banner Peringatan Stok Rendah (Jika Ada) */}
          {lowStockItems.length > 0 && (
            <section
              className="panel"
              style={{
                marginTop: 18,
                padding: '16px 20px',
                borderLeft: '4px solid var(--color-error)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 14,
              }}
              aria-label="Peringatan stok bahan rendah"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="kpi-ic kpi-ic--warn" style={{ width: 38, height: 38, borderRadius: 8 }}>
                  <Icon name="alert" size={20} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-error)' }}>
                    Peringatan Stok Rendah: {lowStockItems.length} Bahan Membutuhkan Restock
                  </h3>
                  <p className="muted" style={{ margin: '4px 0 0 0', fontSize: '0.86rem' }}>
                    Bahan: {lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit})`).join(', ')}.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsPurchaseModalOpen(true)}
                >
                  <Icon name="plus" size={15} /> Catat Pembelian
                </button>
                <Link to="/owner/ingredients" className="btn btn-outline btn-sm">
                  Lihat Master Bahan
                </Link>
              </div>
            </section>
          )}

          {/* Tren Pesanan & Komposisi Status */}
          <div className="owner-two-col" style={{ marginTop: 20 }}>
            <section className="panel owner-card" aria-labelledby="trend-title">
              <div className="owner-card-head">
                <div>
                  <h2 id="trend-title">Tren Pesanan Harian ({s.days} Hari)</h2>
                  <p className="muted">Jumlah pesanan masuk dan estimasi nilai per tanggal dibuat.</p>
                </div>
                <Link to="/owner/reports" className="link-btn">Lihat laporan lengkap</Link>
              </div>
              <DailyBarChart daily={s.daily} />
            </section>

            <section className="panel owner-card" aria-labelledby="status-title">
              <div className="owner-card-head">
                <div>
                  <h2 id="status-title">Komposisi Status</h2>
                  <p className="muted">Distribusi status dari {s.totalOrders} pesanan pada periode ini.</p>
                </div>
              </div>
              <ul className="status-bars">
                {ORDER_STATUSES.map((st) => {
                  const cnt = s.byStatus[st.id] || 0;
                  const pct = s.totalOrders ? Math.round((cnt / s.totalOrders) * 100) : 0;
                  return (
                    <li key={st.id}>
                      <div className="status-bars-top">
                        <StatusBadge status={st.id} size="sm" />
                        <span><strong>{cnt}</strong> pesanan ({pct}%)</span>
                      </div>
                      <div className="bar-track" aria-hidden="true">
                        <div className={`bar-fill bar-fill--${st.tone}`} style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* Pesanan Terbaru */}
          <section className="panel owner-card" style={{ marginTop: 20 }} aria-labelledby="latest-title">
            <div className="owner-card-head">
              <div>
                <h2 id="latest-title">Pesanan Pelanggan Terbaru</h2>
                <p className="muted">6 pesanan terbaru yang masuk ke sistem.</p>
              </div>
              <Link to="/owner/orders" className="btn btn-outline btn-sm">Semua Pesanan <Icon name="arrow" size={16} /></Link>
            </div>

            <div tabIndex={0} role="region" aria-labelledby="latest-title" className="table-wrapper">
              <table className="owner-table">
                <caption className="sr-only">Daftar 6 pesanan terbaru</caption>
                <thead>
                  <tr>
                    <th scope="col">Kode</th>
                    <th scope="col">Pelanggan</th>
                    <th scope="col">Tgl Dibuat</th>
                    <th scope="col">Tgl Dibutuhkan</th>
                    <th scope="col">Porsi</th>
                    <th scope="col">Total</th>
                    <th scope="col">Status</th>
                    <th scope="col">Rincian</th>
                  </tr>
                </thead>
                <tbody>
                  {s.latest.map((o) => {
                    const portions = o.lines.reduce((acc, l) => acc + l.qty, 0);
                    return (
                      <tr key={o.id}>
                        <th scope="row"><Link to={`/owner/orders/${o.id}`} className="code-link">{o.id}</Link></th>
                        <td data-label="Pelanggan">{o.customerAlias}</td>
                        <td data-label="Tgl Dibuat">{formatDateShort(o.createdDate)}</td>
                        <td data-label="Tgl Dibutuhkan">{formatDateShort(o.orderDate)}</td>
                        <td data-label="Porsi">{portions} porsi</td>
                        <td data-label="Nilai Estimasi"><strong>{rupiah(o.total)}</strong></td>
                        <td data-label="Status"><StatusBadge status={o.status} size="sm" /></td>
                        <td data-label="Rincian">
                          <Link to={`/owner/orders/${o.id}`} className="link-btn">Lihat <Icon name="chevronRight" size={15} /></Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Transaksi Pembelian Terbaru */}
          {purchases?.recentPurchases && purchases.recentPurchases.length > 0 && (
            <section className="panel owner-card" style={{ marginTop: 20 }} aria-labelledby="recent-purchases-title">
              <div className="owner-card-head">
                <div>
                  <h2 id="recent-purchases-title">Pembelian Bahan Terkini</h2>
                  <p className="muted">Transaksi pengadaan bahan yang dicatat oleh Owner maupun Tim Dapur.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setIsPurchaseModalOpen(true)}
                  >
                    <Icon name="plus" size={15} /> Catat Pembelian
                  </button>
                  <Link to="/owner/purchases" className="btn btn-outline btn-sm">
                    Semua Transaksi <Icon name="arrow" size={16} />
                  </Link>
                </div>
              </div>

              <div tabIndex={0} role="region" aria-labelledby="recent-purchases-title" className="table-wrapper">
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th scope="col">Kode</th>
                      <th scope="col">Tanggal Beli</th>
                      <th scope="col">Toko / Pemasok</th>
                      <th scope="col" style={{ textAlign: 'center' }}>Bahan</th>
                      <th scope="col" style={{ textAlign: 'right' }}>Total Pembelian</th>
                      <th scope="col">Dicatat Oleh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.recentPurchases.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Link to="/owner/purchases" className="code-link" style={{ fontFamily: 'monospace' }}>
                            {p.id}
                          </Link>
                        </td>
                        <td>{formatDateShort(p.purchaseDate)}</td>
                        <td><strong>{p.supplier}</strong></td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge--neutral" style={{ fontSize: '0.75rem' }}>
                            {(p.items || []).length} jenis
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-red)' }}>
                          {rupiah(p.total)}
                        </td>
                        <td>
                          <span className={`badge ${p.createdBy?.role === 'owner' ? 'badge--info' : 'badge--warning'}`} style={{ fontSize: '0.72rem' }}>
                            {p.createdBy?.name}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Modal Cepat Tambah Pembelian dari Dasbor */}
          <PurchaseFormModal
            isOpen={isPurchaseModalOpen}
            onClose={() => setIsPurchaseModalOpen(false)}
            currentUser={{ role: 'owner', name: 'Bapak Bayu (Owner)', userId: 1 }}
            onSuccess={() => {
              reloadStock();
              reloadPurchases();
            }}
          />
        </>
      )}
    </div>
  );
}

function DailyBarChart({ daily }) {
  const maxVal = Math.max(1, ...daily.map((d) => d.value));
  return (
    <div className="chart-wrap">
      <div className="bar-chart" role="img" aria-label={`Grafik batang nilai pesanan harian selama ${daily.length} hari`}>
        {daily.map((d) => {
          const h = Math.max(6, Math.round((d.value / maxVal) * 100));
          return (
            <div className="bar-col" key={d.date} title={`${formatDayMonth(d.date)}: ${d.orders} pesanan · ${rupiah(d.value)}`}>
              <span className="bar-top-val">{d.orders > 0 ? rupiahShort(d.value) : '–'}</span>
              <div className="bar-col-track">
                <div className="bar-col-fill" style={{ height: `${d.orders ? h : 3}%` }} />
              </div>
              <span className="bar-col-label">{formatDayMonth(d.date)}</span>
              <small className="bar-col-sub">{d.orders} psn</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
