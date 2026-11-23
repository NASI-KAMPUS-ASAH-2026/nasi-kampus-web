import { useMemo, useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import { BlockSkeleton, EmptyState, ErrorState } from '../../components/States';
import { useToast } from '../../components/ui/Toast';
import { useAsync } from '../../hooks/useAsync';
import {
  getIngredients,
  deleteIngredient,
  INGREDIENT_CATEGORIES,
} from '../../services/api';
import IngredientFormModal from '../../components/stock/IngredientFormModal';

const PAGE_SIZE = 15;

export default function OwnerIngredients() {
  const { show } = useToast();

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [deletingIngredient, setDeletingIngredient] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () => getIngredients({ q, category, lowStockOnly }),
    [q, category, lowStockOnly]
  );

  // Dengarkan event pembaruan stok
  useEffect(() => {
    const handleStockUpdate = () => reload();
    window.addEventListener('nk_stock_updated', handleStockUpdate);
    return () => window.removeEventListener('nk_stock_updated', handleStockUpdate);
  }, [reload]);

  const list = data || [];
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [list, safePage]
  );

  // Hitung metrik ringkas
  const metrics = useMemo(() => {
    const total = list.length;
    const lowStock = list.filter((i) => Number(i.currentStock) <= Number(i.minStock)).length;
    const safe = total - lowStock;
    return { total, lowStock, safe };
  }, [list]);

  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ing) => {
    setEditingIngredient(ing);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingIngredient) return;
    setDeleteLoading(true);
    try {
      await deleteIngredient(deletingIngredient.id);
      show(`Bahan "${deletingIngredient.name}" berhasil dihapus.`, { tone: 'success' });
      setDeletingIngredient(null);
      reload();
    } catch (err) {
      show(err?.message || 'Gagal menghapus bahan.', { tone: 'error' });
      setDeletingIngredient(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetFilters = () => {
    setQ('');
    setCategory('all');
    setLowStockOnly(false);
    setPage(1);
  };

  const hasFilter = q.trim() || category !== 'all' || lowStockOnly;

  return (
    <div className="owner-page">
      {/* Header Halaman */}
      <header className="owner-page-head">
        <div>
          <h1>Master Bahan &amp; Pengelolaan Stok</h1>
          <p className="muted">
            Kelola daftar bahan baku, kategori, satuan standar, dan batas minimum indikator stok dapur.
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd} style={{ gap: 8 }}>
            <Icon name="plus" size={17} /> Tambah Bahan Baru
          </button>
        </div>
      </header>

      {/* Tiga Kartu Metrik Ringkas */}
      <section className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 20 }}>
        <article className="kpi-card">
          <div className="kpi-top">
            <span>Total Jenis Bahan</span>
            <span className="kpi-ic kpi-ic--red"><Icon name="box" size={18} /></span>
          </div>
          <strong className="kpi-val">{metrics.total}</strong>
          <span className="kpi-sub">Terdaftar di master bahan</span>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span>Stok Terpenuhi (Aman)</span>
            <span className="kpi-ic kpi-ic--ok"><Icon name="check" size={18} /></span>
          </div>
          <strong className="kpi-val">{metrics.safe}</strong>
          <span className="kpi-sub">Di atas batas minimum</span>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span>Stok Rendah</span>
            <span className="kpi-ic kpi-ic--warn"><Icon name="alert" size={18} /></span>
          </div>
          <strong className="kpi-val" style={{ color: metrics.lowStock > 0 ? 'var(--color-error)' : 'inherit' }}>
            {metrics.lowStock}
          </strong>
          <span className="kpi-sub">Perlu segera dilakukan pembelian</span>
        </article>
      </section>

      {/* Filter & Pencarian */}
      <section className="panel owner-filter-panel" aria-label="Filter master bahan">
        <div className="owner-filter-row">
          <div className="search" style={{ flex: '1 1 240px' }}>
            <Icon name="search" size={18} />
            <input
              type="search"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Cari nama bahan..."
              aria-label="Cari nama bahan"
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

          {/* Dropdown Kategori Bahan */}
          <div className="filter-select-wrap" style={{ minWidth: 200 }}>
            <select
              className="filter-select"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              aria-label="Pilih kategori bahan"
            >
              <option value="all">Semua Kategori</option>
              {INGREDIENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="filter-select-icon" aria-hidden="true">
              <Icon name="chevronDown" size={16} />
            </span>
          </div>

          {/* Dropdown Status Stok */}
          <div className="filter-select-wrap" style={{ minWidth: 190 }}>
            <select
              className="filter-select"
              value={lowStockOnly ? 'low' : 'all'}
              onChange={(e) => { setLowStockOnly(e.target.value === 'low'); setPage(1); }}
              aria-label="Pilih status ketersediaan stok"
            >
              <option value="all">Semua Status Stok</option>
              <option value="low">⚠️ Hanya Stok Rendah</option>
            </select>
            <span className="filter-select-icon" aria-hidden="true">
              <Icon name="chevronDown" size={16} />
            </span>
          </div>

          {hasFilter && (
            <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>
              Atur Ulang Filter
            </button>
          )}
        </div>
      </section>

      {/* Konten Tabel */}
      {loading && <BlockSkeleton h={380} label="Memuat master bahan" />}
      {error && <ErrorState title="Gagal memuat master bahan" onRetry={reload} />}

      {!loading && !error && list.length === 0 && (
        <EmptyState
          title={hasFilter ? 'Tidak ada bahan yang cocok' : 'Belum ada bahan di master bahan'}
          description={
            hasFilter
              ? 'Coba sesuaikan kata kunci pencarian atau bersihkan filter kategori.'
              : 'Klik tombol Tambah Bahan Baru di atas untuk mulai mendaftarkan bahan baku.'
          }
          action={
            hasFilter ? (
              <button type="button" className="btn btn-outline" onClick={resetFilters}>
                Bersihkan Filter
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
                <Icon name="plus" size={16} /> Tambah Bahan Pertama
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
                  <th style={{ width: 95 }}>Kode</th>
                  <th>Nama Bahan</th>
                  <th>Kategori</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Satuan</th>
                  <th style={{ textAlign: 'center', width: 120 }}>Stok Saat Ini</th>
                  <th style={{ textAlign: 'center', width: 120 }}>Batas Minimum</th>
                  <th style={{ textAlign: 'center', width: 130 }}>Status Stok</th>
                  <th style={{ textAlign: 'center', width: 150 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((ing) => {
                  const isLow = Number(ing.currentStock) <= Number(ing.minStock);
                  return (
                    <tr key={ing.id}>
                      <td>
                        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                          {ing.id}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                          {ing.name}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge--neutral" style={{ fontSize: '0.82rem', padding: '3px 10px', fontWeight: 500 }}>
                          {ing.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                          {ing.unit}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: isLow ? 'var(--color-error)' : 'var(--color-text-main)',
                          }}
                        >
                          {ing.currentStock} {ing.unit}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                          {ing.minStock} {ing.unit}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isLow ? (
                          <span className="badge badge--error" style={{ fontSize: '0.82rem', padding: '3px 10px', gap: 4, display: 'inline-flex', alignItems: 'center' }}>
                            <Icon name="alert" size={12} /> Stok Rendah
                          </span>
                        ) : (
                          <span className="badge badge--success" style={{ fontSize: '0.82rem', padding: '3px 10px', gap: 4, display: 'inline-flex', alignItems: 'center' }}>
                            <Icon name="check" size={12} /> Normal
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenEdit(ing)}
                            title="Edit informasi bahan"
                            aria-label={`Edit ${ing.name}`}
                            style={{ gap: 4, fontSize: '0.82rem' }}
                          >
                            <Icon name="edit" size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            style={{ color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.3)', gap: 4, fontSize: '0.82rem' }}
                            onClick={() => setDeletingIngredient(ing)}
                            title="Hapus bahan"
                            aria-label={`Hapus ${ing.name}`}
                          >
                            <Icon name="trash" size={13} /> Hapus
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
                {Math.min(safePage * PAGE_SIZE, list.length)} dari {list.length} bahan
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

      {/* Modal Form Tambah / Edit Bahan */}
      <IngredientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        ingredient={editingIngredient}
        onSuccess={reload}
      />

      {/* Dialog Konfirmasi Hapus Bahan */}
      {deletingIngredient && (
        <div className="kitchen-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="del-modal-title">
          <div className="kitchen-modal" style={{ maxWidth: 460 }}>
            <header className="kitchen-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="kpi-ic kpi-ic--red" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                  <Icon name="alert" size={17} />
                </span>
                <h2 id="del-modal-title">Hapus Bahan dari Master</h2>
              </div>
              <button type="button" className="owner-close-btn" onClick={() => setDeletingIngredient(null)}>
                <Icon name="close" size={20} />
              </button>
            </header>

            <div className="kitchen-modal-body" style={{ gap: 12 }}>
              <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
                Apakah Anda yakin ingin menghapus bahan <strong>"{deletingIngredient.name}"</strong>?
              </p>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.84rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <strong>Catatan Keamanan:</strong> Bahan yang telah digunakan dalam transaksi pembelian tidak akan dapat dihapus untuk melindungi integritas riwayat keuangan.
              </div>
            </div>

            <footer className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeletingIngredient(null)}
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Icon name="loader" size={16} /> Menghapus...
                  </>
                ) : (
                  <>
                    <Icon name="trash" size={16} /> Ya, Hapus Bahan
                  </>
                )}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
