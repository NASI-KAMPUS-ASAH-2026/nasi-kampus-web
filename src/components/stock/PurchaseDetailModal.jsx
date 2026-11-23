import Icon from '../Icon';
import { formatDate, formatDateTime, rupiah } from '../../utils/format';

export default function PurchaseDetailModal({
  isOpen,
  onClose,
  purchase,
  currentUser = { role: 'owner' },
  onEdit,
}) {
  if (!isOpen || !purchase) return null;

  const isOwner = currentUser.role === 'owner';
  const isCreator = purchase.createdBy?.role === currentUser.role;
  const canEdit = isOwner ? isCreator : isCreator; // Owner can edit owner txs, kitchen can edit kitchen txs

  const items = purchase.items || [];

  return (
    <div
      className="kitchen-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-detail-title"
    >
      <div className="kitchen-modal" style={{ maxWidth: 740 }}>
        <header className="kitchen-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className="kpi-ic kpi-ic--red"
              style={{
                width: 34,
                height: 34,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            >
              <Icon name="receipt" size={18} />
            </span>
            <div>
              <h2 id="purchase-detail-title">Rincian Transaksi Pembelian</h2>
              <span className="muted" style={{ fontSize: '0.82rem' }}>
                Kode: <strong>{purchase.id}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            className="owner-close-btn"
            onClick={onClose}
            aria-label="Tutup rincian transaksi"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="kitchen-modal-body" style={{ gap: 16 }}>
          {/* Metadata Transaksi */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 12,
            }}
          >
            <div className="panel" style={{ padding: 12 }}>
              <span className="muted" style={{ fontSize: '0.78rem', display: 'block' }}>
                Tanggal Pembelian
              </span>
              <strong style={{ fontSize: '0.94rem' }}>
                {formatDate(purchase.purchaseDate)}
              </strong>
            </div>

            <div className="panel" style={{ padding: 12 }}>
              <span className="muted" style={{ fontSize: '0.78rem', display: 'block' }}>
                Toko / Pemasok
              </span>
              <strong style={{ fontSize: '0.94rem' }}>{purchase.supplier}</strong>
            </div>

            <div className="panel" style={{ padding: 12 }}>
              <span className="muted" style={{ fontSize: '0.78rem', display: 'block' }}>
                Dicatat Oleh
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span
                  className={`badge ${
                    purchase.createdBy?.role === 'owner' ? 'badge--info' : 'badge--warning'
                  }`}
                  style={{ fontSize: '0.72rem' }}
                >
                  {purchase.createdBy?.role === 'owner' ? 'Owner / Admin' : 'Tim Dapur'}
                </span>
                <strong style={{ fontSize: '0.88rem' }}>{purchase.createdBy?.name}</strong>
              </div>
            </div>

            <div className="panel" style={{ padding: 12 }}>
              <span className="muted" style={{ fontSize: '0.78rem', display: 'block' }}>
                Waktu Pencatatan
              </span>
              <span style={{ fontSize: '0.86rem' }}>
                {purchase.createdAt ? formatDateTime(purchase.createdAt) : '—'}
              </span>
            </div>
          </div>

          {/* Tabel Rincian Item Bahan */}
          <div>
            <h3 style={{ fontSize: '0.96rem', margin: '0 0 8px 0' }}>
              Daftar Bahan ({items.length} jenis)
            </h3>
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <table
                className="owner-table"
                style={{ margin: 0, width: '100%', fontSize: '0.86rem' }}
              >
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>No</th>
                    <th>Nama Bahan</th>
                    <th>Kategori</th>
                    <th style={{ textAlign: 'center' }}>Jumlah</th>
                    <th style={{ textAlign: 'right' }}>Harga Satuan</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <strong>{item.ingredientName}</strong>
                      </td>
                      <td>
                        <span className="badge badge--neutral" style={{ fontSize: '0.75rem' }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {item.qty} {item.unit}
                      </td>
                      <td style={{ textAlign: 'right' }}>{rupiah(item.unitPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {rupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--color-surface-subtle)', fontWeight: 700 }}>
                    <td colSpan={5} style={{ textAlign: 'right', paddingRight: 16 }}>
                      Total Pembelian:
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        color: 'var(--brand-red)',
                        fontSize: '1.05rem',
                      }}
                    >
                      {rupiah(purchase.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Catatan Transaksi */}
          {purchase.notes && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                fontSize: '0.86rem',
              }}
            >
              <strong style={{ display: 'block', marginBottom: 2 }}>Catatan:</strong>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{purchase.notes}</p>
            </div>
          )}
        </div>

        <footer
          className="kitchen-modal-foot"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            {purchase.updatedAt && purchase.updatedAt !== purchase.createdAt && (
              <span className="muted" style={{ fontSize: '0.78rem' }}>
                Terakhir diedit: {formatDateTime(purchase.updatedAt)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {canEdit && onEdit && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  onClose();
                  onEdit(purchase);
                }}
              >
                <Icon name="edit" size={15} /> Edit Transaksi
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Tutup
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
