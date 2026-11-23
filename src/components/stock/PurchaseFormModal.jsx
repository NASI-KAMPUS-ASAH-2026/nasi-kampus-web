import { useEffect, useState, useMemo } from 'react';
import Icon from '../Icon';
import { useToast } from '../ui/Toast';
import {
  getIngredients,
  createPurchase,
  updatePurchase,
} from '../../services/api';
import { rupiah, todayISO } from '../../utils/format';

export default function PurchaseFormModal({
  isOpen,
  onClose,
  purchase,
  currentUser = { role: 'kitchen', name: 'Tim Dapur', userId: 2 },
  onSuccess,
}) {
  const { show } = useToast();
  const isEdit = Boolean(purchase);

  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [purchaseDate, setPurchaseDate] = useState(todayISO());
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { ingredientId: '', qty: '', unitPrice: '', unit: '', name: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Muat daftar seluruh master bahan untuk pilihan baris transaksi
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    getIngredients().then((data) => {
      if (mounted) setAvailableIngredients(data || []);
    });
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Inisialisasi data form saat modal dibuka
  useEffect(() => {
    if (purchase) {
      setPurchaseDate(purchase.purchaseDate || todayISO());
      setSupplier(purchase.supplier || '');
      setNotes(purchase.notes || '');
      if (Array.isArray(purchase.items) && purchase.items.length > 0) {
        setItems(
          purchase.items.map((i) => ({
            ingredientId: i.ingredientId,
            qty: String(i.qty),
            unitPrice: String(i.unitPrice),
            unit: i.unit,
            name: i.ingredientName,
          }))
        );
      } else {
        setItems([{ ingredientId: '', qty: '', unitPrice: '', unit: '', name: '' }]);
      }
    } else {
      setPurchaseDate(todayISO());
      setSupplier('');
      setNotes('');
      setItems([{ ingredientId: '', qty: '', unitPrice: '', unit: '', name: '' }]);
    }
    setError('');
    setShowConfirm(false);
  }, [purchase, isOpen]);

  // Lookup map bahan berdasarkan ID
  const ingMap = useMemo(() => {
    const map = new Map();
    availableIngredients.forEach((ing) => map.set(ing.id, ing));
    return map;
  }, [availableIngredients]);

  // ID bahan yang sudah dipilih di baris manapun
  const selectedIngIds = useMemo(() => {
    return new Set(items.map((i) => i.ingredientId).filter(Boolean));
  }, [items]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      const cur = { ...copy[index] };

      if (field === 'ingredientId') {
        cur.ingredientId = value;
        const ing = ingMap.get(value);
        if (ing) {
          cur.unit = ing.unit;
          cur.name = ing.name;
        } else {
          cur.unit = '';
          cur.name = '';
        }
      } else if (field === 'qty') {
        cur.qty = value;
      } else if (field === 'unitPrice') {
        cur.unitPrice = value;
      }

      copy[index] = cur;
      return copy;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { ingredientId: '', qty: '', unitPrice: '', unit: '', name: '' },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      show('Minimal satu item bahan harus ada dalam transaksi.', { tone: 'warning' });
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Hitung total keseluruhan
  const grandTotal = items.reduce((sum, item) => {
    const q = Number(item.qty) || 0;
    const p = Number(item.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  // Validasi awal sebelum memunculkan dialog konfirmasi
  const handleValidateAndPrompt = (e) => {
    e.preventDefault();
    setError('');

    if (!purchaseDate) {
      setError('Tanggal pembelian wajib diisi.');
      return;
    }

    if (!supplier.trim()) {
      setError('Nama toko atau pemasok wajib diisi.');
      return;
    }

    if (!items.length) {
      setError('Minimal satu baris bahan harus ditambahkan.');
      return;
    }

    // Cek duplikasi & kelengkapan item
    const ids = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.ingredientId) {
        setError(`Pilih jenis bahan pada baris ke-${i + 1}.`);
        return;
      }
      if (ids.includes(item.ingredientId)) {
        setError(
          `Bahan "${item.name || 'Bahan'}" dipilih lebih dari sekali. Gabungkan kuantitasnya pada satu baris.`
        );
        return;
      }
      ids.push(item.ingredientId);

      const q = Number(item.qty);
      if (isNaN(q) || q <= 0) {
        setError(`Jumlah kuantitas pada baris ke-${i + 1} harus lebih besar dari 0.`);
        return;
      }

      const p = Number(item.unitPrice);
      if (isNaN(p) || p < 0) {
        setError(`Harga satuan pada baris ke-${i + 1} tidak boleh negatif.`);
        return;
      }
    }

    // Lolos validasi, buka dialog konfirmasi
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    setError('');

    const payload = {
      purchaseDate,
      supplier: supplier.trim(),
      notes: notes.trim(),
      items: items.map((i) => ({
        ingredientId: i.ingredientId,
        qty: Number(i.qty),
        unitPrice: Number(i.unitPrice),
      })),
      currentUser,
    };

    try {
      if (isEdit) {
        await updatePurchase(purchase.id, payload, currentUser);
        show(`Transaksi pembelian ${purchase.id} berhasil diperbarui & stok disesuaikan.`, {
          tone: 'success',
        });
      } else {
        const res = await createPurchase(payload);
        show(`Transaksi ${res.id} berhasil disimpan & stok otomatis bertambah.`, {
          tone: 'success',
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan transaksi pembelian.');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="kitchen-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-modal-title"
    >
      <div className="kitchen-modal" style={{ maxWidth: 840 }}>
        <header className="kitchen-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className="kpi-ic kpi-ic--orange"
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
              <h2 id="purchase-modal-title">
                {isEdit ? `Edit Transaksi Pembelian (${purchase.id})` : 'Catat Transaksi Pembelian Bahan'}
              </h2>
              <small className="muted">
                Pencatat: <strong>{currentUser.name}</strong> ({currentUser.role === 'owner' ? 'Owner / Admin' : 'Tim Dapur'})
              </small>
            </div>
          </div>
          <button
            type="button"
            className="owner-close-btn"
            onClick={onClose}
            aria-label="Tutup form transaksi"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        {showConfirm ? (
          /* Dialog Konfirmasi Simpan Transaksi */
          <div className="kitchen-modal-body" style={{ padding: '24px 28px', gap: 20 }}>
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="alert" size={20} /> Konfirmasi Simpan Transaksi Pembelian
              </h3>
              <p className="muted" style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                {isEdit
                  ? `Anda akan memperbarui transaksi "${purchase.id}". Sistem akan mengoreksi pengaruh stok pembelian lama dan menerapkan kuantitas stok yang baru.`
                  : 'Pastikan data transaksi dan jumlah pembelian sudah benar. Stok seluruh bahan yang dibeli akan otomatis bertambah secara akumulatif setelah transaksi disimpan.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div className="panel" style={{ padding: 14 }}>
                <span className="muted" style={{ fontSize: '0.8rem', display: 'block' }}>Tanggal Pembelian</span>
                <strong style={{ fontSize: '1rem' }}>{purchaseDate}</strong>
              </div>
              <div className="panel" style={{ padding: 14 }}>
                <span className="muted" style={{ fontSize: '0.8rem', display: 'block' }}>Toko / Pemasok</span>
                <strong style={{ fontSize: '1rem' }}>{supplier}</strong>
              </div>
              <div className="panel" style={{ padding: 14 }}>
                <span className="muted" style={{ fontSize: '0.8rem', display: 'block' }}>Total Pembelian ({items.length} jenis)</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--brand-red)' }}>{rupiah(grandTotal)}</strong>
              </div>
            </div>

            <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 8 }}>
              <table className="owner-table" style={{ margin: 0, width: '100%', fontSize: '0.86rem' }}>
                <thead>
                  <tr>
                    <th>Nama Bahan</th>
                    <th style={{ textAlign: 'center' }}>Jumlah</th>
                    <th style={{ textAlign: 'right' }}>Harga Satuan</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td><strong>{it.name || ingMap.get(it.ingredientId)?.name}</strong></td>
                      <td style={{ textAlign: 'center' }}>{it.qty} {it.unit}</td>
                      <td style={{ textAlign: 'right' }}>{rupiah(it.unitPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{rupiah((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Kembali Edit
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="loader" size={16} /> Menyimpan Transaksi...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} /> Ya, Simpan Transaksi &amp; Perbarui Stok
                  </>
                )}
              </button>
            </footer>
          </div>
        ) : (
          /* Form Pengisian Transaksi Multi-Item */
          <form onSubmit={handleValidateAndPrompt}>
            <div className="kitchen-modal-body" style={{ gap: 18 }}>
              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--color-error)',
                    color: 'var(--color-error)',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Icon name="alert" size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Baris Informasi Transaksi Utama */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 6 }}>
                    Tanggal Pembelian <span style={{ color: 'var(--brand-red)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'inherit',
                    }}
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 6 }}>
                    Nama Toko / Pemasok <span style={{ color: 'var(--brand-red)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'inherit',
                    }}
                    placeholder="Misal: Toko Sumber Rezeki, Pasar Segiri Samarinda..."
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Area Daftar Item Multi-Baris */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 14, background: 'var(--color-surface-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.98rem' }}>Daftar Bahan yang Dibeli</h3>
                    <small className="muted">Pilih bahan dari master bahan, masukkan jumlah &amp; harga satuan.</small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleAddItem}
                    style={{ gap: 6 }}
                  >
                    <Icon name="plus" size={15} /> Tambah Baris Bahan
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((row, idx) => {
                    const rowSubtotal = (Number(row.qty) || 0) * (Number(row.unitPrice) || 0);
                    return (
                      <div
                        key={idx}
                        className="panel"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(200px, 2.5fr) 80px 100px 140px 130px 40px',
                          gap: 10,
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: 'var(--color-surface)',
                        }}
                      >
                        {/* 1. Pilih Bahan */}
                        <div>
                          <label className="sr-only">Pilih Bahan #{idx + 1}</label>
                          <select
                            className="input"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-surface)',
                              fontSize: '0.86rem',
                            }}
                            value={row.ingredientId}
                            onChange={(e) => handleItemChange(idx, 'ingredientId', e.target.value)}
                            required
                          >
                            <option value="">-- Pilih Bahan --</option>
                            {availableIngredients.map((ing) => {
                              // Cegah duplikasi: disable pilihan jika sudah dipilih di baris lain
                              const isTaken = selectedIngIds.has(ing.id) && ing.id !== row.ingredientId;
                              return (
                                <option key={ing.id} value={ing.id} disabled={isTaken}>
                                  {ing.name} ({ing.unit}) {isTaken ? '— (Sudah dipilih)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* 2. Satuan Otomatis */}
                        <div style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '100%',
                              padding: '8px 4px',
                              background: 'var(--color-surface-subtle)',
                              borderRadius: 6,
                              border: '1px solid var(--color-border)',
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              color: 'var(--color-text-muted)',
                            }}
                            title="Satuan bahan terisi otomatis"
                          >
                            {row.unit || '—'}
                          </span>
                        </div>

                        {/* 3. Jumlah Pembelian */}
                        <div>
                          <label className="sr-only">Jumlah</label>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            className="input"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-surface)',
                              fontSize: '0.86rem',
                              textAlign: 'center',
                            }}
                            placeholder="Jml"
                            value={row.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            required
                          />
                        </div>

                        {/* 4. Harga Satuan */}
                        <div>
                          <label className="sr-only">Harga Satuan</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="input"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-surface)',
                              fontSize: '0.86rem',
                              textAlign: 'right',
                            }}
                            placeholder="Harga (Rp)"
                            value={row.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            required
                          />
                        </div>

                        {/* 5. Subtotal Otomatis */}
                        <div style={{ textAlign: 'right', paddingRight: 6 }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                            {rupiah(rowSubtotal)}
                          </span>
                        </div>

                        {/* 6. Hapus Baris */}
                        <div style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-icon-sq"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid var(--color-border)',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: 'var(--color-error)',
                            }}
                            onClick={() => handleRemoveItem(idx)}
                            aria-label={`Hapus baris bahan #${idx + 1}`}
                            title="Hapus baris ini"
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ringkasan Subtotal Bawah */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 14,
                    padding: '12px 16px',
                    background: 'var(--color-surface)',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                    Total Pembelian ({items.length} jenis bahan):
                  </span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--brand-red)' }}>
                    {rupiah(grandTotal)}
                  </strong>
                </div>
              </div>

              {/* Catatan Tambahan (Opsional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 6 }}>
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  className="input"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'inherit',
                    resize: 'vertical',
                  }}
                  placeholder="Keterangan keperluan, nota fisik, atau catatan pengadaan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <footer
              className="kitchen-modal-foot"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="muted" style={{ fontSize: '0.82rem' }}>Total:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--brand-red)' }}>{rupiah(grandTotal)}</strong>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Lanjut ke Konfirmasi <Icon name="arrow" size={16} />
                </button>
              </div>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
