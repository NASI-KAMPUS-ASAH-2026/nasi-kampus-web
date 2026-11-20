import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import Icon from '../../components/Icon';
import { EmptyState, ErrorState, GridSkeleton } from '../../components/States';
import Reveal from '../../components/ui/Reveal';
import { useAsync } from '../../hooks/useAsync';
import { getProducts } from '../../services/api';
import { CATEGORIES, categoryLabel } from '../../data/products';

const SORTS = [
  { id: 'default', label: 'Urutan Paket' },
  { id: 'best', label: 'Best Seller Dahulu' },
  { id: 'price-asc', label: 'Harga Terendah' },
  { id: 'price-desc', label: 'Harga Tertinggi' },
];

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('kategori');
  const cat = CATEGORIES.some((c) => c.id === raw) ? raw : 'all';
  const queryParam = params.get('q') || '';
  const [q, setQ] = useState(queryParam);
  const [sort, setSort] = useState('default');
  const { data, loading, error, reload } = useAsync(getProducts, []);

  // Sinkronkan pencarian bila query parameter di URL berubah (misal dari form navbar)
  useEffect(() => {
    setQ(params.get('q') || '');
  }, [params]);

  const counts = useMemo(() => {
    const all = data || [];
    return {
      all: all.length,
      'nasi-box': all.filter((p) => p.category === 'nasi-box').length,
      'snack-box': all.filter((p) => p.category === 'snack-box').length,
    };
  }, [data]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = (data || []).filter(
      (p) =>
        (cat === 'all' || p.category === cat) &&
        (!term ||
          (p.name + ' ' + p.description + ' ' + (p.packaging || '') + ' ' + (p.items || []).join(' '))
            .toLowerCase()
            .includes(term))
    );
    const arr = [...filtered];
    if (sort === 'best') arr.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || a.price - b.price);
    else if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [data, cat, q, sort]);

  const nasiList = useMemo(() => list.filter((p) => p.category === 'nasi-box'), [list]);
  const snackList = useMemo(() => list.filter((p) => p.category === 'snack-box'), [list]);

  const setCat = (id) => {
    const next = new URLSearchParams(params);
    id === 'all' ? next.delete('kategori') : next.set('kategori', id);
    setParams(next, { replace: true });
  };

  const handleSearchChange = (val) => {
    setQ(val);
    const next = new URLSearchParams(params);
    if (val.trim()) {
      next.set('q', val.trim());
    } else {
      next.delete('q');
    }
    setParams(next, { replace: true });
  };

  const reset = () => {
    setQ('');
    setSort('default');
    setParams(new URLSearchParams(), { replace: true });
  };
  const hasActiveFilter = cat !== 'all' || q.trim().length > 0 || sort !== 'default';

  return (
    <div className="menu-page">
      <section className="menu-hero-band" aria-labelledby="catalog-title">
        <div className="container">
          <div className="gourmet-head">
            <h1 id="catalog-title" className="bracket-title">
              <span>Pilihan <em>Menu Kami</em></span>
            </h1>
            <p>
              Tersedia 8 pilihan Paket Nasi Kotak (mulai Rp 12.000) dan 6 pilihan Snack Box (mulai Rp 5.000). Pilih kategori atau cari isi menu di bawah ini.
            </p>

            <div className="cat-columns" role="tablist" aria-label="Filter kategori menu">
              {CATEGORIES.map((c) => {
                const isActive = cat === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`cat-col${isActive ? ' is-active' : ''}`}
                    onClick={() => setCat(c.id)}
                  >
                    <span className="cat-col-title">{c.label}</span>
                    <span className="cat-col-count">{counts[c.id]} Pilihan</span>
                    {isActive && <span className="cat-col-bar" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="container page">
        <div className="toolbar" role="region" aria-label="Pencarian dan pengurutan menu">
          <div className="search">
            <Icon name="search" size={18} />
            <input
              type="search"
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari paket, lauk, atau minuman…"
              aria-label="Cari paket atau isi menu"
            />
            {q && (
              <button type="button" className="search-clear" onClick={() => handleSearchChange('')} aria-label="Hapus kata pencarian">
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          <div className="toolbar-right">
            <label className="sort-select">
              <span className="sr-only">Urutkan menu</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan menu">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
            {hasActiveFilter && (
              <button type="button" className="btn btn-outline btn-sm" onClick={reset}>
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {!loading && !error && (
          <div className="results-bar" aria-live="polite">
            <span>
              Menampilkan <strong>{list.length}</strong> pilihan paket
              {cat !== 'all' ? ` dalam kategori ${categoryLabel(cat)}` : ''}
              {q.trim() ? ` untuk pencarian "${q.trim()}"` : ''}
            </span>
          </div>
        )}

        {loading && <GridSkeleton n={6} />}
        {error && <ErrorState title="Menu gagal dimuat" onRetry={reload} />}
        {!loading && !error && (
          list.length ? (
            cat === 'all' ? (
              <div className="menu-sections-wrapper">
                {/* 1. SEKSI PAKET NASI KOTAK */}
                {nasiList.length > 0 && (
                  <section className="menu-group-section" aria-labelledby="heading-nasi-section">
                    <div className="menu-group-header">
                      <div className="menu-group-copy">
                        <span className="menu-group-pill">Kategori 1</span>
                        <h2 id="heading-nasi-section" className="menu-group-title">
                          Paket Nasi Kotak
                        </h2>
                        <p className="menu-group-desc">
                          Sajian nasi hangat komplit dengan ayam krispi, ayam bumbu serundeng, lalapan segar, sambal nikmat, dan kemasan higienis.
                        </p>
                      </div>
                      <span className="menu-group-count">{nasiList.length} Pilihan Menu</span>
                    </div>

                    <div className="collection-grid-2col">
                      {nasiList.map((p) => (
                        <Reveal key={p.id} className="grid-item">
                          <ProductCard product={p} />
                        </Reveal>
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. SEKSI PILIHAN SNACK BOX */}
                {snackList.length > 0 && (
                  <section className="menu-group-section menu-group-section--snack" aria-labelledby="heading-snack-section">
                    <div className="menu-group-header">
                      <div className="menu-group-copy">
                        <span className="menu-group-pill">Kategori 2</span>
                        <h2 id="heading-snack-section" className="menu-group-title">
                          Pilihan Snack Box
                        </h2>
                        <p className="menu-group-desc">
                          Kombinasi kue basah, roti, pastel, pie buah, permen, dan air mineral higienis. Praktis untuk seminar kampus, rapat, dan pengajian.
                        </p>
                      </div>
                      <span className="menu-group-count">{snackList.length} Pilihan Menu</span>
                    </div>

                    <div className="collection-grid-2col">
                      {snackList.map((p) => (
                        <Reveal key={p.id} className="grid-item">
                          <ProductCard product={p} />
                        </Reveal>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              /* Kategori Spesifik (Hanya Nasi Kotak atau Hanya Snack Box) */
              <div className="collection-grid-2col">
                {list.map((p) => (
                  <Reveal key={p.id} className="grid-item">
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon="search"
              title="Menu tidak ditemukan"
              text="Tidak ada paket yang cocok dengan kata pencarian atau kategori yang dipilih."
              action={{ label: 'Tampilkan Semua Menu', onClick: reset }}
            />
          )
        )}
      </div>
    </div>
  );
}
