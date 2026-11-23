import { useState, useMemo, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import Icon from '../../components/Icon';
import { rupiah, formatDate, formatDateShort } from '../../utils/format';
import { AdminStatusBadge, PaymentBadge } from '../../components/ui/Badges';
import { ADMIN_ORDER_STATUSES, ADMIN_PAYMENT_STATUSES } from '../../data/adminDummyData';
import { products } from '../../data/products';

export default function AdminOrders() {
  const { orders, setOrders } = useOutletContext();
  const location = useLocation();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [pickupDateFilter, setPickupDateFilter] = useState('');

  // Selected Order for Detail Modal
  const [activeOrder, setActiveOrder] = useState(null);

  // Modal States
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Form State
  const [editPickupDate, setEditPickupDate] = useState('');
  const [editPickupTime, setEditPickupTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [editChangeNote, setEditChangeNote] = useState('');

  // Handle location state passed from Dashboard
  useEffect(() => {
    if (location.state?.filter) {
      if (location.state.filter === 'today') {
        setOrderDateFilter(new Date().toISOString().slice(0, 10));
      } else if (ADMIN_ORDER_STATUSES.includes(location.state.filter)) {
        setStatusFilter(location.state.filter);
      } else if (ADMIN_PAYMENT_STATUSES.includes(location.state.filter)) {
        setPaymentFilter(location.state.filter);
      }
    }
    if (location.state?.openOrder) {
      const found = orders.find(o => o.id === location.state.openOrder);
      if (found) setActiveOrder(found);
    }
  }, [location.state, orders]);

  // Keep activeOrder in sync with orders list
  useEffect(() => {
    if (activeOrder) {
      const refreshed = orders.find(o => o.id === activeOrder.id);
      if (refreshed) setActiveOrder(refreshed);
    }
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (search) {
        const q = search.toLowerCase();
        const matchCode = o.id.toLowerCase().includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (paymentFilter !== 'ALL' && o.paymentStatus !== paymentFilter) return false;
      if (orderDateFilter && o.orderDate !== orderDateFilter) return false;
      if (pickupDateFilter && o.pickupDate !== pickupDateFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter, paymentFilter, orderDateFilter, pickupDateFilter]);

  // Handlers
  const handleConfirmOrder = () => {
    if (!activeOrder) return;
    setOrders(prev => prev.map(o => {
      if (o.id !== activeOrder.id) return o;
      return {
        ...o,
        status: 'Dikonfirmasi',
        editHistory: [
          ...o.editHistory,
          {
            changedAt: new Date().toISOString(),
            description: 'Pesanan telah dikonfirmasi oleh Admin.',
          },
        ],
      };
    }));
    setShowConfirmDialog(false);
  };

  const handleRejectOrder = () => {
    if (!activeOrder) return;
    setOrders(prev => prev.map(o => {
      if (o.id !== activeOrder.id) return o;
      return {
        ...o,
        status: 'Ditolak',
        editHistory: [
          ...o.editHistory,
          {
            changedAt: new Date().toISOString(),
            description: `Pesanan ditolak oleh Admin. Alasan: ${rejectReason || 'Tidak ada alasan khusus.'}`,
          },
        ],
      };
    }));
    setShowRejectDialog(false);
    setRejectReason('');
  };

  // Open Edit Modal
  const openEditModal = (order) => {
    setEditPickupDate(order.pickupDate);
    setEditPickupTime(order.pickupTime || '10:00');
    setEditNotes(order.notes || '');
    setEditItems(order.items.map(it => ({ ...it })));
    setEditChangeNote('');
    setShowEditModal(true);
  };

  // Edit Modal Item Operations
  const handleItemQtyChange = (index, newQty) => {
    const qty = Math.max(1, parseInt(newQty, 10) || 1);
    setEditItems(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        qty,
        subtotal: qty * next[index].unitPrice,
      };
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    if (editItems.length <= 1) {
      alert('Minimal harus ada 1 item dalam pesanan.');
      return;
    }
    setEditItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddItem = (e) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    setEditItems(prev => {
      const existingIdx = prev.findIndex(it => it.menuName === prod.name);
      if (existingIdx >= 0) {
        const next = [...prev];
        const newQty = next[existingIdx].qty + 1;
        next[existingIdx] = {
          ...next[existingIdx],
          qty: newQty,
          subtotal: newQty * next[existingIdx].unitPrice,
        };
        return next;
      }
      return [
        ...prev,
        {
          menuName: prod.name,
          qty: 1,
          unitPrice: prod.price,
          subtotal: prod.price,
        },
      ];
    });
    e.target.value = '';
  };

  const calculatedEditTotal = useMemo(() => {
    return editItems.reduce((sum, it) => sum + (it.subtotal || 0), 0);
  }, [editItems]);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    if (editItems.length === 0) {
      alert('Pesanan harus memiliki minimal 1 menu.');
      return;
    }

    const newTotal = calculatedEditTotal;
    let newPaymentStatus = activeOrder.paymentStatus;
    if (activeOrder.totalPaid >= newTotal && newTotal > 0) {
      newPaymentStatus = 'Lunas';
    } else if (activeOrder.totalPaid > 0) {
      newPaymentStatus = 'DP';
    } else {
      newPaymentStatus = 'Belum Dibayar';
    }

    const noteDesc = editChangeNote ? ` Catatan: ${editChangeNote}` : '';
    const desc = `Pesanan diubah oleh Admin. Total baru: ${rupiah(newTotal)}.${noteDesc}`;

    setOrders(prev => prev.map(o => {
      if (o.id !== activeOrder.id) return o;
      return {
        ...o,
        pickupDate: editPickupDate,
        pickupTime: editPickupTime,
        notes: editNotes,
        items: editItems,
        total: newTotal,
        paymentStatus: newPaymentStatus,
        editHistory: [
          ...o.editHistory,
          {
            changedAt: new Date().toISOString(),
            description: desc,
          },
        ],
      };
    }));

    setShowEditModal(false);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPaymentFilter('ALL');
    setOrderDateFilter('');
    setPickupDateFilter('');
  };

  return (
    <div className="owner-page-wrap">
      <div className="owner-page-head">
        <div>
          <h1 className="owner-page-title">Manajemen Pesanan</h1>
          <p className="owner-page-sub">Kelola, verifikasi, konfirmasi, dan edit pesanan pelanggan</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="owner-card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Search */}
          <div>
            <label className="form-label" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Cari Kode / Pelanggan</label>
            <div className="search" style={{ width: '100%' }}>
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Cari kode atau nama..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status Pesanan */}
          <div>
            <label className="form-label" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Status Pesanan</label>
            <div className="filter-select-wrap">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Semua Status Pesanan</option>
                {ADMIN_ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Icon name="chevronDown" size={16} className="filter-select-icon" />
            </div>
          </div>

          {/* Status Pembayaran */}
          <div>
            <label className="form-label" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Status Pembayaran</label>
            <div className="filter-select-wrap">
              <select
                className="filter-select"
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
              >
                <option value="ALL">Semua Status Bayar</option>
                {ADMIN_PAYMENT_STATUSES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <Icon name="chevronDown" size={16} className="filter-select-icon" />
            </div>
          </div>

          {/* Filter Tanggal Pesanan */}
          <div>
            <label className="form-label" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Tanggal Pesanan</label>
            <input
              type="date"
              className="form-control"
              value={orderDateFilter}
              onChange={e => setOrderDateFilter(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </div>

          {/* Filter Tanggal Pengambilan */}
          <div>
            <label className="form-label" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Tanggal Ambil</label>
            <input
              type="date"
              className="form-control"
              value={pickupDateFilter}
              onChange={e => setPickupDateFilter(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </div>
        </div>

        {(search || statusFilter !== 'ALL' || paymentFilter !== 'ALL' || orderDateFilter || pickupDateFilter) && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost btn-xs" onClick={resetFilters}>
              <Icon name="close" size={14} /> Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="owner-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '160px' }}>Kode Pesanan</th>
                <th style={{ minWidth: '180px' }}>Nama Pelanggan</th>
                <th style={{ width: '120px' }}>Tanggal Pesanan</th>
                <th style={{ width: '170px' }}>Jadwal Pengambilan</th>
                <th className="text-right" style={{ width: '140px' }}>Total Pesanan</th>
                <th className="text-center" style={{ width: '170px' }}>Status Pesanan</th>
                <th className="text-center" style={{ width: '110px' }}>Status Pembayaran</th>
                <th className="text-center" style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px 16px' }} className="muted">
                    Tidak ada pesanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <span className="admin-code">{o.id}</span>
                    </td>
                    <td>
                      <div className="admin-customer-name">{o.customerName}</div>
                      <div className="admin-customer-sub">{o.customerPhone}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDateShort(o.orderDate)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="admin-customer-name">{formatDateShort(o.pickupDate)}</div>
                      <div className="admin-cell-sub">{o.pickupTime} WITA</div>
                    </td>
                    <td className="text-right" style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{rupiah(o.total)}</td>
                    <td className="text-center"><AdminStatusBadge status={o.status} /></td>
                    <td className="text-center"><PaymentBadge status={o.paymentStatus} /></td>
                    <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        style={{ minWidth: '72px', justifyContent: 'center' }}
                        onClick={() => setActiveOrder(o)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL DETAIL PESANAN ================= */}
      {activeOrder && !showEditModal && !showConfirmDialog && !showRejectDialog && (
        <div className="kitchen-modal-backdrop" onClick={() => setActiveOrder(null)}>
          <div className="kitchen-modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="kitchen-modal-head">
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Detail Pesanan</h3>
                <span className="muted" style={{ fontSize: 13 }}>Kode: <strong>{activeOrder.id}</strong></span>
              </div>
              <button type="button" className="owner-close-btn" onClick={() => setActiveOrder(null)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="kitchen-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Badges & Customer Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 16 }}>{activeOrder.customerName}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13 }}>
                    <Icon name="phone" size={14} />
                    <span>{activeOrder.customerPhone}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <AdminStatusBadge status={activeOrder.status} />
                  <PaymentBadge status={activeOrder.paymentStatus} />
                </div>
              </div>

              {/* Schedule Info Card */}
              <div style={{ background: 'var(--bg-subtle, #f8f6f0)', padding: '12px 16px', borderRadius: 8, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>Tanggal Pesan:</span>
                  <div style={{ fontWeight: 600 }}>{formatDate(activeOrder.orderDate)}</div>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>Jadwal Pengambilan:</span>
                  <div style={{ fontWeight: 600, color: 'var(--brand)' }}>
                    {formatDate(activeOrder.pickupDate)} · {activeOrder.pickupTime} WITA
                  </div>
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ fontSize: 14, marginBottom: 8 }}>Rincian Menu</h4>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                <table className="admin-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Menu</th>
                      <th className="text-center" style={{ width: 100 }}>Jumlah</th>
                      <th className="text-right" style={{ width: 130 }}>Harga Satuan</th>
                      <th className="text-right" style={{ width: 130 }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td><strong>{it.menuName}</strong></td>
                        <td className="text-center">{it.qty} porsi</td>
                        <td className="text-right">{rupiah(it.unitPrice)}</td>
                        <td className="text-right" style={{ fontWeight: 600 }}>{rupiah(it.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right" style={{ fontWeight: 700, padding: '10px 14px' }}>Total Pesanan:</td>
                      <td className="text-right" style={{ fontWeight: 700, color: 'var(--brand)', fontSize: 14, padding: '10px 14px' }}>
                        {rupiah(activeOrder.total)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-right" style={{ padding: '6px 14px' }}>Sudah Terbayar:</td>
                      <td className="text-right" style={{ color: 'var(--success, #16a34a)', fontWeight: 600, padding: '6px 14px' }}>
                        {rupiah(activeOrder.totalPaid)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-right" style={{ padding: '6px 14px' }}>Sisa Pembayaran:</td>
                      <td className="text-right" style={{ fontWeight: 600, color: activeOrder.total - activeOrder.totalPaid > 0 ? 'var(--error, #dc2626)' : 'inherit', padding: '6px 14px' }}>
                        {rupiah(Math.max(0, activeOrder.total - activeOrder.totalPaid))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Catatan Khusus */}
              {activeOrder.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
                  <strong style={{ fontSize: 13, color: '#b45309' }}>Catatan Khusus:</strong>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#92400e' }}>{activeOrder.notes}</p>
                </div>
              )}

              {/* Riwayat Pembayaran */}
              <h4 style={{ fontSize: 14, marginBottom: 8 }}>Riwayat Pembayaran</h4>
              {activeOrder.payments && activeOrder.payments.length > 0 ? (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                  <table className="admin-table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th className="text-right">Jumlah</th>
                        <th>Metode</th>
                        <th>Dicatat Oleh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrder.payments.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDateShort(p.date)}</td>
                          <td className="text-right" style={{ fontWeight: 600, color: 'var(--success, #16a34a)', whiteSpace: 'nowrap' }}>{rupiah(p.amount)}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{p.method}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{p.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Belum ada pembayaran yang dicatat.</p>
              )}

              {/* Riwayat Perubahan / Edit */}
              {activeOrder.editHistory && activeOrder.editHistory.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <h4 style={{ fontSize: 14, marginBottom: 8 }}>Riwayat Log / Perubahan</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {activeOrder.editHistory.map((h, idx) => (
                      <li key={idx} style={{ background: 'var(--bg-subtle, #f5f5f5)', padding: '6px 10px', borderRadius: 6 }}>
                        <span className="muted" style={{ marginRight: 6 }}>
                          [{new Date(h.changedAt).toLocaleString('id-ID')}]
                        </span>
                        {h.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {activeOrder.status === 'Menunggu Konfirmasi' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowConfirmDialog(true)}
                    >
                      <Icon name="check" size={16} /> Konfirmasi Pesanan
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--error, #dc2626)', borderColor: 'currentColor' }}
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <Icon name="close" size={16} /> Tolak Pesanan
                    </button>
                  </div>
                )}
                {activeOrder.status === 'Dikonfirmasi' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => openEditModal(activeOrder)}
                  >
                    <Icon name="edit" size={16} /> Edit Pesanan
                  </button>
                )}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveOrder(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DIALOG KONFIRMASI ================= */}
      {showConfirmDialog && activeOrder && (
        <div className="kitchen-modal-backdrop" onClick={() => setShowConfirmDialog(false)}>
          <div className="kitchen-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="kitchen-modal-head">
              <h3 style={{ margin: 0, fontSize: 16 }}>Konfirmasi Pesanan</h3>
              <button type="button" className="owner-close-btn" onClick={() => setShowConfirmDialog(false)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="kitchen-modal-body">
              <p style={{ margin: '0 0 12px' }}>
                Apakah Anda yakin ingin mengonfirmasi pesanan <strong>{activeOrder.id}</strong> atas nama <strong>{activeOrder.customerName}</strong>?
              </p>
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                Pesanan yang dikonfirmasi akan masuk ke dalam antrean produksi Tim Dapur.
              </p>
            </div>
            <div className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowConfirmDialog(false)}>
                Batal
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirmOrder}>
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DIALOG TOLAK ================= */}
      {showRejectDialog && activeOrder && (
        <div className="kitchen-modal-backdrop" onClick={() => setShowRejectDialog(false)}>
          <div className="kitchen-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="kitchen-modal-head">
              <h3 style={{ margin: 0, fontSize: 16, color: 'var(--error, #dc2626)' }}>Tolak Pesanan</h3>
              <button type="button" className="owner-close-btn" onClick={() => setShowRejectDialog(false)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="kitchen-modal-body">
              <p style={{ margin: '0 0 12px' }}>
                Tolak pesanan <strong>{activeOrder.id}</strong> atas nama <strong>{activeOrder.customerName}</strong>?
              </p>
              <div>
                <label className="form-label" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                  Alasan Penolakan <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Contoh: Stok menu tidak mencukupi / slot dapur penuh pada tanggal tersebut."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  style={{ width: '100%', borderRadius: 8, padding: 8, border: '1px solid var(--border)' }}
                  required
                />
              </div>
            </div>
            <div className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowRejectDialog(false)}>
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: 'var(--error, #dc2626)' }}
                disabled={!rejectReason.trim()}
                onClick={handleRejectOrder}
              >
                Tolak Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT PESANAN ================= */}
      {showEditModal && activeOrder && (
        <div className="kitchen-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="kitchen-modal" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSaveEdit}>
              <div className="kitchen-modal-head">
                <div>
                  <h3 style={{ margin: 0, fontSize: 17 }}>Edit Pesanan (Sebelum Dapur Memproses)</h3>
                  <span className="muted" style={{ fontSize: 12 }}>Kode: <strong>{activeOrder.id}</strong></span>
                </div>
                <button type="button" className="owner-close-btn" onClick={() => setShowEditModal(false)}>
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="kitchen-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Jadwal Pengambilan */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                      Tanggal Pengambilan
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={editPickupDate}
                      onChange={e => setEditPickupDate(e.target.value)}
                      required
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                      Jam Pengambilan
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={editPickupTime}
                      onChange={e => setEditPickupTime(e.target.value)}
                      required
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="form-label" style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>Daftar Item Menu</label>
                    <div style={{ minWidth: 200 }}>
                      <select
                        className="form-control"
                        onChange={handleAddItem}
                        defaultValue=""
                        style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6 }}
                      >
                        <option value="" disabled>+ Tambah Menu...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({rupiah(p.price)})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    <table className="owner-table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>Menu</th>
                          <th style={{ width: 110 }}>Jumlah</th>
                          <th style={{ textAlign: 'right' }}>Harga</th>
                          <th style={{ textAlign: 'right' }}>Subtotal</th>
                          <th style={{ width: 40 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editItems.map((item, idx) => (
                          <tr key={idx}>
                            <td><strong>{item.menuName}</strong></td>
                            <td>
                              <input
                                type="number"
                                min={1}
                                className="form-control"
                                value={item.qty}
                                onChange={e => handleItemQtyChange(idx, e.target.value)}
                                style={{ width: 70, padding: '4px 6px', textAlign: 'center', borderRadius: 6 }}
                              />
                            </td>
                            <td style={{ textAlign: 'right' }}>{rupiah(item.unitPrice)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{rupiah(item.subtotal)}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                style={{ color: 'var(--error, #dc2626)' }}
                                onClick={() => handleRemoveItem(idx)}
                              >
                                <Icon name="trash" size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total Baru:</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand)', fontSize: 15 }}>
                            {rupiah(calculatedEditTotal)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Catatan Khusus */}
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    Catatan Pesanan
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Catatan khusus dari pemesan..."
                    style={{ width: '100%', borderRadius: 8, padding: 8, border: '1px solid var(--border)' }}
                  />
                </div>

                {/* Catatan Alasan Perubahan */}
                <div>
                  <label className="form-label" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    Alasan / Keterangan Perubahan (Riwayat)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editChangeNote}
                    onChange={e => setEditChangeNote(e.target.value)}
                    placeholder="Contoh: Pemesan meminta penambahan 10 porsi lewat WA"
                    style={{ width: '100%', borderRadius: 8, padding: '7px 10px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
