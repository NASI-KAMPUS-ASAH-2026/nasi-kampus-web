import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { useToast } from '../ui/Toast';
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  createIngredient,
  updateIngredient,
} from '../../services/api';

export default function IngredientFormModal({ isOpen, onClose, ingredient, onSuccess }) {
  const { show } = useToast();
  const isEdit = Boolean(ingredient);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(INGREDIENT_CATEGORIES[0]);
  const [unit, setUnit] = useState('kg');
  const [customUnit, setCustomUnit] = useState('');
  const [minStock, setMinStock] = useState('10');
  const [initialStock, setInitialStock] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name || '');
      setCategory(ingredient.category || INGREDIENT_CATEGORIES[0]);
      if (INGREDIENT_UNITS.includes(ingredient.unit)) {
        setUnit(ingredient.unit);
        setCustomUnit('');
      } else {
        setUnit('custom');
        setCustomUnit(ingredient.unit || '');
      }
      setMinStock(String(ingredient.minStock ?? 10));
      setInitialStock(String(ingredient.currentStock ?? 0));
    } else {
      setName('');
      setCategory(INGREDIENT_CATEGORIES[0]);
      setUnit('kg');
      setCustomUnit('');
      setMinStock('10');
      setInitialStock('0');
    }
    setError('');
  }, [ingredient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Nama bahan wajib diisi.');
      return;
    }

    const finalUnit = unit === 'custom' ? customUnit.trim() : unit;
    if (!finalUnit) {
      setError('Satuan bahan wajib ditentukan.');
      return;
    }

    const validMinStock = Math.max(0, Number(minStock) || 0);

    setLoading(true);
    try {
      if (isEdit) {
        await updateIngredient(ingredient.id, {
          name: trimmedName,
          category,
          unit: finalUnit,
          minStock: validMinStock,
        });
        show(`Bahan "${trimmedName}" berhasil diperbarui.`, { tone: 'success' });
      } else {
        const validInitialStock = Math.max(0, Number(initialStock) || 0);
        await createIngredient({
          name: trimmedName,
          category,
          unit: finalUnit,
          initialStock: validInitialStock,
          minStock: validMinStock,
        });
        show(`Bahan "${trimmedName}" berhasil ditambahkan ke Master Bahan.`, { tone: 'success' });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Terjadi kesalahan saat menyimpan bahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kitchen-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ing-modal-title">
      <div className="kitchen-modal" style={{ maxWidth: 540 }}>
        <header className="kitchen-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="kpi-ic kpi-ic--red" style={{ width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              <Icon name={isEdit ? 'edit' : 'plus'} size={18} />
            </span>
            <h2 id="ing-modal-title">{isEdit ? 'Edit Informasi Bahan' : 'Tambah Bahan Baru'}</h2>
          </div>
          <button type="button" className="owner-close-btn" onClick={onClose} aria-label="Tutup modal">
            <Icon name="close" size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="kitchen-modal-body" style={{ gap: 16 }}>
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-error)', color: 'var(--color-error)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="alert" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 6 }}>
                Nama Bahan <span style={{ color: 'var(--brand-red)' }}>*</span>
              </label>
              <input
                type="text"
                className="input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'inherit' }}
                placeholder="Contoh: Beras Premium, Daging Ayam Potong..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <small className="muted" style={{ display: 'block', marginTop: 4, fontSize: '0.78rem' }}>
                Pastikan nama bahan spesifik dan belum pernah didaftarkan sebelumnya.
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 6 }}>
                  Kategori Bahan <span style={{ color: 'var(--brand-red)' }}>*</span>
                </label>
                <select
                  className="input"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'inherit' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {INGREDIENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 6 }}>
                  Satuan Bahan <span style={{ color: 'var(--brand-red)' }}>*</span>
                </label>
                <select
                  className="input"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'inherit' }}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                >
                  {INGREDIENT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  <option value="custom">Satuan Lainnya...</option>
                </select>
              </div>
            </div>

            {unit === 'custom' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 6 }}>
                  Tulis Satuan Kustom <span style={{ color: 'var(--brand-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'inherit' }}
                  placeholder="Misal: ikat, loyang, kaleng..."
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  required
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr' : '1fr 1fr', gap: 14 }}>
              {!isEdit && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 6 }}>
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="input"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'inherit' }}
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    placeholder="0"
                  />
                  <small className="muted" style={{ display: 'block', marginTop: 4, fontSize: '0.78rem' }}>
                    Stok awal sebelum pencatatan transaksi pembelian.
                  </small>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 6 }}>
                  Batas Stok Minimum <span style={{ color: 'var(--brand-red)' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="input"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'inherit' }}
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  placeholder="10"
                  required
                />
                <small className="muted" style={{ display: 'block', marginTop: 4, fontSize: '0.78rem' }}>
                  Peringatan stok rendah akan aktif jika stok ≤ batas ini.
                </small>
              </div>
            </div>
          </div>

          <footer className="kitchen-modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="loader" size={16} /> Menyimpan...
                </>
              ) : (
                <>
                  <Icon name="check" size={16} /> {isEdit ? 'Perbarui Bahan' : 'Simpan Bahan'}
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
