import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { BlockSkeleton, EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/ui/Badges';
import { useToast } from '../../components/ui/Toast';
import { useAsync } from '../../hooks/useAsync';
import { getOwnerOrder, updateOrderStatus } from '../../services/api';
import { categoryLabel } from '../../data/products';
import { ORDER_STATUSES } from '../../data/orderStatus';
import { formatDate, formatDateTime, rupiah } from '../../utils/format';

export default function OwnerOrderDetail() {
  const { id } = useParams();
  const { data: o, loading, error, reload } = useAsync(() => getOwnerOrder(id), [id]);
  const { show } = useToast();

  const [newStatus, setNewStatus] = useState('');
  const [dpAmount, setDpAmount] = useState('');
  const [dpNotes, setDpNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Inisialisasi form saat data order dimuat
  const currentStatus = newStatus || (o ? o.status : 'Menunggu Konfirmasi & DP');

  const onUpdateStatus = async (e) => {
    e.preventDefault();
    if (!o) return;
    setUpdating(true);
    try {
      await updateOrderStatus(o.id, currentStatus, {
        dpAmount: dpAmount || o.dpAmount,
        dpNotes: dpNotes || o.dpNotes,
      });
      show(`Status pesanan ${o.id} berhasil diubah menjadi "${currentStatus}".`, { tone: 'success' });
      reload();
    } catch (err) {
      show(err?.message || 'Gagal memperbarui status.', { tone: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="owner-page"><BlockSkeleton h={380} label="Memuat rincian pesanan" /></div>;
  if (error) return <div className="owner-page"><ErrorState title="Rincian pesanan gagal dimuat" onRetry={reload} /></div>;
  if (!o) {
    return (
      <div className="owner-page">
        <EmptyState icon="receipt" title="Pesanan tidak ditemukan"
          text={`Kode pesanan "${id}" tidak terdapat dalam sistem.`}
          action={{ to: '/owner/orders', label: 'Kembali ke Daftar Pesanan' }} />
      </div>
    );
  }

  const totalPortions = (o.lines || []).reduce((s, l) => s + l.qty, 0);

  return (
    <div className="owner-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/owner/orders" className="back"><Icon name="back" size={18} /> Kembali ke Pesanan</Link>
      </nav>

      <header className="owner-page-head">
        <div>
          <div className="row" style={{ marginBottom: 8 }}>
            <StatusBadge status={o.status} />
          </div>
          <h1>Pesanan {o.id}</h1>
          <p className="muted">Dibuat pada {formatDateTime(o.createdAt)} · Pemesan: {o.customerAlias || o.customer?.name || 'Pelanggan'}</p>
        </div>
        <div className="row">
          <Link to={`/lacak-pesanan?kode=${o.id}`} target="_blank" className="btn btn-outline btn-sm">
            <Icon name="search" size={16} /> Pantau Halaman Lacak
          </Link>
          <Link to="/owner/orders" className="btn btn-outline btn-sm">
            <Icon name="back" size={16} /> Kembali
          </Link>
        </div>
      </header>

      {/* Panel Pengelolaan Status Pesanan & DP */}
      <section className="panel owner-status-manage-panel" aria-label="Pengelolaan status pesanan">
        <div className="manage-head">
          <div>
            <h2>Perbarui Status Pesanan &amp; Verifikasi DP</h2>
            <p className="muted">
              Pembaruan status di panel ini akan langsung tersinkronisasi ke halaman <strong>Lacak Status Pesanan</strong> yang dipantau oleh pelanggan.
            </p>
          </div>
          <StatusBadge status={o.status} />
        </div>

        <form onSubmit={onUpdateStatus} className="status-manage-form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="select-status">Ubah Status Pemrosesan</label>
              <select
                id="select-status"
                value={currentStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={updating}
                className="owner-select"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.id} ({st.short})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="input-dp">Nominal DP Terverifikasi (Rp)</label>
              <input
                id="input-dp"
                type="number"
                placeholder={o.dpAmount ? String(o.dpAmount) : 'Misal: 150000'}
                value={dpAmount}
                onChange={(e) => setDpAmount(e.target.value)}
                disabled={updating}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="input-dp-notes">Catatan Negosiasi / Pembayaran WhatsApp</label>
            <input
              id="input-dp-notes"
              type="text"
              placeholder={o.dpNotes || 'Nominal DP transfer sudah diverifikasi, jam jemput 11.30 WITA'}
              value={dpNotes}
              onChange={(e) => setDpNotes(e.target.value)}
              disabled={updating}
            />
          </div>

          <div className="manage-actions">
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? <Icon name="loader" size={18} className="spin" /> : <Icon name="check" size={18} />}
              <span>Simpan Perubahan Status</span>
            </button>
            {o.customer?.phone && (
              <a
                href={`https://wa.me/${o.customer.phone}?text=${encodeURIComponent(
                  `Halo Kak ${o.customer?.name || ''}, mengenai pesanan ${o.id} di Nasi Kampus Samarinda...`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <Icon name="whatsapp" size={16} /> Hubungi Pemesan di WA
              </a>
            )}
          </div>
        </form>
      </section>

      <div className="owner-detail-grid">
        <section className="panel owner-card" aria-labelledby="items-heading">
          <div className="owner-card-head">
            <h2 id="items-heading">Rincian Item Pesanan</h2>
            <span className="muted">{(o.lines || []).length} jenis menu · {totalPortions} porsi</span>
          </div>

          <div tabIndex={0} role="region" aria-labelledby="items-heading" className="table-wrapper">
            <table className="owner-table owner-table--items">
              <caption className="sr-only">Daftar menu pada pesanan {o.id}</caption>
              <thead>
                <tr>
                  <th scope="col">Nama Menu</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Harga Satuan</th>
                  <th scope="col">Jumlah</th>
                  <th scope="col">Subtotal Baris</th>
                </tr>
              </thead>
              <tbody>
                {(o.lines || []).map((l, idx) => (
                  <tr key={l.productId || idx}>
                    <th scope="row">
                      <Link to={`/menu/${l.productId}`} className="code-link">{l.name}</Link>
                    </th>
                    <td data-label="Kategori">{categoryLabel(l.category)}</td>
                    <td data-label="Harga Satuan">{rupiah(l.unitPrice)}</td>
                    <td data-label="Jumlah">{l.qty} porsi</td>
                    <td data-label="Subtotal Baris"><strong>{rupiah(l.qty * l.unitPrice)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="sum-list owner-detail-sum">
            <div className="sum-row"><dt>Total kuantitas</dt><dd>{totalPortions} porsi</dd></div>
            <div className="sum-row"><dt>Subtotal item</dt><dd>{rupiah(o.total)}</dd></div>
            <div className="sum-row sum-total"><dt>Total pesanan</dt><dd>{rupiah(o.total)}</dd></div>
          </dl>
        </section>

        <aside className="panel owner-card" aria-labelledby="meta-heading">
          <h2 id="meta-heading">Informasi Pesanan</h2>
          <dl className="meta-dl">
            <div>
              <dt>Kode Referensi</dt>
              <dd><code>{o.id}</code></dd>
            </div>
            <div>
              <dt>Status Saat Ini</dt>
              <dd><StatusBadge status={o.status} size="sm" /></dd>
            </div>
            <div>
              <dt>Nama Pemesan</dt>
              <dd><strong>{o.customer?.name || o.customerAlias}</strong></dd>
            </div>
            {o.customer?.phone && (
              <div>
                <dt>WhatsApp Pemesan</dt>
                <dd><code>{o.customer.phone}</code></dd>
              </div>
            )}
            <div>
              <dt>Metode Pengambilan</dt>
              <dd>Ambil Sendiri di Dapur / Outlet Nasi Kampus Samarinda</dd>
            </div>
            <div>
              <dt>Tanggal Dibutuhkan</dt>
              <dd><strong>{formatDate(o.orderDate)}</strong></dd>
            </div>
            {o.dpAmount && (
              <div>
                <dt>DP Tercatat</dt>
                <dd><strong>{rupiah(o.dpAmount)}</strong></dd>
              </div>
            )}
            {o.dpNotes && (
              <div>
                <dt>Catatan DP / Negosiasi</dt>
                <dd>{o.dpNotes}</dd>
              </div>
            )}
            <div>
              <dt>Catatan Pemesan</dt>
              <dd>{o.notes || <span className="muted">Tidak ada catatan tambahan</span>}</dd>
            </div>
          </dl>

          {/* Log Riwayat Status */}
          {Array.isArray(o.history) && o.history.length > 0 && (
            <div className="owner-history-box">
              <h3>Riwayat Perubahan Status</h3>
              <ul className="owner-history-list">
                {o.history.map((h, i) => (
                  <li key={i}>
                    <div className="history-head">
                      <strong>{h.status}</strong>
                      <small>{formatDateTime(h.at)}</small>
                    </div>
                    {h.note && <p className="history-note">{h.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

