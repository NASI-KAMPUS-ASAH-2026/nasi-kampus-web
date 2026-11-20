import { prefersReducedMotion } from '../hooks/useMotion';

/**
 * Animasi "terbang ke keranjang": gambar kecil bergerak dari tombol ke ikon keranjang.
 * Murni dekoratif (aria-hidden), memakai Web Animations API (transform + opacity).
 */
export function flyToCart(fromEl, imageSrc) {
  if (typeof document === 'undefined' || !fromEl || prefersReducedMotion()) return;
  const target = document.querySelector('[data-cart-target]');
  if (!target || !target.getClientRects().length) return;
  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 44;
  const dot = document.createElement('div');
  dot.className = 'fly-dot';
  dot.setAttribute('aria-hidden', 'true');
  if (imageSrc) dot.style.backgroundImage = `url("${imageSrc}")`;
  dot.style.left = `${a.left + a.width / 2 - size / 2}px`;
  dot.style.top = `${a.top + a.height / 2 - size / 2}px`;
  document.body.appendChild(dot);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = dot.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 60}px) scale(.8)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: 0.2 },
  ], { duration: 620, easing: 'cubic-bezier(.5,0,.3,1)' });
  anim.onfinish = () => dot.remove();
  anim.oncancel = () => dot.remove();
}
