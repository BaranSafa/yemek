import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.stats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Toplam Sipariş', value: stats.totalOrders, icon: '📦', color: 'var(--terracotta)' },
    { label: 'Teslim Edildi', value: stats.deliveredOrders, icon: '✅', color: 'var(--success)' },
    { label: 'Bekliyor', value: stats.pendingOrders, icon: '⏳', color: '#c17f24' },
    { label: 'İptal', value: stats.cancelledOrders, icon: '❌', color: 'var(--danger)' },
    { label: 'Toplam Gelir', value: `₺${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: 'var(--gold)' },
    { label: 'Aktif Ürün', value: stats.activeProducts, icon: '🍜', color: 'var(--brown)' },
  ] : [];

  const navCards = [
    { to: '/admin/menu', icon: '🍽️', title: 'Ürün Yönetimi', desc: 'Menüye ürün ekle, düzenle, sil' },
    { to: '/admin/categories', icon: '🏷️', title: 'Kategori Yönetimi', desc: 'Kategorileri düzenle' },
    { to: '/employee/deliver', icon: '✅', title: 'Sipariş Teslim', desc: 'Teslimat kodu ile teslim et' },
    { to: '/employee/orders', icon: '📋', title: 'Tüm Siparişler', desc: 'Sipariş listesi ve detaylar' },
    { to: '/admin/users', icon: '👥', title: 'Kullanıcı Yönetimi', desc: 'Kullanıcıları görüntüle' },
  ];

  return (
    <div style={page}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <div style={{ fontSize: 44 }}>👑</div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem' }}>Admin Paneli</h1>
            <p style={{ color: 'var(--text-muted)' }}>Adile Sultan — Genel Bakış</p>
          </div>
        </div>

        {/* Stats */}
        <h2 style={sectionTitle}>📊 İstatistikler</h2>
        {loading ? <div className="spinner" /> : (
          <div style={statsGrid}>
            {statCards.map((s) => (
              <div key={s.label} style={statCard}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: s.color }}>
                  {s.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <h2 style={{ ...sectionTitle, marginTop: 40 }}>🔧 Yönetim</h2>
        <div style={navGrid}>
          {navCards.map((c) => (
            <Link to={c.to} key={c.to} style={navCard}>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{c.title}</div>
                {c.desc && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.desc}</div>}
              </div>
              <span style={{ color: 'var(--terracotta)' }}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const page = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const sectionTitle = { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: 16 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 };
const statCard = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' };
const navGrid = { display: 'flex', flexDirection: 'column', gap: 12 };
const navCard = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'var(--charcoal)', boxShadow: 'var(--shadow-sm)', fontFamily: "'DM Sans', sans-serif" };
