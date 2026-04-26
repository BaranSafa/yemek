import { useState, useEffect } from 'react';
import { authAPI, orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const statusStyle = {
  'Bekliyor':      { bg: '#fff8e1', color: '#c17f24', label: '⏳ Teslim Bekleniyor' },
  'Teslim Edildi': { bg: '#edf7f1', color: '#4a7c59', label: '✅ Teslim Edildi' },
  'İptal':         { bg: '#fdecea', color: '#c0392b', label: '❌ İptal' },
};

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    orderAPI.myOrders()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ margin: '48px auto' }} />;

  if (orders.length === 0) {
    return (
      <div style={empty}>
        <div style={{ fontSize: 48 }}>📭</div>
        <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>{t('profile.noOrders')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {orders.map((order) => {
        const st = statusStyle[order.status] || statusStyle['Bekliyor'];
        return (
          <div key={order._id} style={orderCard}>
            <div style={orderHeader}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  #{order._id.slice(-8).toUpperCase()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(order.createdAt).toLocaleString('tr-TR')}
                </div>
              </div>
              <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: '999px', fontWeight: 600, fontSize: '0.8rem' }}>
                {st.label}
              </span>
            </div>

            <div style={{ padding: '12px 20px' }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                  <span>{item.productName} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span></span>
                  <span style={{ fontWeight: 600 }}>₺{item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={orderFooter}>
              <span style={{ fontWeight: 700 }}>
                Toplam: <span style={{ color: 'var(--terracotta)' }}>₺{order.totalAmount.toFixed(2)}</span>
              </span>
              {order.status === 'Bekliyor' && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>TESLİMAT KODU</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 900, color: 'var(--terracotta)', letterSpacing: '0.18em' }}>
                    {order.deliveryCode}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', password: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { firstName: form.firstName, lastName: form.lastName };
      if (form.password.trim().length >= 6) payload.password = form.password.trim();

      const res = await authAPI.updateMe(payload);
      const token = localStorage.getItem('token');
      login(token, res.data);
      toast.success(t('profile.saved'));
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={page}>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={pageTitle}>{t('profile.title')}</h1>

        <div style={tabRow}>
          <button style={{ ...tabBtn, ...(tab === 'profile' ? tabActive : {}) }} onClick={() => setTab('profile')}>
            👤 {t('profile.tabProfile')}
          </button>
          <button style={{ ...tabBtn, ...(tab === 'history' ? tabActive : {}) }} onClick={() => setTab('history')}>
            📦 {t('profile.tabHistory')}
          </button>
        </div>

        {tab === 'profile' && (
          <div style={card}>
            <div style={avatarRow}>
              <div style={avatarCircle}>{user?.firstName?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{user?.phone}</div>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">{t('profile.firstName')}</label>
                  <input className="form-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('profile.lastName')}</label>
                  <input className="form-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('profile.phone')}</label>
                <input className="form-input" value={user?.phone || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>

              <div className="form-group">
                <label className="form-label">{t('profile.newPassword')}</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder={t('profile.passwordPlaceholder')}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? t('profile.saving') : t('profile.save')}
              </button>
            </form>
          </div>
        )}

        {tab === 'history' && <OrderHistory />}
      </div>
    </div>
  );
}

const page = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: 24 };
const tabRow = { display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 28, gap: 4 };
const tabBtn = { padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'DM Sans', sans-serif" };
const tabActive = { color: 'var(--terracotta)', borderBottom: '2px solid var(--terracotta)', marginBottom: -2 };
const card = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, boxShadow: 'var(--shadow-sm)' };
const avatarRow = { display: 'flex', alignItems: 'center', gap: 16 };
const avatarCircle = { width: 56, height: 56, borderRadius: '50%', background: 'var(--terracotta)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', flexShrink: 0 };
const empty = { textAlign: 'center', padding: '48px 0', color: 'var(--charcoal)' };
const orderCard = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' };
const orderHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'var(--cream)', borderBottom: '1px solid var(--border)' };
const orderFooter = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 10 };
