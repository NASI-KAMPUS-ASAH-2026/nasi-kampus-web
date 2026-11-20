import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductImage from '../../components/ProductImage';
import ProductCard from '../../components/ProductCard';
import QtyStepper from '../../components/QtyStepper';
import Icon from '../../components/Icon';
import { BlockSkeleton, EmptyState, ErrorState } from '../../components/States';
import Reveal from '../../components/ui/Reveal';
import { useAsync } from '../../hooks/useAsync';
import { useCart } from '../../context/CartContext';
import { useAddToCart } from '../../hooks/useAddToCart';
import { getProduct, getProducts } from '../../services/api';
import { categoryLabel } from '../../data/products';
import { CONFIG } from '../../config';
import { rupiah } from '../../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: p, loading, error, reload } = useAsync(() => getProduct(id), [id]);
  const { data: all } = useAsync(getProducts, []);
  const { count, qtyOf } = useCart();
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    setQty(1);
    setAdded(false);
  }, [id]);

  if (loading) return <div className="container page"><BlockSkeleton h={440} label="Memuat detail paket" /></div>;
  if (error) return <div className="container page"><ErrorState title="Detail paket gagal dimuat" onRetry={reload} /></div>;
  if (!p) {
    return (
      <div className="container page">
        <EmptyState
          icon="box"
          title="Paket tidak ditemukan"
          text="Menu yang Anda cari tidak tersedia atau alamat halaman tidak sesuai."
          action={{ to: '/menu', label: 'Lihat Semua Menu' }}
        />
      </div>
    );
  }

  const inCart = qtyOf(p.id);
  const related = (all || []).filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);

  const onAdd = () => {
    if (addToCart(p, qty, btnRef.current)) setAdded(true);
  };

  return (
    <div className="product-detail-screen">
      {/* Top Header: Tombol Kembali + Judul Paket di Bagian Atas (Icon Keranjang Hanya di Navbar Utama) */}
      <div className="container">
        <header className="detail-top-nav">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="detail-nav-back-btn"
            aria-label="Kembali"
          >
            <Icon name="back" size={20} />
          </button>

          <h1 className="detail-top-title">{p.name.toUpperCase()}</h1>

          {/* Spacer kanan penyeimbang agar judul tetap simetris di tengah tanpa icon keranjang duplikat */}
          <div className="detail-nav-spacer" aria-hidden="true" />
        </header>
      </div>

      <div className="container detail-content-wrap">
        <div className="detail-grid-modern">
          {/* Bagian Kiri: Foto Piring Makanan Besar Melayang */}
          <div className="detail-hero-stage">
            <div className="detail-plate-ambient" aria-hidden="true" />
            <div className="detail-plate-frame">
              <ProductImage product={p} size="hero" eager />
            </div>
          </div>

          {/* Lembar Konten Kanan: Bersih, Rapi, Aksi di Dalam Card */}
          <div className="detail-sheet-card">
            <div className="detail-sheet-meta">
              <span className="detail-sheet-cat">{categoryLabel(p.category)}</span>

              {/* Tanda Best Seller & Kemasan sebagai teks polos murni tanpa emoji */}
              <div className="detail-meta-indicators">
                {p.bestSeller && (
                  <span className="detail-indicator detail-indicator--hot">
                    Best Seller
                  </span>
                )}
                {p.packaging && (
                  <span className="detail-indicator detail-indicator--pack">
                    {p.packaging}
                  </span>
                )}
              </div>
            </div>

            <p className="detail-sheet-desc">{p.description}</p>

            {/* Harga di Bagian Atas */}
            <div className="detail-price-highlight">
              <strong>{rupiah(p.price)}</strong>
              <span>/ kotak {p.packaging ? `(${p.packaging})` : ''}</span>
            </div>

            {inCart > 0 && (
              <div className="in-cart-pill" role="status">
                <Icon name="cart" size={16} />
                <span>Sudah ada <strong>{inCart} kotak</strong> di keranjang Anda.</span>
                <Link to="/cart">Lihat keranjang</Link>
              </div>
            )}

            {/* Aksi Pemesanan di Bagian Bawah: Stepper & Tombol Tambah Keranjang Full Sebaris */}
            <div className="detail-card-actions">
              <div className="detail-card-qty-row">
                <div className="detail-card-qty-label">
                  <span className="qty-sub">Jumlah Porsi</span>
                  <strong className="qty-total">{rupiah(p.price * qty)}</strong>
                </div>
                <QtyStepper
                  value={qty}
                  onChange={(n) => { setQty(n); setAdded(false); }}
                  label={`Jumlah kotak ${p.name}`}
                  size="md"
                />
              </div>

              {/* Tombol Tambah ke Keranjang Full Sebaris di Bawah */}
              <div className="detail-card-full-actions">
                <button
                  ref={btnRef}
                  type="button"
                  className="btn btn-primary btn-block detail-card-add-full"
                  onClick={onAdd}
                >
                  <Icon name="cart" size={19} />
                  <span>{added ? 'Ditambahkan ke Keranjang' : '+ Tambah ke Keranjang'}</span>
                </button>

                <a
                  href={`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(`Halo Nasi Kampus Samarinda, saya ingin tanya paket ${p.name} (Rp ${p.price.toLocaleString('id-ID')}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-block detail-card-wa-full"
                  aria-label="Tanya via WhatsApp"
                  title="Tanya Admin via WhatsApp"
                >
                  <Icon name="chat" size={18} />
                  <span>Tanya via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Sejenis / Rekomendasi Lainnya */}
        {related.length > 0 && (
          <section className="section detail-related" aria-labelledby="rel-title">
            <Reveal className="section-head">
              <div>
                <span className="eyebrow eyebrow--light"><span className="dot" />Pilihan Lain</span>
                <h2 id="rel-title">Menu <em>{categoryLabel(p.category)}</em> Lainnya</h2>
              </div>
              <Link to={`/menu?kategori=${p.category}`} className="btn btn-outline btn-sm">Lihat Semua</Link>
            </Reveal>

            <div className="collection-grid-2col">
              {related.map((r) => (
                <Reveal key={r.id} className="grid-item">
                  <ProductCard product={r} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
