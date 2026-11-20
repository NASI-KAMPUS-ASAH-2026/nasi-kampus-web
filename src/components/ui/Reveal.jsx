import { createElement, useEffect, useRef, useState } from 'react';

const supportsIO = typeof window !== 'undefined' && 'IntersectionObserver' in window;

/**
 * Menampilkan konten dengan animasi saat masuk viewport (sekali saja).
 * Konten TIDAK pernah tersembunyi permanen: tanpa IntersectionObserver, atau bila
 * pengguna memilih "reduce motion", konten langsung terlihat (lihat CSS .reveal).
 */
export default function Reveal({ as = 'div', delay = 0, className = '', children, style, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(!supportsIO);

  useEffect(() => {
    if (!supportsIO || visible) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setVisible(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -3% 0px', threshold: 0.04 });
    io.observe(el);
    // Pengaman: jika observer tidak pernah terpanggil, tampilkan setelah 6 detik.
    const t = setTimeout(() => setVisible(true), 6000);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [visible]);

  return createElement(as, {
    ref,
    className: `reveal${visible ? ' is-visible' : ''}${className ? ' ' + className : ''}`,
    style: { ...style, '--reveal-delay': `${delay}ms` },
    ...rest,
  }, children);
}
