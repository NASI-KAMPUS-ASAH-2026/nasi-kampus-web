import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import ProductImage from '../../components/ProductImage';
import FeaturedCarousel from '../../components/FeaturedCarousel';
import { ErrorState, GridSkeleton } from '../../components/States';
import Icon from '../../components/Icon';
import Reveal from '../../components/ui/Reveal';
import { useAsync } from '../../hooks/useAsync';
import { useAddToCart } from '../../hooks/useAddToCart';
import { getProducts } from '../../services/api';
import { CATEGORIES } from '../../data/products';
import { HERO_IMAGE } from '../../data/images';
import { CONFIG } from '../../config';
import { rupiah } from '../../utils/format';

const SPOTLIGHT_IDS = ['paket-2', 'paket-4', 'paket-bebek'];

const STEPS = [
  [
    'grid',
    '1. Pilih Paket & Jumlah',
    'Pilih Paket Nasi Kotak (mulai Rp 12.000) atau Snack Box (mulai Rp 5.000), lalu tentukan jumlah kotak.',
  ],
  [
    'calendar',
    '2. Isi Data & Tanggal Acara',
    'Lengkapi nama, nomor WhatsApp aktif, dan tanggal dibutuhkan tanpa perlu membuat akun.',
  ],
  [
    'chat',
    '3. Konfirmasi WA & Pantau',
    'Kirim rincian pesanan ke WhatsApp admin untuk verifikasi DP dan pantau progresnya di halaman Lacak.',
  ],
];

function FeaturedCard({ product: p }) {
  const addToCart = useAddToCart();
  const [done, setDone] = useState(false);
  const timer = useRef(0);
  const btnRef = useRef(null);

  const onQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToCart(p, 1, btnRef.current)) {
      setDone(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 1400);
    }
  };

  return (
    <article className="feat-card">
      <div className="feat-media-box">
        <ProductImage product={p} eager />
        {p.bestSeller && <span className="feat-badge">Best Seller</span>}
      </div>

      <div className="feat-body">
        <h3 className="feat-title">
          <Link to={`/menu/${p.id}`} className="card-link">
            {p.name}
          </Link>
        </h3>

        <p className="feat-desc">{p.description}</p>

        <div className="feat-price-row">
          <span className="feat-price">{rupiah(p.price)}</span>
          <span className="feat-unit">/ kotak</span>
        </div>

        <footer className="feat-action-row">
          <button
            ref={btnRef}
            type="button"
            className={`feat-add-full-btn${done ? ' is-done' : ''}`}
            onClick={onQuickAdd}
            aria-label={`Tambah 1 ${p.name} ke keranjang`}
          >
            <Icon name={done ? 'check' : 'plus'} size={16} />
            <span>{done ? 'Masuk Keranjang' : 'Tambah Pesanan'}</span>
          </button>
        </footer>
      </div>
    </article>
  );
}

export default function Home() {
  const { data, loading, error, reload } = useAsync(getProducts, []);
  const [activeCat, setActiveCat] = useState('all');

  const all = data || [];
  const catCounts = useMemo(() => ({
    all: all.length,
    'nasi-box': all.filter((p) => p.category === 'nasi-box').length,
    'snack-box': all.filter((p) => p.category === 'snack-box').length,
  }), [all]);

  const spotlights = useMemo(
    () => SPOTLIGHT_IDS.map((id) => all.find((p) => p.id === id)).filter(Boolean),
    [all]
  );

  const previewNasi = useMemo(
    () => all.filter((p) => p.category === 'nasi-box').slice(0, 4),
    [all]
  );
  const previewSnack = useMemo(
    () => all.filter((p) => p.category === 'snack-box').slice(0, 4),
    [all]
  );
  const filteredCategoryList = useMemo(() => {
    if (activeCat === 'all') return [];
    return all.filter((p) => p.category === activeCat);
  }, [all, activeCat]);

  return (
    <>
      {/* ==================== 1. HERO + TENTANG KAMI TERINTEGRASI (Cahaya Merah Studio & Aroma Hangat Minimalis) ==================== */}
      <section className="hero hero--editorial" id="tentang-kami" aria-labelledby="hero-title">
        <div className="hero-glow-stage" aria-hidden="true">
          <span className="hero-orb hero-orb--crimson" />
          <span className="hero-orb hero-orb--amber" />
        </div>

        <div className="container hero-editorial-in">
          <header className="hero-editorial-header hero-enter" style={{ '--d': '60ms' }}>
            <h1 id="hero-title" className="hero-editorial-title">
              <span className="hero-editorial-sub">Nikmati Sajian</span>
              <span className="hero-editorial-main">Nasi Kampus</span>
            </h1>
            <p className="hero-editorial-lead">
              Menyajikan Nasi Kotak &amp; Snack Box higienis untuk kegiatan kampus, kantor, dan acara keluarga.
            </p>
          </header>

          <div className="hero-editorial-stage">
            <div className="hero-centerpiece hero-enter" style={{ '--d': '180ms' }}>
              <div className="hero-steam" aria-hidden="true">
                <span className="hero-steam-wisp hero-steam-wisp--1" />
                <span className="hero-steam-wisp hero-steam-wisp--2" />
                <span className="hero-steam-wisp hero-steam-wisp--3" />
              </div>
              <img
                src={HERO_IMAGE}
                alt="Nasi Kotak Nasi Kampus Samarinda berisi nasi putih, ayam bumbu serundeng, sambal, telur, kacang, dan lalapan timun"
                className="hero-editorial-img"
                width="760"
                height="486"
                fetchPriority="high"
              />
              <Link className="hero-cta-creative" to="/menu">
                <span className="hero-cta-text">Jelajahi Menu</span>
                <span className="hero-cta-badge" aria-hidden="true">
                  <Icon name="arrowUpRight" size={16} />
                </span>
              </Link>
            </div>

            <aside className="hero-side hero-side--left hero-enter" style={{ '--d': '280ms' }} aria-label="Berdiri sejak 2020 di Samarinda">
              <div className="hero-typo-mark">
                <span className="hero-typo-kicker">Berdiri Sejak</span>
                <span className="hero-typo-big">2020</span>
                <span className="hero-typo-meta">
                  <em>Samarinda</em> · Kaltim
                </span>
              </div>
            </aside>

            <aside className="hero-side hero-side--right hero-enter" style={{ '--d': '280ms' }} aria-label="Jam operasional 07.00 sampai 17.00 WITA setiap hari">
              <div className="hero-typo-mark">
                <span className="hero-typo-kicker">Jam Operasional</span>
                <span className="hero-typo-big">
                  07<span className="hero-typo-dash">–</span>17
                  <sup className="hero-typo-unit">WITA</sup>
                </span>
                <span className="hero-typo-meta">
                  <em>Buka</em> · Setiap Hari
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ==================== 2. CARA PESAN ==================== */}
      <section className="steps-section" id="cara-pesan" aria-labelledby="steps-title">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <h2 id="steps-title">
              Cara Memesan <em>Tanpa Ribet</em>
            </h2>
            <p>Cukup 3 langkah praktis untuk memesan konsumsi acara Anda di Samarinda.</p>
          </Reveal>

          <ol className="steps">
            {STEPS.map(([ic, t, d], i) => (
              <Reveal as="li" key={t} className="step">
                <span className="step-no">0{i + 1}</span>
                <span className="step-ic">
                  <Icon name={ic} size={22} />
                </span>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ==================== 3. MENU ANDALAN (Horizontal) ==================== */}
      <section className="featured-section" id="menu-andalan" aria-labelledby="best-title">
        <div className="container">
          <Reveal className="featured-head">
            <h2 id="best-title" className="featured-title">
              Paket Andalan <em>Kami</em>
            </h2>
            <p>Menu favorit yang paling sering dipesan untuk kegiatan kampus, kantor, dan acara keluarga.</p>
          </Reveal>

          {loading && <GridSkeleton n={3} />}
          {error && <ErrorState title="Menu gagal dimuat" onRetry={reload} />}
          {!loading && !error && spotlights.length > 0 && (
            <FeaturedCarousel
              items={spotlights}
              label="Daftar paket andalan kami"
              renderSlide={(p) => <FeaturedCard product={p} />}
            />
          )}
        </div>
      </section>

      {/* ==================== 4. TAMPILAN SEBAGIAN MENU (Koleksi Menu Sekarang) ==================== */}
      <section className="menu-showcase" id="koleksi-menu" aria-labelledby="choose-title">
        <div className="container">
          <Reveal className="collection-header-wrap">
            <div className="collection-head-top">
              <div>
                <h2 id="choose-title" className="collection-title">
                  Koleksi Menu <em>Nasi Kampus</em>
                </h2>
              </div>
              <Link to="/menu" className="collection-see-all-btn">
                <span>Lihat Semua ({all.length})</span>
                <Icon name="arrow" size={15} />
              </Link>
            </div>

            <div className="cat-columns" role="tablist" aria-label="Filter kategori menu">
              {CATEGORIES.map((c) => {
                const isActive = activeCat === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`cat-col${isActive ? ' is-active' : ''}`}
                    onClick={() => setActiveCat(c.id)}
                  >
                    <span className="cat-col-title">{c.label}</span>
                    <span className="cat-col-count">{catCounts[c.id]} Pilihan</span>
                    {isActive && <span className="cat-col-bar" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {loading && <GridSkeleton n={6} />}
          {error && <ErrorState title="Menu gagal dimuat" onRetry={reload} />}
          {!loading && !error && (
            <>
              {activeCat === 'all' ? (
                <div className="home-menu-groups">
                  <div className="home-menu-group">
                    <div className="home-group-head">
                      <div>
                        <h3 className="home-group-title">Paket Nasi Kotak</h3>
                        <p className="home-group-sub">Sajian nasi lengkap, ayam krispi/bumbu, lalapan &amp; sambal</p>
                      </div>
                      <Link to="/menu?kategori=nasi-box" className="home-group-link">
                        Lihat Semua Nasi Kotak ({catCounts['nasi-box']}) <Icon name="arrow" size={14} />
                      </Link>
                    </div>
                    <div className="collection-grid-2col">
                      {previewNasi.map((p) => (
                        <Reveal key={p.id} className="grid-item">
                          <ProductCard product={p} eager />
                        </Reveal>
                      ))}
                    </div>
                  </div>

                  <div className="home-menu-group">
                    <div className="home-group-head">
                      <div>
                        <h3 className="home-group-title">Pilihan Snack Box</h3>
                        <p className="home-group-sub">Kue basah &amp; kering higienis, air mineral, cocok untuk seminar &amp; rapat</p>
                      </div>
                      <Link to="/menu?kategori=snack-box" className="home-group-link">
                        Lihat Semua Snack Box ({catCounts['snack-box']}) <Icon name="arrow" size={14} />
                      </Link>
                    </div>
                    <div className="collection-grid-2col">
                      {previewSnack.map((p) => (
                        <Reveal key={p.id} className="grid-item">
                          <ProductCard product={p} eager />
                        </Reveal>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="collection-grid-2col">
                  {filteredCategoryList.map((p) => (
                    <Reveal key={p.id} className="grid-item">
                      <ProductCard product={p} eager />
                    </Reveal>
                  ))}
                </div>
              )}

              <div className="collection-more-action">
                <Link
                  className="collection-pill-more-btn"
                  to={activeCat === 'all' ? '/menu' : `/menu?kategori=${activeCat}`}
                >
                  <span>Lihat Seluruh Menu di Katalog</span>
                  <Icon name="arrow" size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ==================== 5. CTA AKHIR ==================== */}
      <section className="container section section--tight" aria-labelledby="cta-title">
        <Reveal className="band">
          <div className="band-copy">
            <span className="eyebrow">
              <span className="dot dot--green" /> Siap Melayani Acara Anda
            </span>
            <h2 id="cta-title">Butuh Konsumsi Nasi Kotak atau Snack Box?</h2>
            <p>
              Susun pesanan Anda di website sekarang atau hubungi kami melalui WhatsApp <strong>{CONFIG.whatsappDisplay}</strong> maupun email <strong>{CONFIG.email}</strong>.
            </p>
            <div className="row">
              <Link className="btn btn-light btn-lg" to="/menu">
                Mulai Pilih Menu <Icon name="arrow" size={18} />
              </Link>
              <a
                className="btn btn-ghost-light btn-lg"
                href={`https://wa.me/${CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" size={18} /> Tanya via WhatsApp
              </a>
            </div>
          </div>
          <div className="band-art" aria-hidden="true">
            <img
              src={HERO_IMAGE}
              alt=""
              loading="lazy"
              width="600"
              height="384"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
