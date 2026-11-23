import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Icon from '../../components/Icon';
import { rupiah, formatDate, formatDateShort } from '../../utils/format';
import { AdminStatusBadge, PaymentBadge } from '../../components/ui/Badges';

export default function AdminDashboard() {
  const { orders } = useOutletContext();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => o.orderDate === today);
    return {
      totalToday: todayOrders.length,
      menungguKonfirmasi: orders.filter(o => o.status === 'Menunggu Konfirmasi').length,
      sedangDipersiapkan: orders.filter(o => o.status === 'Sedang Dipersiapkan').length,
      siapDijemput: orders.filter(o => o.status === 'Siap Dijemput').length,
      selesai: orders.filter(o => o.status === 'Selesai').length,
      belumDibayar: orders.filter(o => o.paymentStatus === 'Belum Dibayar' && o.status !== 'Ditolak').length,
      dp: orders.filter(o => o.paymentStatus === 'DP').length,
    };
  }, [orders, today]);

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders]);

  const needsAction = useMemo(() => ({
    unconfirmed: orders.filter(o => o.status === 'Menunggu Konfirmasi'),
    needPayment: orders.filter(o =>
      o.paymentStatus === 'Belum Dibayar' &&
      ['Dikonfirmasi', 'Sedang Dipersiapkan', 'Siap Dijemput'].includes(o.status)
    ),
    sisaPembayaran: orders.filter(o =>
      o.paymentStatus === 'DP' &&
      ['Siap Dijemput', 'Selesai'].includes(o.status)
    ),
  }), [orders]);

  const upcoming = useMemo(() =>
    orders
      .filter(o => o.pickupDate >= today && !['Selesai', 'Ditolak'].includes(o.status))
      .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate) || a.pickupTime.localeCompare(b.pickupTime))
      .slice(0, 6),
    [orders, today]
  );

  const kpiCards = [
    {
      label: 'Total Pesanan Hari Ini',
      value: stats.totalToday,
      icon: 'receipt',
      color: 'kpi-ic--ok',
      filter: 'today',
    },
    {
      label: 'Menunggu Konfirmasi',
      value: stats.menungguKonfirmasi,
      icon: 'clock',
      color: 'kpi-ic--warn',
      filter: 'Menunggu Konfirmasi',
    },
    {
      label: 'Sedang Dipersiapkan',
      value: stats.sedangDipersiapkan,
      icon: 'flame',
      color: 'kpi-ic--orange',
      filter: 'Sedang Dipersiapkan',
    },
    {
      label: 'Siap Dijemput',
      value: stats.siapDijemput,
      icon: 'check',
      color: 'kpi-ic--ok',
      filter: 'Siap Dijemput',
    },
    {
      label: 'Selesai',
      value: stats.selesai,
      icon: 'sparkle',
      color: 'kpi-ic--ok',
      filter: 'Selesai',
    },
  ];

  const paymentCards = [
    {
      label: 'Belum Dibayar',
      value: stats.belumDibayar,
      icon: 'wallet',
      color: 'kpi-ic--red',
      filter: 'Belum Dibayar',
    },
    {
      label: 'Menunggu Pelunasan (DP)',
      value: stats.dp,
      icon: 'wallet',
      color: 'kpi-ic--warn',
      filter: 'DP',
    },
  ];

  const goToOrders = (filter) => {
    navigate('/admin/orders', { state: { filter } });
  };

  const goToPayments = (filter) => {
    navigate('/admin/payments', { state: { filter } });
  };

  return (
    <div className="owner-page-wrap">
      <div className="owner-page-head">
        <div>
          <h1 className="owner-page-title">Dashboard Admin</h1>
          <p className="owner-page-sub">Gambaran kondisi pesanan dan pembayaran hari ini</p>
        </div>
      </div>

      {/* KPI Pesanan */}
      <section>
        <h2 className="owner-section-title">Ringkasan Pesanan</h2>
        <div className="kpi-grid">
          {kpiCards.map((k) => (
            <button
              key={k.label}
              type="button"
              className="kpi-card"
              onClick={() => goToOrders(k.filter)}
              style={{ cursor: 'pointer', textAlign: 'left' }}
            >
              <div className="kpi-top">
                <span className={`kpi-ic ${k.color}`}><Icon name={k.icon} size={20} /></span>
              </div>
              <div className="kpi-val">{k.value}</div>
              <div className="kpi-sub">{k.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* KPI Pembayaran */}
      <section style={{ marginTop: 24 }}>
        <h2 className="owner-section-title">Ringkasan Pembayaran</h2>
        <div className="kpi-grid">
          {paymentCards.map((k) => (
            <button
              key={k.label}
              type="button"
              className="kpi-card"
              onClick={() => goToPayments(k.filter)}
              style={{ cursor: 'pointer', textAlign: 'left' }}
            >
              <div className="kpi-top">
                <span className={`kpi-ic ${k.color}`}><Icon name={k.icon} size={20} /></span>
              </div>
              <div className="kpi-val">{k.value}</div>
              <div className="kpi-sub">{k.label}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="admin-dash-grid">
        {/* Pesanan Terbaru */}
        <section className="owner-card admin-dash-main">
          <div className="owner-card-head">
            <h2 className="owner-section-title" style={{ margin: 0 }}>Pesanan Terbaru</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/admin/orders')}>
              Lihat Semua <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="table-wrapper">
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Pelanggan</th>
                  <th>Jadwal Ambil</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Bayar</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td><code style={{ fontSize: 12 }}>{o.id}</code></td>
                    <td>{o.customerName}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDateShort(o.pickupDate)} {o.pickupTime}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{rupiah(o.total)}</td>
                    <td><AdminStatusBadge status={o.status} /></td>
                    <td><PaymentBadge status={o.paymentStatus} /></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => navigate('/admin/orders', { state: { openOrder: o.id } })}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="admin-dash-side">
          {/* Perlu Tindakan */}
          <section className="owner-card">
            <div className="owner-card-head">
              <h2 className="owner-section-title" style={{ margin: 0 }}>
                <Icon name="alert" size={16} /> Perlu Tindakan
              </h2>
            </div>
            <div style={{ padding: '0 16px 16px' }}>
              {needsAction.unconfirmed.length === 0 && needsAction.needPayment.length === 0 && needsAction.sisaPembayaran.length === 0 ? (
                <p className="muted" style={{ textAlign: 'center', padding: '12px 0' }}>Tidak ada tindakan yang diperlukan.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {needsAction.unconfirmed.length > 0 && (
                    <li className="admin-action-item admin-action-item--warn">
                      <Icon name="clock" size={15} />
                      <div>
                        <strong>{needsAction.unconfirmed.length} pesanan</strong> belum dikonfirmasi
                        <button type="button" className="btn btn-ghost btn-xs" style={{ marginLeft: 8 }}
                          onClick={() => goToOrders('Menunggu Konfirmasi')}>Lihat</button>
                      </div>
                    </li>
                  )}
                  {needsAction.needPayment.length > 0 && (
                    <li className="admin-action-item admin-action-item--error">
                      <Icon name="wallet" size={15} />
                      <div>
                        <strong>{needsAction.needPayment.length} pesanan</strong> belum ada pencatatan pembayaran
                        <button type="button" className="btn btn-ghost btn-xs" style={{ marginLeft: 8 }}
                          onClick={() => navigate('/admin/payments')}>Catat</button>
                      </div>
                    </li>
                  )}
                  {needsAction.sisaPembayaran.length > 0 && (
                    <li className="admin-action-item admin-action-item--warn">
                      <Icon name="receipt" size={15} />
                      <div>
                        <strong>{needsAction.sisaPembayaran.length} pesanan</strong> masih memiliki sisa pembayaran
                        <button type="button" className="btn btn-ghost btn-xs" style={{ marginLeft: 8 }}
                          onClick={() => goToPayments('DP')}>Lihat</button>
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </section>

          {/* Jadwal Pengambilan Mendatang */}
          <section className="owner-card" style={{ marginTop: 16 }}>
            <div className="owner-card-head">
              <h2 className="owner-section-title" style={{ margin: 0 }}>
                <Icon name="calendar" size={16} /> Jadwal Pengambilan
              </h2>
            </div>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.length === 0 ? (
                <p className="muted" style={{ textAlign: 'center', padding: '12px 0' }}>Tidak ada jadwal mendatang.</p>
              ) : (
                upcoming.map(o => (
                  <div key={o.id} className="admin-pickup-item">
                    <div className="admin-pickup-date">
                      <Icon name="calendar" size={14} />
                      <span>{formatDate(o.pickupDate)}</span>
                      <span className="muted" style={{ fontSize: 12 }}>{o.pickupTime}</span>
                    </div>
                    <div className="admin-pickup-info">
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{o.customerName}</span>
                      <AdminStatusBadge status={o.status} />
                    </div>
                    <code style={{ fontSize: 11, color: 'var(--muted)' }}>{o.id}</code>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
