import { useState, useEffect } from 'react';
import { productAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';

const CATEGORY_ICONS = { Tümü: '🍴', All: '🍴', Çorba: '🍲', Yemek: '🍽️', Tatlı: '🍮', İçecek: '☕', Diğer: '🥡' };
const CATEGORIES_TR = ['Tümü', 'Çorba', 'Yemek', 'Tatlı', 'İçecek', 'Diğer'];
const CATEGORIES_EN = ['All', 'Çorba', 'Yemek', 'Tatlı', 'İçecek', 'Diğer'];

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const CATEGORIES = lang === 'tr' ? CATEGORIES_TR : CATEGORIES_EN;
  const ALL_KEY = lang === 'tr' ? 'Tümü' : 'All';

  const fetchProducts = async () => {
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search.trim()) params.search = search.trim();
      const res = await productAPI.getAll(params);
      setProducts(Array.isArray(res.data) ? res.data : []);
      setApiError(false);
    } catch (err) {
      console.error(err);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [category, search, lang]);

  useEffect(() => {
    const interval = setInterval(fetchProducts, 60000);
    return () => clearInterval(interval);
  }, [category, search]);

  return (
    <div className="page-enter">
      {/* Hero */}
      <div style={heroStyle}>
        <div className="container">
          <div style={heroBadge}>
            <span>🌱</span> {t('home.badge')}
          </div>
          <h1 style={heroTitle}>
            {t('home.title').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
          <p style={heroSub}>{t('home.sub')}</p>

          {/* Search */}
          <div style={searchWrap}>
            <span style={searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={t('home.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInput}
            />
            {search && (
              <button onClick={() => setSearch('')} style={clearBtn}>✕</button>
            )}
          </div>

          {/* Stats strip */}
          <div style={statsStrip}>
            <div style={statItem}><span style={statNum}>{t('home.stat1bold')}</span> {t('home.stat1')}</div>
            <div style={statDivider} />
            <div style={statItem}><span style={statNum}>{t('home.stat2bold')}</span> {t('home.stat2')}</div>
            <div style={statDivider} />
            <div style={statItem}><span style={statNum}>{t('home.stat3bold')}</span> {t('home.stat3')}</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {/* Categories */}
        <div style={catRow}>
          {CATEGORIES.map((cat) => {
            const isAll = cat === ALL_KEY;
            const active = isAll ? category === 'all' : category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(isAll ? 'all' : cat)}
                style={{
                  ...catBtn,
                  background: active ? 'var(--terracotta)' : 'var(--warm-white)',
                  color: active ? 'white' : 'var(--charcoal)',
                  borderColor: active ? 'var(--terracotta)' : 'var(--border)',
                }}
              >
                {CATEGORY_ICONS[cat] || '🍴'} {cat}
              </button>
            );
          })}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="spinner" />
        ) : apiError ? (
          <div style={emptyState}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🔌</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif" }}>{t('home.serverErr')}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{t('home.serverErrSub')}</p>
          </div>
        ) : products.length === 0 ? (
          <div style={emptyState}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🍽️</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif" }}>{t('home.noItems')}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{t('home.noItemsSub')}</p>
          </div>
        ) : (
          <>
            <p style={resultCount}>
              <strong>{products.length}</strong> {t('home.listed')}
              {category !== 'all' && ` — ${category}`}
            </p>
            <div style={grid}>
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const heroStyle = { background: 'linear-gradient(135deg, var(--charcoal) 0%, var(--brown) 100%)', padding: '56px 0 52px', color: 'white' };
const heroBadge = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 20, letterSpacing: '0.02em' };
const heroTitle = { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 14, color: 'var(--cream)' };
const heroSub = { color: 'rgba(255,255,255,0.65)', fontSize: '1rem', maxWidth: 480, marginBottom: 28 };
const searchWrap = { position: 'relative', maxWidth: 480, display: 'flex', alignItems: 'center' };
const searchIcon = { position: 'absolute', left: 14, fontSize: 16, zIndex: 1 };
const searchInput = { width: '100%', padding: '14px 44px 14px 42px', borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.95rem', background: 'rgba(255,255,255,0.12)', color: 'white', backdropFilter: 'blur(8px)', outline: 'none', fontFamily: "'DM Sans', sans-serif" };
const clearBtn = { position: 'absolute', right: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14 };
const statsStrip = { display: 'flex', alignItems: 'center', gap: 20, marginTop: 28, flexWrap: 'wrap' };
const statItem = { fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' };
const statNum = { color: 'var(--gold-light)', fontWeight: 700 };
const statDivider = { width: 1, height: 16, background: 'rgba(255,255,255,0.2)' };
const catRow = { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' };
const catBtn = { padding: '8px 18px', borderRadius: '999px', border: '2px solid', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 };
const emptyState = { textAlign: 'center', padding: '64px 0' };
const resultCount = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 };
