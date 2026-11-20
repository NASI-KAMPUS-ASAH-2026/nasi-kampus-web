import { useState } from 'react';
import { BRAND_LOGO } from '../data/images';

/** Menampilkan logo resmi Nasi Kampus Samarinda (/assets/logo/logo-nasi-kampus.svg). */
export default function BrandMark({ size = 46 }) {
  const [failed, setFailed] = useState(false);

  if (!failed && BRAND_LOGO) {
    return (
      <img
        src={BRAND_LOGO}
        alt=""
        width={size}
        height={size}
        className="brand-logo"
        loading="eager"
        decoding="sync"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="44" height="44" rx="14" fill="#B91C1C" />
      <path d="M11 25h26a13 13 0 01-26 0z" fill="#FFF7ED" />
    </svg>
  );
}
