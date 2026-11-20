import { useState } from 'react';

/**
 * Foto produk dengan fallback yang rapi (tidak pernah tampil sebagai gambar rusak).
 * size: 'card' | 'sm' | 'hero' | 'plate' (bulat) | 'thumb'
 */
export default function ProductImage({
  product,
  size = 'card',
  eager = false,
  lowPriority = false,
  className = '',
  decorative = false,
}) {
  const [failed, setFailed] = useState(false);
  const src = product?.image;
  const alt = decorative ? '' : (product?.alt || product?.name || 'Foto menu');
  const initials = (product?.name || 'NK').split(' ').filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');

  return (
    <div className={`pimg pimg--${size} ${className}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          width="800"
          height="800"
          loading={eager ? undefined : 'lazy'}
          fetchPriority={eager ? 'high' : lowPriority ? 'low' : undefined}
          decoding={eager ? 'sync' : 'async'}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="pimg-fallback" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `${product?.name || 'Menu'} (foto belum tersedia)`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" />
            <circle cx="60" cy="60" r="32" fill="currentColor" fillOpacity=".12" />
          </svg>
          <span>{initials}</span>
          {size !== 'sm' && size !== 'thumb' && <small>Foto segera hadir</small>}
        </div>
      )}
    </div>
  );
}
