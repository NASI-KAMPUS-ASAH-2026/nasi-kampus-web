import { useState } from 'react';
import Icon from '../../components/Icon';
import { BlockSkeleton, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/ui/Badges';
import { useAsync } from '../../hooks/useAsync';
import {
  getOwnerSummary,
  getPurchaseSummary,
  getPurchases,
  PERIODS,
} from '../../services/api';
import { ORDER_STATUSES } from '../../data/orderStatus';
import { categoryLabel } from '../../data/products';
import { formatDateShort, formatDayMonth, number, rupiah, rupiahShort } from '../../utils/format';

export default function OwnerReports() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'purchases'
  const [days, setDays] = useState(30);

  // Data Laporan Pesanan
  const { data: s, loading: ordersLoading, error: ordersError, reload: reloadOrders } = useAsync(
    () => getOwnerSummary(days),
    [days]
  );

  // Data Laporan Pembelian Bahan
  const { data: pSummary, loading: pLoading, error: pError, reload: reloadPurchases } = useAsync(
    () => getPurchaseSummary(days),
    [days]
  );

  // Seluruh Transaksi Pembelian untuk Laporan
  const { data: allPurchases } = useAsync(
    () => getPurchases({}, { role: 'owner' }),
    []
  );

  const purchaseList = allPurchases || [];
  const inRangePurchases = purchaseList.filter((p) => pSummary && p.purchaseDate >= pSummary.from && p.purchaseDate <= pSummary.to);

  return (
    <div className="owner-page">
      <header className="owner-page-head">
        <div>
          <h1>Laporan Operasional &amp; Keuangan ({days} Hari Terakhir)</h1>
          <p className="muted">
            Analisis performa penjualan pesanan pelanggan serta rekapitulasi pengeluaran belanja bahan baku aktual.
          </p>
        </div>
        <div className="owner-period" role="group" aria-label="Pilih rentang periode laporan">
          {PERIODS.map((p) => (
            <button key={p.id} type="button" className="chip" aria-pressed={days === p.days} onClick={() => setDays(p.days)}>
              {p.label} terakhir
            </button>
          ))}
        </div>
      </header>

      {/* Tab Navigasi Laporan */}
      <div className="chips" style={{ marginBottom: 20 }} role="tablist" aria-label="Pilih jenis laporan">
        <button
          type="button"
          className="chip"
          role="tab"
          aria-selected={activeTab === 'orders'}
          aria-pressed={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
          style={{ gap: 6 }}
        >
          <Icon name="list" size={16} /> Laporan Pesanan Pelanggan
        </button>
        <button
          type="button"
          className="chip"
          role="tab"
          aria-selected={activeTab === 'purchases'}
          aria-pressed={activeTab === 'purchases'}
          onClick={() => setActiveTab('purchases')}
          style={{ gap: 6 }}
        >
          <Icon name="receipt" size={16} /> Laporan Pembelian &amp; Stok Bahan
        </button>
      </div>

      {/* ================= TAB 1: LAPORAN PESANAN PELANGGAN ================= */}
      {activeTab === 'orders' && (
        <>
          {ordersLoading && <BlockSkeleton h={420} label="Memuat laporan pesanan" />}
          {ordersError && <ErrorState title="Laporan pesanan gagal dimuat" onRetry={reloadOrders} />}

          {!ordersLoading && !ordersError && s && (
            <>
              <section className="report-fin-grid" aria-label="Ringkasan utama laporan pesanan">
                <article className="panel fin-card">
                  <div className="fin-head">
                    <div>
                      <span className="fin-label">Total Nilai Pesanan ({s.days} Hari)</span>
                      <strong className="fin-val">{rupiah(s.estimatedValue)}</strong>
                    </div>
                    <span className="kpi-ic kpi-ic--orange"><Icon name="wallet" size={18} /></span>
                  </div>
                  <p className="muted">
                    Dari <strong>{number(s.totalOrders - s.cancelled)} pesanan aktif</strong> antara {formatDateShort(s.from)} hingga {formatDateShort(s.to)}.
                  </p>
                </article>

                <article className="panel fin-card">
                  <div className="fin-head">
                    <div>
                      <span className="fin-label">Total Porsi &amp; Rata-rata Pesanan</span>
                      <strong className="fin-val">{number(s.totalPortions)} Porsi</strong>
                    </div>
                    <span className="kpi-ic kpi-ic--ok"><Icon name="box" size={18} /></span>
                  </div>
                  <p className="muted">
                    Rata-rata nilai per pesanan aktif mencapai <strong>{rupiah(s.averageValue)}</strong> ({s.cancelled} pesanan dibatalkan).
                  </p>
                </article>
              </section>

              <section className="panel owner-card" aria-labelledby="trend30-title" style={{ marginTop: 20 }}>
                <div className="owner-card-head">
                  <div>
                    <h2 id="trend30-title">Tren Nilai Pesanan &amp; Volume Harian ({s.days} Hari)</h2>
                    <p className="muted">Setiap batang menunjukkan total nilai pesanan aktif per tanggal masuk.</p>
                  </div>
                  <span className="muted">Rata-rata / pesanan: <strong>{rupiah(s.averageValue)}</strong></span>
                </div>
                <ReportTrendChart daily={s.daily} />
              </section>

              <div className="owner-two-col" style={{ marginTop: 20 }}>
                <section className="panel owner-card" aria-labelledby="cat-rep-title">
                  <div className="owner-card-head">
                    <div>
                      <h2 id="cat-rep-title">Rincian per Kategori Menu</h2>
                      <p className="muted">Porsi dan komposisi nilai berdasarkan kategori produk.</p>
                    </div>
                  </div>
                  <div className="cat-report-list">
                    {Object.entries(s.byCategory).map(([catId, info]) => {
                      const pctVal = s.estimatedValue ? Math.round((info.value / s.estimatedValue) * 100) : 0;
                      const pctQty = s.totalPortions ? Math.round((info.qty / s.totalPortions) * 100) : 0;
                      return (
                        <div className="cat-report-item" key={catId}>
                          <div className="cat-report-top">
                            <div>
                              <h3>{categoryLabel(catId)}</h3>
                              <span className="muted">{number(info.qty)} porsi ({pctQty}% dari total porsi)</span>
                            </div>
                            <div className="cat-report-val">
                              <strong>{rupiah(info.value)}</strong>
                              <span>{pctVal}% total nilai</span>
                            </div>
                          </div>
                          <div className="bar-track" aria-hidden="true">
                            <div className={`bar-fill ${catId === 'nasi-box' ? 'bar-fill--red' : 'bar-fill--orange'}`} style={{ width: `${pctVal}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <h3 className="subhead">Menu Paling Sering Dipesan</h3>
                  <ul className="top-products">
                    {s.topProducts.map((p, idx) => (
                      <li key={p.productId}>
                        <span className="top-rank">#{idx + 1}</span>
                        <div className="top-info">
                          <strong>{p.name}</strong>
                          <span>{number(p.qty)} porsi</span>
                        </div>
                        <strong>{rupiah(p.value)}</strong>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="panel owner-card" aria-labelledby="st-rep-title">
                  <div className="owner-card-head">
                    <div>
                      <h2 id="st-rep-title">Rekapitulasi Status ({s.days} Hari)</h2>
                      <p className="muted">Ringkasan jumlah pesanan menurut tahapan pemrosesan.</p>
                    </div>
                  </div>
                  <div tabIndex={0} role="region" aria-labelledby="st-rep-title" className="table-wrapper">
                    <table className="owner-table">
                      <thead>
                        <tr>
                          <th scope="col">Status</th>
                          <th scope="col">Jumlah Pesanan</th>
                          <th scope="col">Proporsi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ORDER_STATUSES.map((st) => {
                          const cnt = s.byStatus[st.id] || 0;
                          const pct = s.totalOrders ? Math.round((cnt / s.totalOrders) * 100) : 0;
                          return (
                            <tr key={st.id}>
                              <th scope="row"><StatusBadge status={st.id} size="sm" /></th>
                              <td data-label="Jumlah Pesanan"><strong>{cnt}</strong> pesanan</td>
                              <td data-label="Proporsi">{pct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </>
          )}
        </>
      )}

      {/* ================= TAB 2: LAPORAN PEMBELIAN & PENGELOLAAN STOK ================= */}
      {activeTab === 'purchases' && (
        <>
          {pLoading && <BlockSkeleton h={420} label="Memuat laporan pembelian bahan" />}
          {pError && <ErrorState title="Laporan pembelian gagal dimuat" onRetry={reloadPurchases} />}

          {!pLoading && !pError && pSummary && (
            <>
              {/* Ringkasan Finansial Pembelian Bahan */}
              <section className="report-fin-grid" aria-label="Ringkasan pengeluaran pembelian bahan">
                <article className="panel fin-card">
                  <div className="fin-head">
                    <div>
                      <span className="fin-label">Total Belanja Bahan ({pSummary.days} Hari)</span>
                      <strong className="fin-val" style={{ color: 'var(--brand-red)' }}>
                        {rupiah(pSummary.totalSpent)}
                      </strong>
                    </div>
                    <span className="kpi-ic kpi-ic--red"><Icon name="receipt" size={18} /></span>
                  </div>
                  <p className="muted">
                    Total pengeluaran riil dari <strong>{pSummary.txCount} transaksi pembelian</strong> antara {formatDateShort(pSummary.from)} hingga {formatDateShort(pSummary.to)}.
                  </p>
                </article>

                <article className="panel fin-card">
                  <div className="fin-head">
                    <div>
                      <span className="fin-label">Rata-rata Nilai per Transaksi Belanja</span>
                      <strong className="fin-val">
                        {pSummary.txCount ? rupiah(Math.round(pSummary.totalSpent / pSummary.txCount)) : 'Rp 0'}
                      </strong>
                    </div>
                    <span className="kpi-ic kpi-ic--ok"><Icon name="wallet" size={18} /></span>
                  </div>
                  <p className="muted">
                    Meliputi pengadaan bahan pokok, protein, bumbu sayur, snack, dan kemasan catering.
                  </p>
                </article>
              </section>

              {/* Catatan Transparansi Akuntansi & Laba Bersih */}
              <div
                style={{
                  marginTop: 18,
                  padding: '14px 18px',
                  borderRadius: 8,
                  background: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <span className="kpi-ic kpi-ic--warn" style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }}>
                  <Icon name="info" size={16} />
                </span>
                <div>
                  <strong>Ketentuan Pelaporan Finansial:</strong>
                  <p className="muted" style={{ margin: '4px 0 0 0' }}>
                    Data laporan di bawah merupakan data transaksi pengadaan aktual dari sistem. Selisih antara nilai pesanan pelanggan dan total pembelian bahan <em>tidak diperhitungkan sebagai laba bersih</em>, karena sistem belum mencatat pemakaian fisik bahan per hidangan dan belum memasukkan seluruh komponen biaya operasional (seperti gaji tim, biaya gas/listrik, sewa outlet, dan logistik).
                  </p>
                </div>
              </div>

              {/* Rincian Pengeluaran Berdasarkan Kategori Bahan & Top Bahan */}
              <div className="owner-two-col" style={{ marginTop: 20 }}>
                {/* 1. Pengeluaran Berdasarkan Kategori Bahan */}
                <section className="panel owner-card" aria-labelledby="cat-purchase-title">
                  <div className="owner-card-head">
                    <div>
                      <h2 id="cat-purchase-title">Pengeluaran Berdasarkan Kategori Bahan</h2>
                      <p className="muted">Komposisi biaya belanja bahan baku menurut 7 kategori utama.</p>
                    </div>
                  </div>

                  <div className="cat-report-list">
                    {Object.entries(pSummary.byCategory).map(([catName, info]) => {
                      const pct = pSummary.totalSpent ? Math.round((info.amount / pSummary.totalSpent) * 100) : 0;
                      return (
                        <div className="cat-report-item" key={catName}>
                          <div className="cat-report-top">
                            <div>
                              <h3>{catName}</h3>
                              <span className="muted">{info.count} unit kuantitas dibeli</span>
                            </div>
                            <div className="cat-report-val">
                              <strong>{rupiah(info.amount)}</strong>
                              <span>{pct}% dari total belanja</span>
                            </div>
                          </div>
                          <div className="bar-track" aria-hidden="true">
                            <div
                              className="bar-fill bar-fill--red"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 2. Top 5 Bahan dengan Pengeluaran Terbanyak */}
                <section className="panel owner-card" aria-labelledby="top-ing-title">
                  <div className="owner-card-head">
                    <div>
                      <h2 id="top-ing-title">5 Bahan dengan Belanja Terbesar</h2>
                      <p className="muted">Bahan baku dengan alokasi biaya pengadaan tertinggi dalam periode ini.</p>
                    </div>
                  </div>

                  {pSummary.topIngredients.length === 0 ? (
                    <p className="muted" style={{ padding: '20px 0', textAlign: 'center' }}>
                      Belum ada data pembelian pada periode ini.
                    </p>
                  ) : (
                    <ul className="top-products">
                      {pSummary.topIngredients.map((ing, idx) => (
                        <li key={ing.id}>
                          <span className="top-rank">#{idx + 1}</span>
                          <div className="top-info">
                            <strong>{ing.name}</strong>
                            <span>{ing.qty} {ing.unit} · {ing.category}</span>
                          </div>
                          <strong style={{ color: 'var(--brand-red)' }}>{rupiah(ing.amount)}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              {/* Riwayat Transaksi Aktual Periode Ini */}
              <section className="panel owner-card" style={{ marginTop: 20 }} aria-labelledby="tx-history-rep-title">
                <div className="owner-card-head">
                  <div>
                    <h2 id="tx-history-rep-title">Daftar Transaksi Pembelian ({inRangePurchases.length} Transaksi)</h2>
                    <p className="muted">Seluruh transaksi aktual yang dicatat oleh Owner maupun Tim Dapur.</p>
                  </div>
                </div>

                <div tabIndex={0} role="region" aria-labelledby="tx-history-rep-title" className="table-wrapper">
                  <table className="owner-table">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: 140 }}>Kode</th>
                        <th scope="col">Tanggal Beli</th>
                        <th scope="col">Toko / Pemasok</th>
                        <th scope="col" style={{ textAlign: 'center' }}>Jumlah Jenis Bahan</th>
                        <th scope="col" style={{ textAlign: 'right' }}>Total Pembelian</th>
                        <th scope="col">Pencatat Transaksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inRangePurchases.map((p) => {
                        const isOwner = p.createdBy?.role === 'owner';
                        return (
                          <tr key={p.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.id}</td>
                            <td>{formatDateShort(p.purchaseDate)}</td>
                            <td><strong>{p.supplier}</strong></td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="badge badge--neutral" style={{ fontSize: '0.74rem' }}>
                                {(p.items || []).length} Item
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-red)' }}>
                              {rupiah(p.total)}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className={`badge ${isOwner ? 'badge--info' : 'badge--warning'}`} style={{ fontSize: '0.72rem' }}>
                                  {isOwner ? 'Owner / Admin' : 'Tim Dapur'}
                                </span>
                                <span style={{ fontSize: '0.84rem' }}>{p.createdBy?.name}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ReportTrendChart({ daily }) {
  const maxVal = Math.max(1, ...daily.map((d) => d.value));
  return (
    <div className="chart-wrap chart-wrap--scroll">
      <div className={`bar-chart ${daily.length > 10 ? 'bar-chart--dense' : ''}`}
        role="img" aria-label={`Grafik tren pesanan selama ${daily.length} hari`}>
        {daily.map((d) => {
          const h = Math.max(5, Math.round((d.value / maxVal) * 100));
          return (
            <div className="bar-col" key={d.date} title={`${formatDayMonth(d.date)}: ${d.orders} pesanan · ${rupiah(d.value)}`}>
              <span className="bar-top-val">{d.orders > 0 ? rupiahShort(d.value) : ''}</span>
              <div className="bar-col-track">
                <div className="bar-col-fill" style={{ height: `${d.orders ? h : 3}%` }} />
              </div>
              <span className="bar-col-label">{formatDayMonth(d.date)}</span>
              <small className="bar-col-sub">{d.orders}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
