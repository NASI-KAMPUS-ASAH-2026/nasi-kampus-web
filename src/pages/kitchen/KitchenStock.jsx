import { useMemo, useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import { BlockSkeleton, EmptyState, ErrorState } from '../../components/States';
import { useToast } from '../../components/ui/Toast';
import { useAsync } from '../../hooks/useAsync';
import {
  getIngredients,
  getPurchases,
  INGREDIENT_CATEGORIES,
} from '../../services/api';
import { formatDateShort, rupiah } from '../../utils/format';
import PurchaseFormModal from '../../components/stock/PurchaseFormModal';
import PurchaseDetailModal from '../../components/stock/PurchaseDetailModal';

export default function KitchenStock({ defaultTab = 'stock' }) {
  const { show } = useToast();
  const kitchenUser = { role: 'kitchen', name: 'Tim Dapur', userId: 2 };

  // Filter Bahan
  const [ingQuery, setIngQuery] = useState('');
  const [ingCategory, setIngCategory] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Filter Pembelian
  const [txQuery, setTxQuery] = useState('');
  const [txFrom, setTxFrom] = useState('');
  const [txTo, setTxTo] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Ambil data bahan (read-only untuk dapur)
  const {
    data: ingredients,
    loading: ingredientsLoading,
    error: ingredientsError,
    reload: reloadIngredients,
  } = useAsync(
    () => getIngredients({ q: ingQuery, category: ingCategory, lowStockOnly }),
    [ingQuery, ingCategory, lowStockOnly]
  );

  // Ambil riwayat pembelian (Hanya transaksi milik Tim Dapur)
  const {
    data: purchases,
    loading: purchasesLoading,
    error: purchasesError,
    reload: reloadPurchases,
  } = useAsync(
    () => getPurchases({ q: txQuery, from: txFrom, to: txTo }, kitchenUser),
    [txQuery, txFrom, txTo]
  );

  // Event listener pembaruan otomatis lintas tab
  useEffect(() => {
    const handleStockUpdate = () => reloadIngredients();
    const handlePurchasesUpdate = () => {
      reloadIngredients();
      reloadPurchases();
    };

    window.addEventListener('nk_stock_updated', handleStockUpdate);
    window.addEventListener('nk_purchases_updated', handlePurchasesUpdate);
    return () => {
      window.removeEventListener('nk_stock_updated', handleStockUpdate);
      window.removeEventListener('nk_purchases_updated', handlePurchasesUpdate);
    };
  }, [reloadIngredients, reloadPurchases]);

  const ingList = ingredients || [];
  const txList = purchases || [];

  // Metrik KPI
  const metrics = useMemo(() => {
    const totalIngredients = ingList.length;
    const lowStockCount = ingList.filter((i) => Number(i.currentStock) <= Number(i.minStock)).length;
    const totalSpentKitchen = txList.reduce((s, p) => s + (Number(p.total) || 0), 0);
    return { totalIngredients, lowStockCount, totalSpentKitchen, txCount: txList.length };
  }, [ingList, txList]);

  const handleOpenAddPurchase = () => {
    setEditingPurchase(null);
    setIsFormOpen(true);
  };

  const handleOpenEditPurchase = (p) => {
    setEditingPurchase(p);
    setIsFormOpen(true);
  };

  const isStockPage = defaultTab === 'stock';

  return (
    <div className="owner-page">
      {/* Header Halaman */}
      <header className="kitchen-head" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1>{isStockPage ? 'Stok Bahan Baku Dapur' : 'Riwayat Pembelian Tim Dapur'}</h1>
            <p>
              {isStockPage
                ? 'Pantau ketersediaan stok bahan dan batas minimum untuk persiapan hidangan dapur.'
                : 'Daftar transaksi belanja bahan baku yang dicatat oleh Tim Dapur.'}
            </p>
          </div>
          {!isStockPage && (
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenAddPurchase}
                style={{ gap: 8 }}
              >
                <Icon name="plus" size={17} /> Catat Pembelian Bahan
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Kartu Metrik Ringkas */}
      <section className="kitchen-kpi-grid" style={{ marginBottom: 20 }} aria-label="Statistik bahan dan pembelian dapur">
        {isStockPage ? (
          <>
            <article className="kitchen-kpi-card">
              <div className="kitchen-kpi-top">
                <span>Jenis Bahan Terdaftar</span>
                <span className="kpi-ic kpi-ic--red"><Icon name="box" size={18} /></span>
              </div>
              <strong className="kitchen-kpi-val">{metrics.totalIngredients}</strong>
              <span className="kitchen-kpi-sub">Katalog master bahan</span>
            </article>

            <article className="kitchen-kpi-card">
              <div className="kitchen-kpi-top">
                <span>Bahan Stok Rendah</span>
                <span className="kpi-ic kpi-ic--warn"><Icon name="alert" size={18} /></span>
              </div>
              <strong
                className="kitchen-kpi-val"
                style={{ color: metrics.lowStockCount > 0 ? 'var(--color-error)' : 'inherit' }}
              >
                {metrics.lowStockCount}
              </strong>
              <span className="kitchen-kpi-sub">Di bawah atau sama dengan batas minimum</span>
            </article>
          </>
        ) : (
          <article className="kitchen-kpi-card">
            <div className="kitchen-kpi-top">
              <span>Belanja Bahan Tim Dapur</span>
              <span className="kpi-ic kpi-ic--ok"><Icon name="wallet" size={18} /></span>
            </div>
            <strong className="kitchen-kpi-val" style={{ color: 'var(--brand-red)' }}>
              {rupiah(metrics.totalSpentKitchen)}
            </strong>
            <span className="kitchen-kpi-sub">{metrics.txCount} transaksi tercatat</span>
          </article>
        )}
      </section>

      {/* TAB 1: DAFTAR BAHAN & STOK (READ-ONLY UNTUK DAPUR) */}
      {isStockPage && (
        <section aria-label="Daftar stok bahan dapur">
          {/* Panel Filter Bahan */}
          <div className="panel owner-filter-panel" style={{ marginBottom: 16 }}>
            <div className="owner-filter-row">
              <div className="search" style={{ flex: '1 1 240px' }}>
                <Icon name="search" size={18} />
                <input
                  type="search"
                  value={ingQuery}
                  onChange={(e) => setIngQuery(e.target.value)}
                  placeholder="Cari nama bahan dapur..."
                  aria-label="Cari nama bahan"
                />
                {ingQuery && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setIngQuery('')}
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
                  value={ingCategory}
                  onChange={(e) => setIngCategory(e.target.value)}
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
                  onChange={(e) => setLowStockOnly(e.target.value === 'low')}
                  aria-label="Pilih status ketersediaan stok"
                >
                  <option value="all">Semua Status Stok</option>
                  <option value="low">⚠️ Hanya Stok Rendah</option>
                </select>
                <span className="filter-select-icon" aria-hidden="true">
                  <Icon name="chevronDown" size={16} />
                </span>
              </div>

              {(ingQuery || ingCategory !== 'all' || lowStockOnly) && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => { setIngQuery(''); setIngCategory('all'); setLowStockOnly(false); }}
                >
                  Atur Ulang Filter
                </button>
              )}
            </div>
          </div>

          {/* Tabel Bahan */}
          {ingredientsLoading && <BlockSkeleton h={320} label="Memuat stok bahan" />}
          {ingredientsError && <ErrorState title="Gagal memuat stok bahan" onRetry={reloadIngredients} />}

          {!ingredientsLoading && !ingredientsError && ingList.length === 0 && (
            <EmptyState
              title="Tidak ada bahan yang sesuai"
              description="Coba ubah kata kunci pencarian atau sesuaikan pilihan kategori bahan."
            />
          )}

          {!ingredientsLoading && !ingredientsError && ingList.length > 0 && (
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
                      <th style={{ textAlign: 'center', width: 140 }}>Status Ketersediaan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingList.map((ing) => {
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
                                <Icon name="alert" size={12} /> Perlu Pembelian
                              </span>
                            ) : (
                              <span className="badge badge--success" style={{ fontSize: '0.82rem', padding: '3px 10px', gap: 4, display: 'inline-flex', alignItems: 'center' }}>
                                <Icon name="check" size={12} /> Cukup
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: RIWAYAT PEMBELIAN TIM DAPUR */}
      {!isStockPage && (
        <section aria-label="Riwayat pembelian bahan tim dapur">
          {/* Panel Filter Pembelian */}
          <div className="panel owner-filter-panel" style={{ marginBottom: 16 }}>
            <div className="owner-filter-row">
              <div className="search">
                <Icon name="search" size={18} />
                <input
                  type="search"
                  value={txQuery}
                  onChange={(e) => setTxQuery(e.target.value)}
                  placeholder="Cari kode transaksi, toko/pemasok, atau bahan..."
                  aria-label="Cari transaksi pembelian dapur"
                />
                {txQuery && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setTxQuery('')}
                    aria-label="Bersihkan pencarian"
                  >
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>

              <div className="date-filters">
                <label>
                  <span>Dari tanggal</span>
                  <input type="date" value={txFrom} onChange={(e) => setTxFrom(e.target.value)} />
                </label>
                <label>
                  <span>Sampai tanggal</span>
                  <input type="date" value={txTo} onChange={(e) => setTxTo(e.target.value)} />
                </label>
                {(txQuery || txFrom || txTo) && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => { setTxQuery(''); setTxFrom(''); setTxTo(''); }}
                  >
                    Atur Ulang
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabel Transaksi Pembelian Dapur */}
          {purchasesLoading && <BlockSkeleton h={320} label="Memuat riwayat pembelian" />}
          {purchasesError && <ErrorState title="Gagal memuat pembelian" onRetry={reloadPurchases} />}

          {!purchasesLoading && !purchasesError && txList.length === 0 && (
            <EmptyState
              title={txQuery || txFrom || txTo ? 'Tidak ada transaksi yang cocok' : 'Belum ada pembelian oleh Tim Dapur'}
              description={
                txQuery || txFrom || txTo
                  ? 'Ubah kata kunci pencarian atau sesuaikan rentang tanggal.'
                  : 'Klik tombol Catat Pembelian Bahan di atas untuk mencatat belanja bahan dapur.'
              }
              action={
                <button type="button" className="btn btn-primary" onClick={handleOpenAddPurchase}>
                  <Icon name="plus" size={16} /> Catat Pembelian Sekarang
                </button>
              }
            />
          )}

          {!purchasesLoading && !purchasesError && txList.length > 0 && (
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>Kode Transaksi</th>
                      <th>Tanggal Pembelian</th>
                      <th>Toko / Pemasok</th>
                      <th style={{ textAlign: 'center' }}>Jumlah Jenis Bahan</th>
                      <th style={{ textAlign: 'right' }}>Total Belanja</th>
                      <th style={{ textAlign: 'center', width: 170 }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txList.map((p) => (
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
                            onClick={() => setSelectedPurchase(p)}
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
                          <span className="badge badge--neutral" style={{ fontSize: '0.76rem' }}>
                            {(p.items || []).length} Item
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-red)', whiteSpace: 'nowrap' }}>
                          {rupiah(p.total)}
                        </td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              onClick={() => setSelectedPurchase(p)}
                              title="Lihat rincian transaksi"
                              aria-label={`Rincian ${p.id}`}
                              style={{ minWidth: 68, justifyContent: 'center' }}
                            >
                              Rincian
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              onClick={() => handleOpenEditPurchase(p)}
                              title="Edit transaksi pembelian"
                              aria-label={`Edit ${p.id}`}
                              style={{ minWidth: 56, justifyContent: 'center' }}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Modal Form Tambah / Edit Pembelian */}
      <PurchaseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        purchase={editingPurchase}
        currentUser={kitchenUser}
        onSuccess={() => {
          reloadIngredients();
          reloadPurchases();
        }}
      />

      {/* Modal Rincian Pembelian */}
      <PurchaseDetailModal
        isOpen={Boolean(selectedPurchase)}
        onClose={() => setSelectedPurchase(null)}
        purchase={selectedPurchase}
        currentUser={kitchenUser}
        onEdit={handleOpenEditPurchase}
      />
    </div>
  );
}
