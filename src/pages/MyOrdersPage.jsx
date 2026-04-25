import { useState, useEffect } from 'react';
import { orderAPI } from '../utils/api';

const statusStyle = {
  'Bekliyor': { bg: '#fff8e1', color: '#c17f24', label: '⏳ Teslim Alınmayı Bekliyor' },
  'Teslim Edildi': { bg: '#edf7f1', color: '#4a7c59', label: '✅ Teslim Edildi' },
  'İptal': { bg: '#fdecea', color: '#c0392b', label: '❌ İptal Edildi' },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    orderAPI.myOrders()
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => o.status === 'Bekliyor');
  const pastOrders = orders.filter((o) => o.status !== 'Bekliyor');
  const shown = tab === 'active' ? activeOrders : pastOrders;

  return (
    <div style={page}>
      <div className="container">
        <h1 style={pageTitle}>📦 Siparişlerim</h1>

        {/* Tabs */}
        <div style={tabRow}>
          <button style={{ ...tabBtn, ...(tab === 'active' ? tabActive : {}) }} onClick={() => setTab('active')}>
            Aktif Siparişler
            {activeOrders.length > 0 && <span style={tabBadge}>{activeOrders.length}</span>}
          </button>
          <button style={{ ...tabBtn, ...(tab === 'past' ? tabActive : {}) }} onClick={() => setTab('past')}>
            Geçmiş Siparişler
          </button>
        </div>

        {loading ? <div className="spinner" /> : shown.length === 0 ? (
          <div style={empty}>
            <div style={{ fontSize: 48 }}>{tab === 'active' ? '🕐' : '📭'}</div>
            <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>
              {tab === 'active' ? 'Bekleyen siparişiniz yok.' : 'Geçmiş siparişiniz bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {shown.map((order) => {
              const st = statusStyle[order.status] || statusStyle['Bekliyor'];
              return (
                <div key={order._id} style={orderCard}>
                  {/* Header */}
                  <div style={orderHeader}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                        SİPARİŞ #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>
                    <span style={{ background: st.bg, color: st.color, padding: '5px 14px', borderRadius: '999px', fontWeight: 600, fontSize: '0.82rem' }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '16px 20px' }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}>
                        <span>{item.productName} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span></span>
                        <span style={{ fontWeight: 600 }}>₺{item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={orderFooter}>
                    <span style={{ fontWeight: 700 }}>
                      Toplam: <span style={{ color: 'var(--terracotta)' }}>₺{order.totalAmount.toFixed(2)}</span>
                    </span>

                    {order.status === 'Bekliyor' && (
                      <div style={codeWrap}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>
                          TESLİMAT KODU
                        </span>
                        <div style={codeDigits}>{order.deliveryCode}</div>
                      </div>
                    )}

                    {order.status === 'Teslim Edildi' && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(order.deliveredAt).toLocaleString('tr-TR')} teslim edildi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const page = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: 24 };
const tabRow = { display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 24, gap: 4 };
const tabBtn = { padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'DM Sans', sans-serif" };
const tabActive = { color: 'var(--terracotta)', borderBottom: '2px solid var(--terracotta)', marginBottom: -2 };
const tabBadge = { background: 'var(--terracotta)', color: 'white', borderRadius: '999px', padding: '1px 8px', fontSize: '0.75rem' };
const empty = { textAlign: 'center', padding: '48px 0', color: 'var(--charcoal)' };
const orderCard = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' };
const orderHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--cream)', borderBottom: '1px solid var(--border)' };
const orderFooter = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 };
const codeWrap = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 };
const codeDigits = { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--terracotta)', letterSpacing: '0.18em' };
