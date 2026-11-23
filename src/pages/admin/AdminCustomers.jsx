import { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { rupiah, formatDate, formatDateShort } from '../../utils/format';
import { AdminStatusBadge, PaymentBadge } from '../../components/ui/Badges';
import { buildAdminCustomers } from '../../data/adminDummyData';

export default function AdminCustomers() {
  const { orders } = useOutletContext();
  const navigate = useNavigate();

  // Search
  const [search, setSearch] = useState('');

  // Selected customer for history modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Derive customer list from active orders
  const customers = useMemo(() => {
    return buildAdminCustomers(orders);
  }, [orders]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
    );
  }, [customers, search]);

  // Selected customer's order history
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders
      .filter(o => o.customerPhone === selectedCustomer.phone)
      .sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }, [selectedCustomer, orders]);

  return (
    <div className="owner-page-wrap">
      <div className="owner-page-head">
        <div>
          <h1 className="owner-page-title">Data Pelanggan</h1>
          <p className="owner-page-sub">Daftar pelanggan setia dan riwayat transaksi pesanan mereka</p>
        </div>
      </div>

      {/* Filter / Search Card */}
      <div className="owner-card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ maxWidth: 400 }}>
          <label className="form-label" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Cari Pelanggan</label>
          <div className="search" style={{ width: '100%' }}>
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Cari nama atau nomor telepon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="owner-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: '180px' }}>Nama Pelanggan</th>
                <th style={{ width: '160px' }}>Nomor Kontak</th>
                <th className="text-center" style={{ width: '140px' }}>Jumlah Pesanan</th>
                <th className="text-right" style={{ width: '160px' }}>Total Belanja (Lunas)</th>
                <th style={{ width: '150px' }}>Pesanan Terakhir</th>
                <th className="text-center" style={{ width: '130px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px' }} className="muted">
                    Tidak ada pelanggan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.phone}>
                    <td>
                      <div className="admin-customer-name">{c.name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="phone" size={14} className="muted" />
                        <span style={{ fontSize: '0.84rem' }}>{c.phone}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge badge--neutral">{c.orderCount} pesanan</span>
                    </td>
                    <td className="text-right" style={{ whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--brand)' }}>
                      {rupiah(c.totalSpent)}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {c.lastOrderDate ? formatDateShort(c.lastOrderDate) : '-'}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => setSelectedCustomer(c)}
                      >
                        Lihat Riwayat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL RIWAYAT PESANAN PELANGGAN ================= */}
      {selectedCustomer && (
        <div className="kitchen-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div className="kitchen-modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
            <div className="kitchen-modal-head">
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Riwayat Pesanan Pelanggan</h3>
                <span className="muted" style={{ fontSize: 13 }}>{selectedCustomer.name}</span>
              </div>
              <button type="button" className="owner-close-btn" onClick={() => setSelectedCustomer(null)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="kitchen-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Profile Card */}
              <div style={{ background: 'var(--bg-subtle, #f8f6f0)', padding: '14px 18px', borderRadius: 8, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>Nama Lengkap</span>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedCustomer.name}</div>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>Nomor WhatsApp / Kontak</span>
                  <div style={{ fontWeight: 600 }}>{selectedCustomer.phone}</div>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>Total Transaksi Lunas</span>
                  <div style={{ fontWeight: 700, color: 'var(--success, #16a34a)' }}>{rupiah(selectedCustomer.totalSpent)}</div>
                </div>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>Frekuensi Pemesanan</span>
                  <div style={{ fontWeight: 600 }}>{selectedCustomer.orderCount} kali pesan</div>
                </div>
              </div>

              {/* Order History Table */}
              <h4 style={{ fontSize: 14, marginBottom: 8 }}>Daftar Seluruh Pesanan</h4>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                <table className="admin-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '140px' }}>Kode</th>
                      <th style={{ width: '110px' }}>Tgl Pesan</th>
                      <th style={{ width: '150px' }}>Jadwal Ambil</th>
                      <th className="text-right" style={{ width: '120px' }}>Total</th>
                      <th className="text-center" style={{ width: '140px' }}>Status Pesanan</th>
                      <th className="text-center" style={{ width: '120px' }}>Status Bayar</th>
                      <th className="text-center" style={{ width: '80px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map(o => (
                      <tr key={o.id}>
                        <td><span className="admin-code">{o.id}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateShort(o.orderDate)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="admin-customer-name" style={{ fontSize: '0.82rem' }}>{formatDateShort(o.pickupDate)}</div>
                          <div className="admin-cell-sub">{o.pickupTime} WITA</div>
                        </td>
                        <td className="text-right" style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{rupiah(o.total)}</td>
                        <td className="text-center"><AdminStatusBadge status={o.status} size="sm" /></td>
                        <td className="text-center"><PaymentBadge status={o.paymentStatus} size="sm" /></td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => {
                              setSelectedCustomer(null);
                              navigate('/admin/orders', { state: { openOrder: o.id } });
                            }}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedCustomer(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
