import { useState } from 'react';
import { orderAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function DeliverOrderPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDeliver = async (e) => {
    e.preventDefault();
    if (code.length !== 4) { setError('Lütfen 4 haneli kodu girin.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await orderAPI.deliver(code);
      setResult(res.data.order);
      toast.success('Sipariş teslim edildi!');
    } catch (err) {
      setError(err.response?.data?.message || 'Geçersiz kod.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setCode(''); setResult(null); setError(''); };

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📲</div>
        <h1 style={title}>Sipariş Teslim</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
          Müşteriden alınan 4 haneli teslimat kodunu girin.
        </p>

        {!result ? (
          <form onSubmit={handleDeliver} style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
            <input
              type="text"
              maxLength={4}
              placeholder="0000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              style={codeInput}
              autoFocus
            />
            {error && <div style={errorBox}>{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || code.length !== 4} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Kontrol ediliyor...' : '✅ Teslim Et'}
            </button>
          </form>
        ) : (
          <div style={successBox}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Teslim Edildi!</h2>
            <div style={resultInfo}>
              <div><strong>Müşteri:</strong> {result.customer?.firstName} {result.customer?.lastName}</div>
              <div><strong>Telefon:</strong> {result.customer?.phone}</div>
              <div style={{ marginTop: 12 }}><strong>Sipariş İçeriği:</strong></div>
              {result.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span>{item.productName} × {item.quantity}</span>
                  <span>₺{item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>Toplam</span>
                <span style={{ color: 'var(--terracotta)' }}>₺{result.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }} onClick={reset}>
              Yeni Teslimat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const page = { minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 };
const card = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center' };
const title = { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 8 };
const codeInput = { textAlign: 'center', fontSize: '3rem', fontFamily: "'Playfair Display', serif", fontWeight: 900, letterSpacing: '0.3em', color: 'var(--terracotta)', border: '3px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', width: '100%', outline: 'none', background: 'var(--cream)' };
const errorBox = { background: '#fdecea', color: 'var(--danger)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', width: '100%', fontSize: '0.88rem' };
const successBox = { textAlign: 'center' };
const resultInfo = { background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'left', fontSize: '0.9rem' };
