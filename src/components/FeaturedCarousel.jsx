import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';

function isReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function FeaturedCarousel({ items, renderSlide, label = 'Daftar paket andalan' }) {
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusText, setStatusText] = useState('');

  // Mutable refs for scroll/looping coordination without triggering re-renders mid-scroll
  const pendingTargetRef = useRef(null); // DOM index currently being scrolled to via controls
  const ignoreSettleAtRef = useRef(null); // scrollLeft at moment a new scroll was requested
  const lastSettledRef = useRef(0);
  const userInteractedRef = useRef(false);
  const queuedDirRef = useRef(0); // -1 or +1 if user tapped prev/next during unparked marker trip
  const rafScrollRef = useRef(0);
  const debounceTimerRef = useRef(0);
  const overflowUnlockRafRef = useRef(0);

  const canLoop = items.length >= 3;

  const isScrollableMode = useCallback(() => {
    const track = trackRef.current;
    if (!track) return false;
    return track.scrollWidth > track.clientWidth + 2;
  }, []);

  const getVisualSlides = useCallback(() => {
    const els = slideRefs.current.slice(0, items.length).filter(Boolean);
    return els
      .map((el, domIndex) => ({ el, domIndex, offset: el.offsetLeft }))
      .sort((a, b) => a.offset - b.offset);
  }, [items.length]);

  const getNearestDomIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const center = track.scrollLeft + track.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < items.length; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;
      const elCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(elCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [items.length]);

  /**
   * Apply or clear CSS `--current` parking while preserving the visual position of `anchorDomIdx`.
   */
  const applyParking = useCallback((nextCurrent, anchorDomIdx, { lockOverflow = true } = {}) => {
    const track = trackRef.current;
    if (!track || !canLoop || !isScrollableMode()) return;

    const anchorEl = slideRefs.current[anchorDomIdx];
    const currentProp = track.style.getPropertyValue('--current');
    const desiredProp = nextCurrent === null ? '' : String(nextCurrent);
    if (currentProp === desiredProp) return;

    const before = anchorEl ? anchorEl.offsetLeft : 0;

    track.style.scrollBehavior = 'auto';
    track.style.scrollSnapType = 'none';
    if (lockOverflow) {
      cancelAnimationFrame(overflowUnlockRafRef.current);
      track.style.overflowX = 'hidden';
    }

    if (nextCurrent === null) {
      track.style.removeProperty('--current');
    } else {
      track.style.setProperty('--current', String(nextCurrent));
    }

    const after = anchorEl ? anchorEl.offsetLeft : 0;
    if (anchorEl && after !== before) {
      track.scrollLeft += after - before;
    }

    track.style.scrollSnapType = '';
    track.style.scrollBehavior = '';

    if (lockOverflow) {
      // Wait 2 animation frames before restoring overflow-x to prevent iOS Safari reorder flicker
      overflowUnlockRafRef.current = requestAnimationFrame(() => {
        overflowUnlockRafRef.current = requestAnimationFrame(() => {
          if (trackRef.current) {
            trackRef.current.style.overflowX = '';
          }
        });
      });
    }
  }, [canLoop, isScrollableMode]);

  const scrollToDomSlide = useCallback((domIndex, { behavior } = {}) => {
    const track = trackRef.current;
    const targetEl = slideRefs.current[domIndex];
    if (!track || !targetEl) return;

    const targetCenter = targetEl.offsetLeft + targetEl.offsetWidth / 2;
    const currentCenter = track.scrollLeft + track.clientWidth / 2;
    const delta = targetCenter - currentCenter;

    if (Math.abs(delta) < 1) {
      pendingTargetRef.current = null;
      return;
    }

    pendingTargetRef.current = domIndex;
    ignoreSettleAtRef.current = track.scrollLeft;
    setActiveIndex(domIndex);

    const scrollBehavior = behavior || (isReducedMotion() ? 'auto' : 'smooth');
    track.scrollBy({ left: delta, behavior: scrollBehavior });
  }, []);

  const stepDirection = useCallback((dir) => {
    const track = trackRef.current;
    if (!track || !isScrollableMode() || items.length < 2) return;

    userInteractedRef.current = true;
    const visual = getVisualSlides();
    const baseDomIdx = pendingTargetRef.current !== null ? pendingTargetRef.current : getNearestDomIndex();
    const baseVisualPos = visual.findIndex((v) => v.domIndex === baseDomIdx);
    if (baseVisualPos === -1) return;

    const nextVisualPos = baseVisualPos + dir;
    if (nextVisualPos < 0 || nextVisualPos >= visual.length) {
      // Slides are temporarily in DOM order (mid-marker trip) — hold click and replay on settle
      if (canLoop) {
        queuedDirRef.current = dir;
      }
      return;
    }

    const target = visual[nextVisualPos];
    scrollToDomSlide(target.domIndex);
  }, [canLoop, getNearestDomIndex, getVisualSlides, isScrollableMode, items.length, scrollToDomSlide]);

  const goToMarker = useCallback((domIndex) => {
    const track = trackRef.current;
    if (!track || !isScrollableMode()) return;

    userInteractedRef.current = true;
    const currentDom = pendingTargetRef.current !== null ? pendingTargetRef.current : getNearestDomIndex();
    if (domIndex === currentDom && pendingTargetRef.current === null) return;

    // Unpark slides to natural DOM order before marker travel (without overflow lock so Safari starts scroll)
    if (canLoop) {
      applyParking(null, currentDom, { lockOverflow: false });
    }
    scrollToDomSlide(domIndex);
  }, [applyParking, canLoop, getNearestDomIndex, isScrollableMode, scrollToDomSlide]);

  const handleSettled = useCallback(() => {
    const track = trackRef.current;
    if (!track || !isScrollableMode()) return;

    // Ignore settle firing at the exact starting scroll position of a newly requested scroll
    if (
      pendingTargetRef.current !== null &&
      ignoreSettleAtRef.current !== null &&
      Math.abs(track.scrollLeft - ignoreSettleAtRef.current) < 1
    ) {
      return;
    }

    ignoreSettleAtRef.current = null;
    const settledIdx = getNearestDomIndex();
    pendingTargetRef.current = null;
    setActiveIndex(settledIdx);

    const hasQueued = queuedDirRef.current !== 0;

    if (canLoop) {
      applyParking(settledIdx, settledIdx, { lockOverflow: !hasQueued });
    }

    if (userInteractedRef.current && settledIdx !== lastSettledRef.current) {
      const item = items[settledIdx];
      setStatusText(`Slide ${settledIdx + 1} dari ${items.length}${item?.name ? `: ${item.name}` : ''}`);
    }
    lastSettledRef.current = settledIdx;

    if (hasQueued) {
      const dir = queuedDirRef.current;
      queuedDirRef.current = 0;
      stepDirection(dir);
    }
  }, [applyParking, canLoop, getNearestDomIndex, isScrollableMode, items, stepDirection]);

  // Initialize sibling-count fallback, initial parking on mobile, and scroll / scrollend listeners
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !items.length) return;

    // Only set --children-count when sibling-count() is unsupported
    if (typeof CSS !== 'undefined' && !CSS.supports('order: sibling-count()')) {
      track.style.setProperty('--children-count', String(items.length));
    } else {
      track.style.removeProperty('--children-count');
    }

    const syncLayout = () => {
      if (!trackRef.current) return;
      if (isScrollableMode()) {
        const idx = getNearestDomIndex();
        lastSettledRef.current = idx;
        setActiveIndex(idx);
        if (canLoop) {
          applyParking(idx, idx, { lockOverflow: false });
          // Ensure first slide is cleanly centered on initial load
          const el = slideRefs.current[idx];
          if (el) {
            const targetCenter = el.offsetLeft + el.offsetWidth / 2;
            const currentCenter = trackRef.current.scrollLeft + trackRef.current.clientWidth / 2;
            if (Math.abs(targetCenter - currentCenter) > 1) {
              trackRef.current.style.scrollBehavior = 'auto';
              trackRef.current.scrollLeft += targetCenter - currentCenter;
              trackRef.current.style.scrollBehavior = '';
            }
          }
        }
      } else {
        trackRef.current.style.removeProperty('--current');
        trackRef.current.style.overflowX = '';
        trackRef.current.style.scrollSnapType = '';
      }
    };

    const initRaf = requestAnimationFrame(syncLayout);

    const supportsScrollEnd = 'onscrollend' in window;

    const onScroll = () => {
      if (!isScrollableMode()) return;

      if (pendingTargetRef.current === null) {
        userInteractedRef.current = true;
        if (!rafScrollRef.current) {
          rafScrollRef.current = requestAnimationFrame(() => {
            rafScrollRef.current = 0;
            const nearest = getNearestDomIndex();
            setActiveIndex((prev) => (prev === nearest ? prev : nearest));
          });
        }
      }

      if (!supportsScrollEnd) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = window.setTimeout(handleSettled, 120);
      }
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    if (supportsScrollEnd) {
      track.addEventListener('scrollend', handleSettled);
    }

    const mq = window.matchMedia('(max-width: 767px)');
    const onMqChange = () => requestAnimationFrame(syncLayout);
    mq.addEventListener?.('change', onMqChange);

    return () => {
      cancelAnimationFrame(initRaf);
      cancelAnimationFrame(rafScrollRef.current);
      cancelAnimationFrame(overflowUnlockRafRef.current);
      clearTimeout(debounceTimerRef.current);
      track.removeEventListener('scroll', onScroll);
      if (supportsScrollEnd) {
        track.removeEventListener('scrollend', handleSettled);
      }
      mq.removeEventListener?.('change', onMqChange);
    };
  }, [applyParking, canLoop, getNearestDomIndex, handleSettled, isScrollableMode, items.length]);

  return (
    <div
      className="feat-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      {/* Tombol Sebelumnya & Berikutnya (Mobile Only, sebelum track secara DOM order) */}
      {items.length > 1 && (
        <div className="feat-carousel-controls">
          <button
            type="button"
            className="feat-carousel-btn feat-carousel-btn--prev"
            aria-label="Slide sebelumnya"
            onClick={() => stepDirection(-1)}
          >
            <Icon name="chevronLeft" size={18} />
          </button>
          <button
            type="button"
            className="feat-carousel-btn feat-carousel-btn--next"
            aria-label="Slide berikutnya"
            onClick={() => stepDirection(1)}
          >
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
      )}

      {/* Track Scroll-Snap Horizontal (Mobile) / Grid 3 Kolom (Desktop) */}
      <div
        ref={trackRef}
        className="feat-carousel-track"
        tabIndex={0}
        role="group"
        aria-label="Daftar slide paket andalan"
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            ref={(el) => { slideRefs.current[i] = el; }}
            className={`feat-carousel-slide${activeIndex === i ? ' is-active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${items.length}`}
          >
            {renderSlide(item, i)}
          </div>
        ))}
      </div>

      {/* Pengumuman Status Slide untuk Screen Reader */}
      <p className="sr-only" role="status" aria-live="polite">
        {statusText}
      </p>

      {/* Indikator Dot Interaktif (Mobile Only) */}
      {items.length > 1 && (
        <nav className="feat-carousel-markers" aria-label="Pilih slide paket andalan">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className="feat-carousel-dot"
              aria-label={`Lihat ${item.name} (${i + 1} dari ${items.length})`}
              aria-current={activeIndex === i ? 'true' : undefined}
              onClick={() => goToMarker(i)}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
