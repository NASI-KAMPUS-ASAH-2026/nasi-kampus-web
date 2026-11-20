import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import Icon from './Icon';
import { useAddToCart } from '../hooks/useAddToCart';
import { rupiah } from '../utils/format';
import { categoryLabel } from '../data/products';

/**
 * Kartu Menu Modern (Sesuai Gambar 1 & Gambar 2):
 * - Area foto di atas dengan tombol bulat '+' di pojok kanan atas untuk Quick Add
 * - Label kategori, nama produk tebal, rating bintang/lencana Best Seller
 * - Baris bawah: Harga jelas di kiri & tombol bulat dengan panah di kanan
 */
export default function ProductCard({ product: p, eager = false }) {
  const addToCart = useAddToCart();
  const [done, setDone] = useState(false);
  const timer = useRef(0);
  const btnRef = useRef(null);

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToCart(p, 1, btnRef.current)) {
      setDone(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 1400);
    }
  };

  return (
    <article className="pcard">
      <div className="pcard-media-wrap">
        <Link to={`/menu/${p.id}`} className="pcard-media" aria-label={`Lihat rincian ${p.name}`}>
          <ProductImage product={p} eager={eager} />
        </Link>

        {/* Lencana Best Seller / Kemasan */}
        <div className="pcard-badges">
          {p.bestSeller ? (
            <span className="pcard-badge pcard-badge--hot">Best Seller</span>
          ) : (
            p.packaging && <span className="pcard-badge pcard-badge--pack">{p.packaging}</span>
          )}
        </div>
      </div>

      <div className="pcard-body">
        <div className="pcard-meta-row">
          <span className="pcard-cat-label">{categoryLabel(p.category)}</span>
        </div>

        <h3 className="pcard-title">
          <Link to={`/menu/${p.id}`}>{p.name.toUpperCase()}</Link>
        </h3>

        <p className="pcard-desc">{p.description}</p>

        {/* Harga di Bagian Atas Tombol */}
        <div className="pcard-price-row">
          <div className="pcard-price">
            <strong>{rupiah(p.price)}</strong>
            <span>/kotak{p.packaging ? <span className="pcard-pack-note"> ({p.packaging})</span> : ''}</span>
          </div>
        </div>

        {/* Tombol Tambah ke Keranjang Full Sebaris di Bagian Bawah */}
        <div className="pcard-action-row">
          <button
            ref={btnRef}
            type="button"
            className={`btn btn-primary btn-block pcard-add-full-btn${done ? ' is-done' : ''}`}
            onClick={quickAdd}
            aria-label={`Tambah 1 ${p.name} ke keranjang`}
          >
            <Icon name={done ? 'check' : 'cart'} size={17} />
            <span>{done ? 'Berhasil Ditambahkan' : '+ Tambah ke Keranjang'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
