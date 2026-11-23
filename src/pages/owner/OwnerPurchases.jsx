import { useMemo, useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import { BlockSkeleton, EmptyState, ErrorState } from '../../components/States';
import { useToast } from '../../components/ui/Toast';
import { useAsync } from '../../hooks/useAsync';
import { getPurchases } from '../../services/api';
import { formatDateShort, number, rupiah } from '../../utils/format';
import PurchaseFormModal from '../../components/stock/PurchaseFormModal';
import PurchaseDetailModal from '../../components/stock/PurchaseDetailModal';

const PAGE_SIZE = 15;

export default function OwnerPurchases() {
  const { show } = useToast();
  const currentUser = { role: 'owner', name: 'Bapak Bayu (Owner)', userId: 1 };

  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const { data, loading, error, reload } = useAsync(
    () => getPurchases({ q, from, to }, currentUser),
    [q, from, to]
  );

  // Dengarkan event pembaruan transaksi pembelian
  useEffect(() => {
    const handlePurchasesUpdated = () => reload();
    window.addEventListener('nk_purchases_updated', handlePurchasesUpdated);
    return () => window.removeEventListener('nk_purchases_updated', handlePurchasesUpdated);
  }, [reload]);

  const list = data || [];
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [list, safePage]
  );

  const totalExpense = useMemo(() => {
    return list.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  }, [list]);

  const handleOpenAdd = () => {
    setEditingPurchase(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p) => {
    if (p.createdBy?.role !== 'owner') {
      show('Transaksi ini dicatat oleh Tim Dapur. Sesuai hak akses, hanya pencatat yang dapat mengeditnya.', {
        tone: 'warning',
      });
      return;
    }
    setEditingPurchase(p);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (p) => {
    setSelectedPurchase(p);
  };

  const resetFilters = () => {
    setQ('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const hasFilter = q.trim() || from || to;

  return (
    <div className="owner-page">
      {/* Header Halaman */}
      <header className="owner-page-head">
        <div>
          <h1>Riwayat Transaksi Pembelian Bahan</h1>
          <p className="muted">
            Pantau dan catat seluruh pengadaan bahan baku yang dilakukan oleh Owner maupun Tim Dapur.
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd} style={{ gap: 8 }}>
            <Icon name="plus" size={17} /> Catat Pembelian Bahan
          </button>
        </div>
      </header>

      {/* Tiga Kartu Ringkasan Pengadaan */}
      <section className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 20 }}>
        <article className="kpi-card">
          <div className="kpi-top">
            <span>Total Transaksi</span>
            <span className="kpi-ic kpi-ic--red"><Icon name="receipt" size={18} /></span>
          </div>
          <strong className="kpi-val">{list.length}</strong>
          <span className="kpi-sub">Transaksi tercatat</span>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span>Total Nilai Pembelian</span>
            <span className="kpi-ic kpi-ic--orange"><Icon name="wallet" size={18} /></span>
          </div>
          <strong className="kpi-val" style={{ color: 'var(--brand-red)' }}>{rupiah(totalExpense)}</strong>
          <span className="kpi-sub">Sesuai data filter aktif</span>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span>Rata-rata per Transaksi</span>
            <span className="kpi-ic kpi-ic--ok"><Icon name="chart" size={18} /></span>
          </div>
          <strong className="kpi-val">
            {list.length ? rupiah(Math.round(totalExpense / list.length)) : 'Rp 0'}
          </strong>
          <span className="kpi-sub">Efisiensi belanja bahan</span>
        </article>
      </section>

      {/* Filter & Pencarian */}
      <section className="panel owner-filter-panel" aria-label="Filter riwayat pembelian">
        <div className="owner-filter-row">
          <div className="search">
            <Icon name="search" size={18} />
            <input
              type="search"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Cari kode transaksi, toko/pemasok, bahan, atau pencatat..."
              aria-label="Cari transaksi pembelian"
            />
            {q && (
              <button
                type="button"
                className="search-clear"
                onClick={() => { setQ(''); setPage(1); }}
                aria-label="Bersihkan pencarian"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          <div className="date-filters">
            <label>
              <span>Dari tanggal</span>
              <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </label>
            <label>
              <span>Sampai tanggal</span>
              <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </label>
            {hasFilter && (
              <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>
                Atur Ulang
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tabel Riwayat Transaksi */}
      {loading && <BlockSkeleton h={380} label="Memuat riwayat transaksi pembelian" />}
      {error && <ErrorState title="Gagal memuat riwayat pembelian" onRetry={reload} />}

      {!loading && !error && list.length === 0 && (
        <EmptyState
          title={hasFilter ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi pembelian'}
          description={
            hasFilter
              ? 'Silakan ubah kata kunci pencarian atau sesuaikan rentang tanggal.'
              : 'Klik tombol Catat Pembelian Bahan di atas untuk memasukkan pengadaan bahan pertama.'
          }
          action={
            hasFilter ? (
              <button type="button" className="btn btn-outline" onClick={resetFilters}>
                Bersihkan Filter
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
                <Icon name="plus" size={16} /> Catat Pembelian Pertama
              </button>
            )
          }
        />
      )}

      {!loading && !error && list.length > 0 && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="owner-table">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Kode Transaksi</th>
                  <th>Tanggal Beli</th>
                  <th>Toko / Pemasok</th>
                  <th style={{ textAlign: 'center' }}>Jenis Bahan</th>
                  <th style={{ textAlign: 'right' }}>Total Pembelian</th>
                  <th>Dicatat Oleh</th>
                  <th style={{ textAlign: 'center', width: 170 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => {
                  const isOwnerCreator = p.createdBy?.role === 'owner';
                  return (
                    <tr key={p.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="link-btn"
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            background: 'transparent',
                            border: 0,
                            padding: 0,
                            cursor: 'pointer',
                            color: 'var(--brand-red)',
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => handleOpenDetail(p)}
                        >
                          {p.id}
                        </button>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.88rem' }}>{formatDateShort(p.purchaseDate)}</span>
                      </td>
                      <td>
                        <strong>{p.supplier}</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge--neutral" style={{ fontSize: '0.78rem' }}>
                          {(p.items || []).length} Item
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-red)', whiteSpace: 'nowrap' }}>
                        {rupiah(p.total)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                            {p.createdBy?.name || '—'}
                          </span>
                          <span
                            className={`badge ${isOwnerCreator ? 'badge--info' : 'badge--warning'}`}
                            style={{ fontSize: '0.7rem', width: 'fit-content' }}
                          >
                            {isOwnerCreator ? 'Owner / Admin' : 'Tim Dapur'}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenDetail(p)}
                            title="Lihat rincian transaksi"
                            aria-label={`Rincian ${p.id}`}
                            style={{ minWidth: 68, justifyContent: 'center' }}
                          >
                            Rincian
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit transaksi"
                            aria-label={`Edit ${p.id}`}
                            style={{ minWidth: 56, justifyContent: 'center' }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <footer
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                borderTop: '1px solid var(--color-border)',
                fontSize: '0.86rem',
              }}
            >
              <span className="muted">
                Menampilkan {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, list.length)} dari {list.length} transaksi
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Icon name="chevronLeft" size={15} /> Sebelumnya
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Berikutnya <Icon name="chevronRight" size={15} />
                </button>
              </div>
            </footer>
          )}
        </div>
      )}

      {/* Modal Form Tambah / Edit Pembelian */}
      <PurchaseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        purchase={editingPurchase}
        currentUser={currentUser}
        onSuccess={reload}
      />

      {/* Modal Rincian Pembelian */}
      <PurchaseDetailModal
        isOpen={Boolean(selectedPurchase)}
        onClose={() => setSelectedPurchase(null)}
        purchase={selectedPurchase}
        currentUser={currentUser}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
