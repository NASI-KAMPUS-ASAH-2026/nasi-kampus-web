import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { BlockSkeleton, EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/ui/Badges';
import { useAsync } from '../../hooks/useAsync';
import { getOwnerOrders } from '../../services/api';
import { ORDER_STATUSES } from '../../data/orderStatus';
import { formatDateShort, number, rupiah } from '../../utils/format';

const PAGE_SIZE = 15;

export default function OwnerOrders() {
  const [params, setParams] = useSearchParams();
  const statusParam = params.get('status') || 'all';
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsync(
    () => getOwnerOrders({ q, status: statusParam, from, to }),
    [q, statusParam, from, to]
  );

  const list = data || [];
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [list, safePage]);
  const totalEstimated = useMemo(
    () => list.filter((o) => o.status !== 'Dibatalkan').reduce((s, o) => s + o.total, 0),
    [list]
  );

  const setStatus = (st) => {
    const next = new URLSearchParams(params);
    st === 'all' ? next.delete('status') : next.set('status', st);
    setParams(next, { replace: true });
    setPage(1);
  };

  const resetFilters = () => {
    setQ('');
    setFrom('');
    setTo('');
    setStatus('all');
    setPage(1);
  };

  const hasFilter = q.trim() || statusParam !== 'all' || from || to;

  return (
    <div className="owner-page">
      <header className="owner-page-head">
        <div>
          <h1>Daftar Pesanan</h1>
          <p className="muted">
            Telusuri dan kelola pesanan berdasarkan kode referensi, pelanggan, status, atau rentang tanggal.
          </p>
        </div>
      </header>

      <section className="panel owner-filter-panel" aria-label="Filter daftar pesanan">
        <div className="owner-filter-row">
          <div className="search" style={{ flex: '1 1 240px' }}>
            <Icon name="search" size={18} />
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Cari kode pesanan atau nama pelanggan…" aria-label="Cari kode pesanan atau nama pelanggan" />
            {q && (
              <button type="button" className="search-clear" onClick={() => { setQ(''); setPage(1); }} aria-label="Bersihkan pencarian">
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          {/* Dropdown Status Pesanan */}
          <div className="filter-select-wrap" style={{ minWidth: 210 }}>
            <select
              className="filter-select"
              value={statusParam}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter status pesanan"
            >
              <option value="all">Semua Status Pesanan</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.id}
                </option>
              ))}
            </select>
            <span className="filter-select-icon" aria-hidden="true">
              <Icon name="chevronDown" size={16} />
            </span>
          </div>

          <div className="date-filters">
            <label>
              <span>Dari tgl dibuat</span>
              <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </label>
            <label>
              <span>Sampai tgl dibuat</span>
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

      {loading && <BlockSkeleton h={380} label="Memuat daftar pesanan" />}
      {error && <ErrorState title="Daftar pesanan gagal dimuat" onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="results-bar" aria-live="polite">
            <span>
              Menampilkan <strong>{number(list.length)}</strong> pesanan · total aktif <strong>{rupiah(totalEstimated)}</strong>
            </span>
            <span>Halaman {safePage} dari {totalPages}</span>
          </div>

          {list.length === 0 ? (
            <EmptyState icon="search" title="Tidak ada pesanan yang cocok"
              text="Ubah kata kunci pencarian, status, atau rentang tanggal untuk menampilkan pesanan."
              action={{ label: 'Atur ulang filter', onClick: resetFilters }} />
          ) : (
            <div className="panel owner-card">
              <div tabIndex={0} role="region" aria-labelledby="orders-table-caption" className="table-wrapper">
                <table className="owner-table">
                  <caption id="orders-table-caption" className="sr-only">
                    Tabel daftar pesanan Nasi Kampus Samarinda
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Kode Referensi</th>
                      <th scope="col">Pelanggan</th>
                      <th scope="col">Tgl Dibuat</th>
                      <th scope="col">Tgl Dibutuhkan</th>
                      <th scope="col">Item & Porsi</th>
                      <th scope="col">Total</th>
                      <th scope="col">Status</th>
                      <th scope="col">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((o) => {
                      const portions = o.lines.reduce((s, l) => s + l.qty, 0);
                      return (
                        <tr key={o.id}>
                          <th scope="row">
                            <Link to={`/owner/orders/${o.id}`} className="code-link">{o.id}</Link>
                          </th>
                          <td data-label="Pelanggan">{o.customerAlias}</td>
                          <td data-label="Tgl Dibuat">{formatDateShort(o.createdDate)}</td>
                          <td data-label="Tgl Dibutuhkan">{formatDateShort(o.orderDate)}</td>
                          <td data-label="Item & Porsi">{o.lines.length} menu · {portions} porsi</td>
                          <td data-label="Total"><strong>{rupiah(o.total)}</strong></td>
                          <td data-label="Status"><StatusBadge status={o.status} size="sm" /></td>
                          <td data-label="Aksi">
                            <Link to={`/owner/orders/${o.id}`} className="btn btn-outline btn-xs">
                              Rincian <Icon name="chevronRight" size={14} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <nav className="pagination" aria-label="Navigasi halaman pesanan">
                  <button type="button" className="btn btn-outline btn-sm" disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <Icon name="chevronLeft" size={16} /> Sebelumnya
                  </button>
                  <span className="pagination-info">Halaman <strong>{safePage}</strong> / {totalPages}</span>
                  <button type="button" className="btn btn-outline btn-sm" disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    Berikutnya <Icon name="chevronRight" size={16} />
                  </button>
                </nav>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
