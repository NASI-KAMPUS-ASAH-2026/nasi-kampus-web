import { useState, useMemo, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import Icon from '../../components/Icon';
import { rupiah, formatDate, formatDateShort } from '../../utils/format';
import { PaymentBadge } from '../../components/ui/Badges';
import { ADMIN_PAYMENT_STATUSES, PAYMENT_METHODS } from '../../data/adminDummyData';

export default function AdminPayments() {
  const { orders, setOrders } = useOutletContext();
  const location = useLocation();

  // Filters
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form State for Payment
  const [formOrderId, setFormOrderId] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [validationError, setValidationError] = useState('');

  // Handle passed filter from dashboard
  useEffect(() => {
    if (location.state?.filter && ADMIN_PAYMENT_STATUSES.includes(location.state.filter)) {
      setPaymentFilter(location.state.filter);
    }
  }, [location.state]);

  // Keep selectedOrder in sync
  useEffect(() => {
    if (selectedOrder) {
      const refreshed = orders.find(o => o.id === selectedOrder.id);
      if (refreshed) setSelectedOrder(refreshed);
    }
  }, [orders]);

  // Orders eligible for recording payment (not rejected, not fully paid)
  const unpaidOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'Ditolak' && o.paymentStatus !== 'Lunas');
  }, [orders]);

  // Form target order details
  const formTargetOrder = useMemo(() => {
    if (!formOrderId) return null;
    return orders.find(o => o.id === formOrderId) || null;
  }, [formOrderId, orders]);

  const formRemaining = useMemo(() => {
    if (!formTargetOrder) return 0;
    return Math.max(0, formTargetOrder.total - formTargetOrder.totalPaid);
  }, [formTargetOrder]);

  // Filtered orders table
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status === 'Ditolak') return false;
      if (search) {
        const q = search.toLowerCase();
        const matchCode = o.id.toLowerCase().includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      if (paymentFilter !== 'ALL' && o.paymentStatus !== paymentFilter) return false;
      if (dateFilter && o.orderDate !== dateFilter) return false;
      return true;
    });
  }, [orders, search, paymentFilter, dateFilter]);

  // Open Record / Edit Payment Modal
  const openRecordPaymentModal = (order = null) => {
    setValidationError('');
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('Transfer Bank');

    if (order) {
      setFormOrderId(order.id);
      const remaining = Math.max(0, order.total - order.totalPaid);
      setPaymentAmount(remaining > 0 ? String(remaining) : '');
    } else {
      if (unpaidOrders.length > 0) {
        setFormOrderId(unpaidOrders[0].id);
        const remaining = Math.max(0, unpaidOrders[0].total - unpaidOrders[0].totalPaid);
        setPaymentAmount(remaining > 0 ? String(remaining) : '');
      } else {
        setFormOrderId('');
        setPaymentAmount('');
      }
    }
    setShowPaymentModal(true);
  };

  // Select order in form
  const handleSelectOrder = (e) => {
    const code = e.target.value;
    setFormOrderId(code);
    const target = orders.find(o => o.id === code);
    if (target) {
      const rem = Math.max(0, target.total - target.totalPaid);
      setPaymentAmount(rem > 0 ? String(rem) : '');
    }
  };

  // Submit Payment Form (triggers confirm modal)
  const handleSubmitForm = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formTargetOrder) {
      setValidationError('Pilih pesanan yang valid.');
      return;
    }

    const amount = parseInt(paymentAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setValidationError('Jumlah pembayaran harus lebih dari 0.');
      return;
    }

    if (amount > formRemaining) {
      setValidationError(`Jumlah pembayaran tidak boleh melebihi sisa tagihan (${rupiah(formRemaining)}).`);
      return;
    }

    setShowConfirmModal(true);
  };

  // Confirmed Save Payment
  const handleConfirmSavePayment = () => {
    if (!formTargetOrder) return;
    const amount = parseInt(paymentAmount, 10);
    const newTotalPaid = formTargetOrder.totalPaid + amount;
    const isLunas = newTotalPaid >= formTargetOrder.total;
    const newPaymentStatus = isLunas ? 'Lunas' : 'DP';

    const newPaymentEntry = {
      date: paymentDate,
      amount,
      method: paymentMethod,
      recordedBy: 'Admin',
    };

    setOrders(prev => prev.map(o => {
      if (o.id !== formTargetOrder.id) return o;
      return {
        ...o,
        totalPaid: newTotalPaid,
        paymentStatus: newPaymentStatus,
        payments: [...(o.payments || []), newPaymentEntry],
        editHistory: [
          ...o.editHistory,
          {
            changedAt: new Date().toISOString(),
            description: `Pembayaran sebesar ${rupiah(amount)} (${paymentMethod}) dicatat. Status bayar: ${newPaymentStatus}.`,
          },
        ],
      };
    }));

    setShowConfirmModal(false);
    setShowPaymentModal(false);
  };

  return (
    <div className="owner-page-wrap">
      <div className="owner-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="owner-page-title">Pembayaran Pesanan</h1>
          <p className="owner-page-sub">Pantau tagihan, catat uang muka (DP), dan pelunasan pembayaran</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => openRecordPaymentModal()}
        >
          <Icon name="plus" size={16} /> Tambah Pembayaran
        </button>
      </div>

      {/* Filter Card */}
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

          {/* Tanggal Pesanan */}
          <div>
            <label className="form-label" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Tanggal Pesanan</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </div>
        </div>

        {(search || paymentFilter !== 'ALL' || dateFilter) && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => { setSearch(''); setPaymentFilter('ALL'); setDateFilter(''); }}
            >
              <Icon name="close" size={14} /> Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Structured Clean Table */}
      <div className="owner-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '160px' }}>Kode Pesanan</th>
                <th style={{ minWidth: '180px' }}>Nama Pelanggan</th>
                <th className="text-right" style={{ width: '140px' }}>Total Tagihan</th>
                <th className="text-right" style={{ width: '140px' }}>Total Dibayar</th>
                <th className="text-right" style={{ width: '140px' }}>Sisa Tagihan</th>
                <th className="text-center" style={{ width: '150px' }}>Status Bayar</th>
                <th className="text-center" style={{ width: '140px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px' }} className="muted">
                    Tidak ada data pembayaran yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => {
                  const sisa = Math.max(0, o.total - o.totalPaid);
                  return (
                    <tr key={o.id}>
                      <td>
                        <span className="admin-code">{o.id}</span>
                      </td>
                      <td>
                        <div className="admin-customer-name">{o.customerName}</div>
                        <div className="admin-customer-sub">{o.customerPhone}</div>
                      </td>
                      <td className="text-right" style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{rupiah(o.total)}</td>
                      <td className="text-right" style={{ whiteSpace: 'nowrap', color: 'var(--success, #16a34a)', fontWeight: 600 }}>{rupiah(o.totalPaid)}</td>
                      <td className="text-right" style={{ whiteSpace: 'nowrap', fontWeight: 600, color: sisa > 0 ? 'var(--error, #dc2626)' : 'inherit' }}>
                        {rupiah(sisa)}
                      </td>
                      <td className="text-center"><PaymentBadge status={o.paymentStatus} /></td>
                      <td className="text-center">
                        <div className="admin-actions-cell">
                          {o.paymentStatus !== 'Lunas' ? (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => openRecordPaymentModal(o)}
                            >
                              Edit
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              disabled
                              style={{ opacity: 0.4, cursor: 'default' }}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => { setSelectedOrder(o); setShowHistoryModal(true); }}
                          >
                            Rincian
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL FORM PENCATATAN PEMBAYARAN ================= */}
      {showPaymentModal && (
        <div className="kitchen-modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="kitchen-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmitForm}>
              <div className="kitchen-modal-head">
                <h3 style={{ margin: 0, fontSize: 17 }}>Edit Pembayaran</h3>
                <button type="button" className="owner-close-btn" onClick={() => setShowPaymentModal(false)}>
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="kitchen-modal-body">
                {validationError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                    {validationError}
                  </div>
                )}

                {/* Select Order */}
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    Pilih Pesanan <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className="form-control"
                    value={formOrderId}
                    onChange={handleSelectOrder}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
                  >
                    <option value="" disabled>-- Pilih Kode Pesanan --</option>
                    {unpaidOrders.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.id} — {o.customerName} (Sisa: {rupiah(o.total - o.totalPaid)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Summary Info */}
                {formTargetOrder && (
                  <div style={{ background: 'var(--bg-subtle, #f8f6f0)', padding: '12px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="muted">Pelanggan:</span>
                      <strong>{formTargetOrder.customerName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="muted">Total Tagihan:</span>
                      <strong>{rupiah(formTargetOrder.total)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="muted">Sudah Dibayar:</span>
                      <span style={{ color: 'var(--success, #16a34a)', fontWeight: 600 }}>{rupiah(formTargetOrder.totalPaid)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
                      <span className="muted">Sisa Tagihan:</span>
                      <strong style={{ color: 'var(--error, #dc2626)', fontSize: 14 }}>{rupiah(formRemaining)}</strong>
                    </div>
                  </div>
                )}

                {/* Input Tanggal */}
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    Tanggal Pembayaran <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                </div>

                {/* Input Jumlah */}
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    Jumlah Pembayaran (Rp) <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={formRemaining || undefined}
                    placeholder="Contoh: 250000"
                    className="form-control"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                  {formRemaining > 0 && (
                    <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setPaymentAmount(String(Math.round(formRemaining / 2)))}
                      >
                        50% DP ({rupiah(Math.round(formRemaining / 2))})
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setPaymentAmount(String(formRemaining))}
                      >
                        Pelunasan ({rupiah(formRemaining)})
                      </button>
                    </div>
                  )}
                </div>

                {/* Metode Pembayaran (with QRIS) */}
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    Metode Pembayaran <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {PAYMENT_METHODS.map(m => (
                      <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m}
                          checked={paymentMethod === m}
                          onChange={e => setPaymentMethod(e.target.value)}
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPaymentModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={!formTargetOrder}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DIALOG KONFIRMASI PEMBAYARAN ================= */}
      {showConfirmModal && formTargetOrder && (
        <div className="kitchen-modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="kitchen-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="kitchen-modal-head">
              <h3 style={{ margin: 0, fontSize: 16 }}>Konfirmasi Pembayaran</h3>
              <button type="button" className="owner-close-btn" onClick={() => setShowConfirmModal(false)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="kitchen-modal-body">
              <p style={{ margin: '0 0 10px', fontSize: 14 }}>
                Pastikan data pembayaran yang akan disimpan sudah sesuai:
              </p>
              <div style={{ background: 'var(--bg-subtle, #f8f6f0)', padding: '12px', borderRadius: 8, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>Pesanan: <strong>{formTargetOrder.id}</strong> ({formTargetOrder.customerName})</div>
                <div>Jumlah: <strong style={{ color: 'var(--success, #16a34a)', fontSize: 15 }}>{rupiah(parseInt(paymentAmount, 10))}</strong></div>
                <div>Metode: <strong>{paymentMethod}</strong></div>
                <div>Tanggal: <strong>{formatDate(paymentDate)}</strong></div>
              </div>
            </div>
            <div className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowConfirmModal(false)}>
                Periksa Kembali
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirmSavePayment}>
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL RINCIAN RIWAYAT PEMBAYARAN ================= */}
      {showHistoryModal && selectedOrder && (
        <div className="kitchen-modal-backdrop" onClick={() => setShowHistoryModal(false)}>
          <div className="kitchen-modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="kitchen-modal-head">
              <div>
                <h3 style={{ margin: 0, fontSize: 17 }}>Rincian Pembayaran</h3>
                <span className="muted" style={{ fontSize: 13 }}>{selectedOrder.id} · {selectedOrder.customerName}</span>
              </div>
              <button type="button" className="owner-close-btn" onClick={() => setShowHistoryModal(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="kitchen-modal-body">
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, background: 'var(--bg-subtle, #f8f6f0)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>Total Tagihan</span>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{rupiah(selectedOrder.total)}</div>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>Total Dibayar</span>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--success, #16a34a)' }}>{rupiah(selectedOrder.totalPaid)}</div>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>Sisa Tagihan</span>
                  <div style={{ fontWeight: 700, fontSize: 15, color: selectedOrder.total - selectedOrder.totalPaid > 0 ? 'var(--error, #dc2626)' : 'inherit' }}>
                    {rupiah(Math.max(0, selectedOrder.total - selectedOrder.totalPaid))}
                  </div>
                </div>
              </div>

              {/* History Table with Crisp Columns */}
              <h4 style={{ fontSize: 14, marginBottom: 8 }}>Log Transaksi Pembayaran</h4>
              {selectedOrder.payments && selectedOrder.payments.length > 0 ? (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                  <table className="admin-table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th className="text-right">Jumlah</th>
                        <th>Metode</th>
                        <th>Pencatat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.payments.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.date)}</td>
                          <td className="text-right" style={{ fontWeight: 600, color: 'var(--success, #16a34a)', whiteSpace: 'nowrap' }}>
                            {rupiah(p.amount)}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>{p.method}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{p.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted" style={{ fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                  Belum ada pembayaran yang dicatat untuk pesanan ini.
                </p>
              )}
            </div>

            <div className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'space-between' }}>
              {selectedOrder.paymentStatus !== 'Lunas' ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowHistoryModal(false);
                    openRecordPaymentModal(selectedOrder);
                  }}
                >
                  <Icon name="edit" size={15} /> Edit
                </button>
              ) : <div />}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowHistoryModal(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
