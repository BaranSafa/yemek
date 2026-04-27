import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authAPI, orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PREP_MS  = 30 * 60 * 1000; // 30 dk hazırlık
const TOTAL_MS = 60 * 60 * 1000; // 60 dk toplam süre

const STATUS = {
  'Bekliyor':      { bg: '#fff8e1', color: '#c17f24', label: '⏳ Bekliyor' },
  'Teslim Edildi': { bg: '#edf7f1', color: '#4a7c59', label: '✅ Teslim Edildi' },
  'İptal':         { bg: '#fdecea', color: '#c0392b', label: '❌ İptal' },
};

function fmt(ms) {
  if (ms <= 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function OrderCountdown({ createdAt, onExpired }) {
  const [tick, setTick] = useState(0);
  const onExpiredRef    = useRef(onExpired);
  onExpiredRef.current  = onExpired;

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - new Date(createdAt).getTime();
      if (elapsed >= TOTAL_MS) {
        clearInterval(id);
        onExpiredRef.current?.();
      } else {
        setTick((n) => n + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [createdAt]); // onExpired ref'te tutuluyor, effect yeniden başlatılmıyor

  const elapsed   = Date.now() - new Date(createdAt).getTime();
  const isPhase1  = elapsed < PREP_MS;
  const remaining = isPhase1 ? PREP_MS - elapsed : TOTAL_MS - elapsed;
  const urgent    = remaining < 5 * 60 * 1000;

  const label = isPhase1
    ? `Siparişinin tamamlanmasına ${fmt(remaining)} kaldı`
    : `Siparişinin alınması için ${fmt(remaining)} kaldı`;

  const bg    = urgent ? '#fdecea' : isPhase1 ? '#fff8e1' : '#e8f4fd';
  const color = urgent ? '#c0392b' : isPhase1 ? '#c17f24' : '#2471a3';

  return (
    <div style={{ background: bg, color, borderRadius: 8, padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, marginTop: 10 }}>
      {isPhase1 ? '🍳 ' : '🏃 '}{label}
    </div>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [searchParams]  = useSearchParams();
  const [tab, setTab]   = useState(searchParams.get('tab') || 'profile');

  const [form, setForm]   = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', password: '' });
  const [saving, setSaving] = useState(false);

  const [orders, setOrders]           = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [cancelling, setCancelling]   = useState(null);

  const loadOrders = () => {
    setOrdersLoading(true);
    orderAPI.myOrders()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setOrdersLoading(false));
  };

  useEffect(() => {
    if (tab === 'orders' || tab === 'history') loadOrders();
  }, [tab]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { firstName: form.firstName, lastName: form.lastName };
      if (form.password.trim().length >= 6) payload.password = form.password.trim();
      const res = await authAPI.updateMe(payload);
      const token = localStorage.getItem('token');
      login(token, res.data);
      toast.success('Profil güncellendi');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) return;
    setCancelling(orderId);
    try {
      await orderAPI.cancel(orderId);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: 'İptal' } : o));
      toast.success('Sipariş iptal edildi');
    } catch {
      toast.error('İptal işlemi başarısız oldu');
    } finally {
      setCancelling(null);
    }
  };

  // Süre dolunca backend zaten iptal etmiş olur; listeyi yenile
  const handleExpired = (orderId) => {
    setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: 'İptal' } : o));
    toast('Sipariş süresi doldu ve otomatik iptal edildi.', { icon: '⏰' });
  };

  const activeOrders = orders.filter((o) => o.status === 'Bekliyor');
  const pastOrders   = orders.filter((o) => o.status !== 'Bekliyor');

  const tabs = [
    { key: 'profile', label: '👤 Profil' },
    { key: 'edit',    label: '✏️ Profili Düzenle' },
    { key: 'orders',  label: '📦 Siparişlerim' },
    { key: 'history', label: '📋 Sipariş Geçmişi' },
  ];

  return (
    <div style={page}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={pageTitle}>Hesabım</h1>

        <div style={tabRow}>
          {tabs.map((t) => (
            <button key={t.key} style={{ ...tabBtn, ...(tab === t.key ? tabActive : {}) }} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profil ─────────────────────────────────── */}
        {tab === 'profile' && (
          <div style={card}>
            <div style={avatarRow}>
              <div style={avatarCircle}>{user?.firstName?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 2 }}>{user?.phone}</div>
              </div>
            </div>
            <div style={infoGrid}>
              <div style={infoItem}><span style={infoLabel}>Ad</span><span style={infoValue}>{user?.firstName}</span></div>
              <div style={infoItem}><span style={infoLabel}>Soyad</span><span style={infoValue}>{user?.lastName}</span></div>
              <div style={infoItem}><span style={infoLabel}>Telefon</span><span style={infoValue}>{user?.phone}</span></div>
              <div style={infoItem}><span style={infoLabel}>Rol</span><span style={infoValue}>Müşteri</span></div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 20 }} onClick={() => setTab('edit')}>
              Profili Düzenle
            </button>
          </div>
        )}

        {/* ── Profili Düzenle ─────────────────────────── */}
        {tab === 'edit' && (
          <div style={card}>
            <h2 style={sectionTitle}>Profili Düzenle</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Ad</label>
                  <input className="form-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Soyad</label>
                  <input className="form-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input className="form-input" value={user?.phone || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Yeni Şifre</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="En az 6 karakter (boş bırakırsan değişmez)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </form>
          </div>
        )}

        {/* ── Siparişlerim (aktif) ─────────────────────── */}
        {tab === 'orders' && (
          ordersLoading ? <div className="spinner" style={{ margin: '48px auto' }} /> :
          activeOrders.length === 0 ? (
            <div style={empty}>
              <div style={{ fontSize: 48 }}>🕐</div>
              <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Bekleyen siparişiniz yok.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onCancel={handleCancel}
                  cancelling={cancelling}
                  onExpired={() => handleExpired(order._id)}
                />
              ))}
            </div>
          )
        )}

        {/* ── Sipariş Geçmişi ──────────────────────────── */}
        {tab === 'history' && (
          ordersLoading ? <div className="spinner" style={{ margin: '48px auto' }} /> :
          pastOrders.length === 0 ? (
            <div style={empty}>
              <div style={{ fontSize: 48 }}>📭</div>
              <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Geçmiş siparişiniz bulunmuyor.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pastOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onCancel, cancelling, onExpired }) {
  const st = STATUS[order.status] || STATUS['Bekliyor'];
  const showCountdown = order.status === 'Bekliyor';

  return (
    <div style={orderCard}>
      <div style={orderHeader}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            #{order._id.slice(-8).toUpperCase()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {new Date(order.createdAt).toLocaleString('tr-TR')}
          </div>
        </div>
        <span style={{ background: st.bg, color: st.color, padding: '4px 14px', borderRadius: '999px', fontWeight: 600, fontSize: '0.82rem' }}>
          {st.label}
        </span>
      </div>

      <div style={{ padding: '14px 20px' }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
            <span>{item.productName} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span></span>
            <span style={{ fontWeight: 600 }}>₺{item.totalPrice.toFixed(2)}</span>
          </div>
        ))}

        {showCountdown && (
          <OrderCountdown createdAt={order.createdAt} onExpired={onExpired} />
        )}
      </div>

      <div style={orderFooter}>
        <span style={{ fontWeight: 700 }}>
          Toplam: <span style={{ color: 'var(--terracotta)' }}>₺{order.totalAmount.toFixed(2)}</span>
        </span>

        {order.status === 'Bekliyor' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>TESLİMAT KODU</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--terracotta)', letterSpacing: '0.18em' }}>
                {order.deliveryCode}
              </div>
            </div>
            {onCancel && (
              <button onClick={() => onCancel(order._id)} disabled={cancelling === order._id} style={cancelBtnStyle}>
                {cancelling === order._id ? '...' : 'İptal Et'}
              </button>
            )}
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
}

const page         = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const pageTitle    = { fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: 24 };
const tabRow       = { display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 28, gap: 4, flexWrap: 'wrap' };
const tabBtn       = { padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' };
const tabActive    = { color: 'var(--terracotta)', borderBottom: '2px solid var(--terracotta)', marginBottom: -2 };
const card         = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, boxShadow: 'var(--shadow-sm)' };
const sectionTitle = { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: 20, marginTop: 0 };
const avatarRow    = { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 };
const avatarCircle = { width: 60, height: 60, borderRadius: '50%', background: 'var(--terracotta)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.6rem', flexShrink: 0 };
const infoGrid     = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
const infoItem     = { display: 'flex', flexDirection: 'column', gap: 4 };
const infoLabel    = { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' };
const infoValue    = { fontSize: '1rem', fontWeight: 600, color: 'var(--charcoal)' };
const empty        = { textAlign: 'center', padding: '64px 0', color: 'var(--charcoal)' };
const orderCard    = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' };
const orderHeader  = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--cream)', borderBottom: '1px solid var(--border)' };
const orderFooter  = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 };
const cancelBtnStyle = { padding: '6px 16px', background: 'none', border: '2px solid #c0392b', color: '#c0392b', borderRadius: '999px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
