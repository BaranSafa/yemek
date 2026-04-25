import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setCard({ ...card, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cartItems.map((i) => ({ productId: i._id, quantity: i.quantity }));
      const res = await orderAPI.create({
        items,
        paymentInfo: { cardLastFour: card.number.slice(-4) },
      });
      setSuccess(res.data.order);
      clearCart();
      toast.success('Siparişiniz alındı!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sipariş oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={page}>
        <div style={successCard}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 8 }}>
            Sipariş Onaylandı!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
            Restorana geldiğinizde aşağıdaki kodu gösteriniz.
          </p>

          <div style={codeBox}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
              TESLİMAT KODUNUZ
            </div>
            <div style={codeNumber}>{success.deliveryCode}</div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'left', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Sipariş Detayı</div>
            {success.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                <span>{item.productName} × {item.quantity}</span>
                <span>₺{item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>Toplam</span>
              <span style={{ color: 'var(--terracotta)' }}>₺{success.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ flex: 1, justifyContent: 'center' }}>Ana Sayfa</button>
            <button className="btn btn-primary" onClick={() => navigate('/orders')} style={{ flex: 1, justifyContent: 'center' }}>Siparişlerim</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div className="container">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: 28 }}>Ödeme</h1>
        <div style={layout}>
          {/* Payment form */}
          <div style={formCard}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>💳 Kart Bilgileri</h3>
            <div style={{ background: '#fff8e1', border: '1px solid var(--gold)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 20, fontSize: '0.85rem', color: '#8a6010' }}>
              ⚠️ Bu bir demo ödeme ekranıdır. Gerçek kart bilgisi girmenize gerek yoktur.
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Kart Numarası</label>
                <input name="number" className="form-input" placeholder="1234 5678 9012 3456" maxLength={19}
                  value={card.number} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Kart Üzerindeki İsim</label>
                <input name="name" className="form-input" placeholder="AYŞE KAYA"
                  value={card.name} onChange={handleChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Son Kullanma</label>
                  <input name="expiry" className="form-input" placeholder="MM/YY" maxLength={5}
                    value={card.expiry} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input name="cvv" className="form-input" placeholder="123" maxLength={4}
                    value={card.cvv} onChange={handleChange} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg"
                style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                {loading ? 'İşleniyor...' : `Siparişi Onayla — ₺${totalPrice.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div style={summaryCard}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Sipariş Özeti</h3>
            {cartItems.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                <span>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>₺{(item.currentPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 8, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>Toplam</span>
              <span style={{ color: 'var(--terracotta)', fontSize: '1.1rem' }}>₺{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const page = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const layout = { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' };
const formCard = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, boxShadow: 'var(--shadow-sm)' };
const summaryCard = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 86 };
const successCard = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', maxWidth: 480, margin: '60px auto', padding: '40px 36px', textAlign: 'center' };
const codeBox = { background: 'var(--cream)', border: '2px dashed var(--terracotta)', borderRadius: 'var(--radius)', padding: '20px 32px', display: 'inline-block' };
const codeNumber = { fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, color: 'var(--terracotta)', letterSpacing: '0.2em' };
