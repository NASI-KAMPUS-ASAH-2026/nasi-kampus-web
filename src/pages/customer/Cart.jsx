import { Link, useNavigate } from 'react-router-dom';
import ProductImage from '../../components/ProductImage';
import QtyStepper from '../../components/QtyStepper';
import Icon from '../../components/Icon';
import { EmptyState } from '../../components/States';
import { useCart } from '../../context/CartContext';
import { categoryLabel } from '../../data/products';
import { rupiah } from '../../utils/format';

export default function Cart() {
  const { lines, count, subtotal, setQty, remove, clear } = useCart();
  const navigate = useNavigate();

  if (!lines.length) {
    return (
      <div className="container page">
        <EmptyState
          icon="cart"
          title="Keranjang masih kosong"
          text="Pilih menu nasi kotak atau snack box terlebih dahulu, lalu kembali ke sini untuk mengatur jumlah porsi."
          action={{ to: '/menu', label: 'Jelajahi Menu' }}
        />
      </div>
    );
  }

  return (
    <div className="container page cart-page-modern">
      {/* Top Header Mobile sesuai Gambar 1: Tombol Kembali + Judul 'Keranjang Saya' */}
      <header className="mobile-cart-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cart-back-btn"
          aria-label="Kembali"
        >
          <Icon name="back" size={20} />
        </button>
        <h1 className="mobile-cart-title">Keranjang Saya</h1>
        <button
          type="button"
          className="cart-clear-link"
          onClick={clear}
          aria-label="Kosongkan seluruh keranjang"
          title="Kosongkan keranjang"
        >
          <Icon name="trash" size={17} />
        </button>
      </header>

      <div className="cart-grid">
        <div className="cart-main-col">
          {/* Header Seksi: Order Summary + Tombol Tambah Menu / Edit sesuai Gambar 1 */}
          <div className="order-summary-head">
            <h2>Daftar Pesanan ({count} Kotak)</h2>
            <Link to="/menu" className="cart-edit-link">
              <span>+ Tambah Menu</span>
            </Link>
          </div>

          {/* Daftar Kartu Pesanan Sesuai Gambar 1 */}
          <ul className="cart-modern-list" aria-label="Daftar item di keranjang">
            {lines.map((l) => (
              <li className="cart-modern-item" key={l.id}>
                <Link to={`/menu/${l.id}`} className="cart-item-thumb-box" aria-label={`Lihat detail ${l.name}`}>
                  <ProductImage product={l} size="sm" />
                </Link>

                <div className="cart-item-info">
                  <div className="cart-item-meta">
                    <span className="cart-item-cat">{categoryLabel(l.category)}</span>
                    <button
                      type="button"
                      className="cart-item-remove"
                      onClick={() => remove(l.id)}
                      aria-label={`Hapus ${l.name} dari keranjang`}
                      title="Hapus"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>

                  <h3 className="cart-item-title">
                    <Link to={`/menu/${l.id}`}>{l.name}</Link>
                  </h3>

                  <div className="cart-item-price-row">
                    <span className="cart-item-unit-price">{rupiah(l.price)}</span>
                    <div className="cart-item-stepper-wrap">
                      <QtyStepper
                        value={l.qty}
                        min={1}
                        onChange={(n) => setQty(l.id, n)}
                        label={`Jumlah ${l.name}`}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel Overview (Ringkasan Biaya) Sesuai Gambar 1 */}
        <aside className="panel cart-overview-card sticky" aria-label="Ringkasan biaya">
          <h2 className="overview-title">Ringkasan Biaya</h2>

          <dl className="overview-list">
            <div className="overview-row">
              <dt>Total Menu</dt>
              <dd>{lines.length} jenis paket</dd>
            </div>
            <div className="overview-row">
              <dt>Jumlah Kotak</dt>
              <dd>{count} kotak</dd>
            </div>
            <div className="overview-row overview-row--total">
              <dt>Estimasi Total</dt>
              <dd>
                <strong>{rupiah(subtotal)}</strong>
              </dd>
            </div>
          </dl>

          <p className="overview-note">
            Harga di atas merupakan estimasi awal. Kesepakatan jadwal antar dan konfirmasi pembayaran diatur langsung melalui WhatsApp admin kami.
          </p>

          {/* Tombol Kapsul Penuh 'Lanjut Checkout' / 'Order Now' Sesuai Gambar 1 */}
          <Link className="btn btn-primary btn-lg btn-block cart-order-now-btn" to="/checkout">
            <span>Lanjut ke Checkout</span>
            <Icon name="arrow" size={18} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
