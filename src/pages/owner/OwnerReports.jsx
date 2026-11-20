import { useState } from 'react';
import Icon from '../../components/Icon';
import { BlockSkeleton, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/ui/Badges';
import { useAsync } from '../../hooks/useAsync';
import { getOwnerSummary, PERIODS } from '../../services/api';
import { ORDER_STATUSES } from '../../data/orderStatus';
import { categoryLabel } from '../../data/products';
import { formatDateShort, formatDayMonth, number, rupiah, rupiahShort } from '../../utils/format';

export default function OwnerReports() {
  const [days, setDays] = useState(30);
  const { data: s, loading, error, reload } = useAsync(() => getOwnerSummary(days), [days]);

  return (
    <div className="owner-page">
      <header className="owner-page-head">
        <div>
          <h1>Laporan Pesanan ({days} Hari Terakhir)</h1>
          <p className="muted">
            Ringkasan nilai pesanan, performa kategori menu, dan rekapitulasi status pengerjaan.
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

      {loading && <BlockSkeleton h={420} label="Memuat laporan pemilik" />}
      {error && <ErrorState title="Laporan gagal dimuat" onRetry={reload} />}

      {!loading && !error && s && (
        <>
          <section className="report-fin-grid" aria-label="Ringkasan utama laporan">
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

          <section className="panel owner-card" aria-labelledby="trend30-title">
            <div className="owner-card-head">
              <div>
                <h2 id="trend30-title">Tren Nilai Pesanan &amp; Volume Harian ({s.days} Hari)</h2>
                <p className="muted">Setiap batang menunjukkan total nilai pesanan aktif per tanggal masuk.</p>
              </div>
              <span className="muted">Rata-rata / pesanan: <strong>{rupiah(s.averageValue)}</strong></span>
            </div>
            <ReportTrendChart daily={s.daily} />
          </section>

          <div className="owner-two-col">
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
                  <caption className="sr-only">Tabel jumlah pesanan per status</caption>
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
