import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { BlockSkeleton, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/ui/Badges';
import { useAsync } from '../../hooks/useAsync';
import { getOwnerSummary, PERIODS } from '../../services/api';
import { ORDER_STATUSES } from '../../data/orderStatus';
import { formatDateShort, formatDayMonth, number, rupiah, rupiahShort } from '../../utils/format';

export default function OwnerDashboard() {
  const [days, setDays] = useState(7);
  const { data: s, loading, error, reload } = useAsync(() => getOwnerSummary(days), [days]);

  return (
    <div className="owner-page">
      <header className="owner-page-head">
        <div>
          <h1>Ikhtisar Pesanan</h1>
          <p className="muted">
            Ringkasan volume, nilai pesanan, dan progres operasional terkini.
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
      {error && <ErrorState title="Ringkasan gagal dimuat" onRetry={reload} />}

      {!loading && !error && s && (
        <>
          <section className="kpi-grid" aria-label="Kartu indikator utama">
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
                <span>Dikonfirmasi & Diproses</span>
                <span className="kpi-ic kpi-ic--orange"><Icon name="box" size={18} /></span>
              </div>
              <strong className="kpi-val">{number(s.inProgress)}</strong>
              <span className="kpi-sub">Sedang dijadwalkan / disiapkan dapur</span>
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

          <div className="owner-two-col">
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

          <section className="panel owner-card" aria-labelledby="latest-title">
            <div className="owner-card-head">
              <div>
                <h2 id="latest-title">Pesanan Terbaru</h2>
                <p className="muted">6 pesanan terbaru yang masuk. Klik baris atau tombol lihat untuk mengelola status.</p>
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
