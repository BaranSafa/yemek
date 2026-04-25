import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CountdownTimer from './CountdownTimer';
import DiscountBadge from './DiscountBadge';

const CATEGORY_EMOJI = { Çorba: '🍲', Yemek: '🍽️', Tatlı: '🍮', İçecek: '☕', Diğer: '🥡' };

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const outOfStock = product.remainingPortions === 0;
  const hasDiscount = product.discountRate > 0;

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'customer') { toast.error('Yalnızca müşteriler sipariş verebilir.'); return; }
    if (outOfStock) return;
    addToCart(product);
  };

  return (
    <div
      style={{
        ...cardStyle,
        opacity: outOfStock ? 0.65 : 1,
        filter: outOfStock ? 'grayscale(0.3)' : 'none',
      }}
      onMouseEnter={(e) => { if (!outOfStock) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div style={imageWrap}>
        <div style={imagePlaceholder}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={imageStyle} />
            : <span style={{ fontSize: 52 }}>{CATEGORY_EMOJI[product.category] || '🍴'}</span>
          }
        </div>
        {hasDiscount && !outOfStock && (
          <div style={discountRibbon}>%{product.discountRate} İndirim</div>
        )}
        {outOfStock && (
          <div style={outOfStockOverlay}>STOK YOK</div>
        )}
      </div>

      <div style={body}>
        <div style={catRow}>
          <span style={catBadge}>{CATEGORY_EMOJI[product.category]} {product.category}</span>
          {product.remainingPortions > 0 && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{product.remainingPortions} porsiyon</span>
          )}
        </div>

        <h3 style={nameStyle}>{product.name}</h3>

        {product.description && (
          <p style={descStyle}>{product.description}</p>
        )}

        {!outOfStock && product.expiresAt && (
          <CountdownTimer expiresAt={product.expiresAt} compact />
        )}

        {hasDiscount && !outOfStock && (
          <DiscountBadge discountRate={product.discountRate} basePrice={product.basePrice} currentPrice={product.currentPrice} />
        )}

        <div style={priceRow}>
          <div>
            <div style={currentPrice}>₺{product.currentPrice?.toFixed(2)}</div>
            {!hasDiscount && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fiyat</div>}
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={outOfStock} style={{ minWidth: 80 }}>
            {outOfStock ? 'Stok Yok' : '+ Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { background: 'var(--warm-white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column' };
const imageWrap = { position: 'relative', height: 180, background: 'var(--cream)', overflow: 'hidden', flexShrink: 0 };
const imagePlaceholder = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const discountRibbon = { position: 'absolute', top: 12, right: 12, background: 'var(--terracotta)', color: 'white', padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700 };
const outOfStockOverlay = { position: 'absolute', inset: 0, background: 'rgba(44,36,22,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.12em' };
const body = { padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 };
const catRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const catBadge = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--brown-light)', background: 'var(--cream)', padding: '2px 8px', borderRadius: '999px', border: '1px solid var(--border)' };
const nameStyle = { fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: 'var(--charcoal)' };
const descStyle = { fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const priceRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' };
const currentPrice = { fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--terracotta)' };
