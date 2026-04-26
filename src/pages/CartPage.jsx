import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div style={page}>
        <div style={emptyBox}>
          <div style={{ fontSize: 64 }}>🛒</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", marginTop: 12 }}>{t('cart.empty')}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{t('cart.emptySub')}</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>{t('cart.startShopping')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={page}>
      <div className="container">
        <h1 style={pageTitle}>{t('cart.title')}</h1>

        <div style={layout}>
          {/* Items */}
          <div style={itemsCol}>
            {cartItems.map((item) => (
              <div key={item._id} style={itemCard}>
                <div style={itemEmoji}>🍽️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{item.category}</div>
                  {item.discountRate > 0 && (
                    <span className="badge badge-discount" style={{ marginTop: 4 }}>%{item.discountRate} {t('cart.discounted')}</span>
                  )}
                </div>

                <div style={qtyRow}>
                  <button style={qtyBtn} onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                  <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                  <button style={qtyBtn} onClick={() => updateQuantity(item._id, item.quantity + 1)} disabled={item.quantity >= item.remainingPortions}>+</button>
                </div>

                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontWeight: 700, color: 'var(--terracotta)' }}>₺{(item.currentPrice * item.quantity).toFixed(2)}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>₺{item.currentPrice?.toFixed(2)} {t('cart.perUnit')}</div>
                </div>

                <button onClick={() => removeFromCart(item._id)} style={removeBtn}>✕</button>
              </div>
            ))}

            <button onClick={clearCart} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
              🗑 {t('cart.clear')}
            </button>
          </div>

          {/* Summary */}
          <div style={summary}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>{t('cart.summary')}</h3>

            <div style={summaryRow}>
              <span>{t('cart.subtotal')}</span>
              <span>₺{totalPrice.toFixed(2)}</span>
            </div>
            <div style={summaryRow}>
              <span>{t('cart.delivery')}</span>
              <span style={{ color: 'var(--success)' }}>{t('cart.free')}</span>
            </div>
            <div style={{ ...summaryRow, borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 8, fontWeight: 700, fontSize: '1.1rem' }}>
              <span>{t('cart.total')}</span>
              <span style={{ color: 'var(--terracotta)' }}>₺{totalPrice.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
              onClick={() => navigate('/checkout')}
            >
              {t('cart.checkout')}
            </button>

            <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {t('cart.continue')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const page = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: 28 };
const emptyBox = { textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const layout = { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' };
const itemsCol = { display: 'flex', flexDirection: 'column', gap: 12 };
const itemCard = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-sm)' };
const itemEmoji = { fontSize: 32, flexShrink: 0 };
const qtyRow = { display: 'flex', alignItems: 'center', gap: 8 };
const qtyBtn = { width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--border)', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const removeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, padding: 4 };
const summary = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 86 };
const summaryRow = { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.95rem' };
