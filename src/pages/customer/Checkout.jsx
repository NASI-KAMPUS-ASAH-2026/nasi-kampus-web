import { useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/States';
import Icon from '../../components/Icon';
import { Alert } from '../../components/ui/Badges';
import { useCart } from '../../context/CartContext';
import { submitOrder } from '../../services/api';
import { CONFIG } from '../../config';
import { formatDate, rupiah } from '../../utils/format';
import { minOrderDate, normalizePhone, validateCheckout } from '../../utils/validation';

const rules = CONFIG.order;
const INIT = { name: '', phone: '', date: '', notes: '', address: '', pickup: 'ambil' };

function Field({ name, label, optional, error, hint, children }) {
  const uid = useId();
  const inputId = `field-${name}-${uid}`;
  const errId = `${inputId}-err`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' invalid' : ''}`}>
      <label htmlFor={inputId}>
        {label}
        {optional ? <span className="opt"> (opsional)</span> : <span className="req" aria-hidden="true"> *</span>}
      </label>
      {children({ id: inputId, 'aria-invalid': !!error, 'aria-describedby': describedBy })}
      {hint && <span className="hint" id={hintId}>{hint}</span>}
      {error && <span className="err" id={errId} role="alert"><Icon name="alert" size={14} /> {error}</span>}
    </div>
  );
}

export default function Checkout() {
  const { lines, count, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [v, setV] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | error | done
  const [submitError, setSubmitError] = useState('');
  const lock = useRef(false);
  const formRef = useRef(null);
  const belowMin = rules.minTotalQty > 0 && count < rules.minTotalQty;

  const set = (k) => (e) => {
    const next = { ...v, [k]: e.target.value };
    setV(next);
    if (errors[k]) setErrors((p) => ({ ...p, [k]: validateCheckout(next, { count })[k] }));
  };
  const blur = (k) => () => setErrors((p) => ({ ...p, [k]: validateCheckout(v, { count })[k] }));

  if (!lines.length && status !== 'done') {
    return (
      <div className="container page">
        <EmptyState icon="cart" title="Belum ada pesanan untuk di-checkout"
          text="Tambahkan menu nasi box atau snack box ke keranjang terlebih dahulu."
          action={{ to: '/menu', label: 'Lihat Menu' }} />
      </div>
    );
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (lock.current || belowMin) return;
    const e = validateCheckout(v, { count });
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      const target = formRef.current?.querySelector(`[name="${firstKey}"]`);
      target?.focus();
      return;
    }
    lock.current = true;
    setStatus('submitting');
    setSubmitError('');
    try {
      const order = await submitOrder({
        customer: { name: v.name.trim(), phone: normalizePhone(v.phone) },
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
        orderDate: v.date,
        notes: v.notes.trim(),
      });
      setStatus('done');
      clear();
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch (err) {
      setStatus('error');
      setSubmitError(err?.message || 'Pesanan gagal dikirim. Silakan coba lagi.');
      lock.current = false;
    }
  }

  const busy = status === 'submitting';
  const minDate = minOrderDate();

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/cart" className="back"><Icon name="back" size={18} /> Kembali ke keranjang</Link>
      </nav>

      <header className="page-head">
        <div>
          <h1 className="page-title">Lengkapi <em>Data Pesanan</em></h1>
          <p className="muted">Tanpa perlu membuat akun. Setelah dikirim, Anda akan mendapat kode pesanan untuk konfirmasi dan pantau status via WhatsApp.</p>
        </div>
      </header>

      <div className="cart-grid checkout-grid">
        <form ref={formRef} className="checkout-form panel" onSubmit={onSubmit} noValidate aria-busy={busy}>

          {status === 'error' && (
            <Alert tone="error" title="Pesanan belum terkirim" role="alert">
              {submitError}
            </Alert>
          )}

          {belowMin && (
            <Alert tone="warning" title="Jumlah porsi belum memenuhi batas minimum">
              Minimal pemesanan {rules.minTotalQty} porsi. Saat ini baru {count} porsi di keranjang.
            </Alert>
          )}

          <Field name="name" label="Nama Pemesan" error={errors.name} hint="Nama yang akan dicantumkan pada pesanan.">
            {(a11y) => (
              <input {...a11y} name="name" type="text" value={v.name} onChange={set('name')} onBlur={blur('name')}
                autoComplete="name" placeholder="Nama lengkap / instansi" disabled={busy} />
            )}
          </Field>

          <div className="form-row">
            <Field name="phone" label="Nomor WhatsApp" error={errors.phone} hint="Format 08xx, 628xx, atau +628xx.">
              {(a11y) => (
                <input {...a11y} name="phone" type="tel" inputMode="tel" value={v.phone} onChange={set('phone')} onBlur={blur('phone')}
                  autoComplete="tel" placeholder="081234567890" disabled={busy} />
              )}
            </Field>

            <Field name="date" label="Tanggal Dibutuhkan" error={errors.date} hint={`Paling cepat ${formatDate(minDate)}.`}>
              {(a11y) => (
                <input {...a11y} name="date" type="date" min={minDate} value={v.date} onChange={set('date')} onBlur={blur('date')}
                  disabled={busy} />
              )}
            </Field>
          </div>

          {rules.askPickupMethod && (
            <Field name="pickup" label="Metode Pengambilan">
              {(a11y) => (
                <select {...a11y} name="pickup" value={v.pickup} onChange={set('pickup')} disabled={busy}>
                  <option value="ambil">Ambil Sendiri di Outlet/Dapur Nasi Kampus</option>
                </select>
              )}
            </Field>
          )}

          {rules.askAddress && (
            <Field name="address" label="Alamat Pengantaran" error={errors.address}>
              {(a11y) => (
                <textarea {...a11y} name="address" rows={3} value={v.address} onChange={set('address')} onBlur={blur('address')}
                  disabled={busy} />
              )}
            </Field>
          )}

          <Field name="notes" label="Catatan Tambahan" optional error={errors.notes}
            hint={`${v.notes.length}/${rules.notesMaxLength} karakter · tuliskan jam acara atau permintaan khusus.`}>
            {(a11y) => (
              <textarea {...a11y} name="notes" rows={3} maxLength={rules.notesMaxLength + 20}
                value={v.notes} onChange={set('notes')} onBlur={blur('notes')}
                placeholder="Misalnya: dibutuhkan pukul 11.30 WITA, 5 kotak tanpa sambal" disabled={busy} />
            )}
          </Field>

          <div className="checkout-explain">
            <Icon name="chat" size={18} />
            <p>
              <strong>Tidak ada pembayaran online di halaman ini.</strong> Setelah pesanan tercatat, Anda akan menghubungi admin melalui WhatsApp untuk konfirmasi ketersediaan serta kesepakatan pembayaran DP atau lunas.
            </p>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy || belowMin}>
            {busy ? <><Icon name="loader" size={18} className="spin" /> Mengirim pesanan…</> : <>Kirim Pesanan <Icon name="arrow" size={18} /></>}
          </button>
        </form>

        <aside className="panel summary-panel sticky" aria-label="Ringkasan item pesanan">
          <div className="summary-head">
            <h2>Ringkasan Pesanan</h2>
            <Link to="/cart" className="link-btn">Ubah</Link>
          </div>
          <ul className="checkout-items">
            {lines.map((l) => (
              <li key={l.id}>
                <div>
                  <strong>{l.qty} × {l.name}</strong>
                  <span>{rupiah(l.price)} / kotak</span>
                </div>
                <strong>{rupiah(l.price * l.qty)}</strong>
              </li>
            ))}
          </ul>
          <dl className="sum-list">
            <div className="sum-row"><dt>Total kotak</dt><dd>{count} kotak</dd></div>
            <div className="sum-row sum-total"><dt>Total pesanan</dt><dd>{rupiah(subtotal)}</dd></div>
          </dl>
          <p className="hint">
            Penyesuaian jumlah atau kebutuhan khusus dapat disepakati bersama admin melalui WhatsApp setelah pesanan terkirim.
          </p>
        </aside>
      </div>
    </div>
  );
}
