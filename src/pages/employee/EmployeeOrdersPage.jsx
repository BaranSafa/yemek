import { useState, useEffect } from 'react';
import { orderAPI } from '../../utils/api';

const STATUS_MAP = {
  'Bekliyor': { label: '⏳ Bekliyor', bg: '#fff8e1', color: '#c17f24' },
  'Teslim Edildi': { label: '✅ Teslim Edildi', bg: '#edf7f1', color: '#4a7c59' },
  'İptal': { label: '❌ İptal', bg: '#fdecea', color: '#c0392b' },
};

export default function EmployeeOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await orderAPI.allOrders(params);
      setOrders(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  return (
    <div style={page}>
      <div className="container">
        <h1 style={pageTitle}>📋 Tüm Siparişler</h1>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {['', 'Bekliyor', 'Teslim Edildi', 'İptal'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: '7px 18px', borderRadius: '999px', border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif",
                background: filter === s ? 'var(--terracotta)' : 'var(--warm-white)',
                color: filter === s ? 'white' : 'var(--charcoal)',
                borderColor: filter === s ? 'var(--terracotta)' : 'var(--border)',
              }}>
              {s || 'Tümü'}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>Sipariş bulunamadı.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order) => {
              const st = STATUS_MAP[order.status];
              return (
                <div key={order._id} style={orderRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 600 }}>
                      {order.customer?.firstName} {order.customer?.lastName}
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.85rem' }}>
                        {order.customer?.phone}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 900, color: 'var(--terracotta)', letterSpacing: '0.12em' }}>
                      {order.deliveryCode}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>KOD</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 100 }}>
                    <div style={{ fontWeight: 700, color: 'var(--terracotta)' }}>₺{order.totalAmount.toFixed(2)}</div>
                    <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {st.label}
                    </span>
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
const orderRow = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap' };
