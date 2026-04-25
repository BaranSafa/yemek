import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const cards = [
    { to: '/employee/products', icon: '🍜', title: 'Ürün Yönetimi', desc: 'Yeni ürün ekle, mevcut ürünleri güncelle veya kaldır.' },
    { to: '/employee/deliver', icon: '✅', title: 'Sipariş Teslim', desc: 'Müşteri kodunu girerek siparişi teslim et.' },
    { to: '/employee/orders', icon: '📋', title: 'Tüm Siparişler', desc: 'Bekleyen ve tamamlanan siparişleri görüntüle.' },
  ];

  return (
    <div style={page}>
      <div className="container">
        <div style={hero}>
          <div style={{ fontSize: 48 }}>👷</div>
          <div>
            <h1 style={title}>Çalışan Paneli</h1>
            <p style={{ color: 'var(--text-muted)' }}>Hoş geldiniz, {user?.firstName} {user?.lastName}</p>
          </div>
        </div>

        <div style={grid}>
          {cards.map((c) => (
            <Link to={c.to} key={c.to} style={card}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{c.icon}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: 8 }}>{c.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{c.desc}</p>
              <div style={{ marginTop: 20, color: 'var(--terracotta)', fontWeight: 600, fontSize: '0.88rem' }}>Gitmek için tıkla →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const page = { paddingTop: 48, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const hero = { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 };
const title = { fontFamily: "'Playfair Display', serif", fontSize: '2rem' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 };
const card = {
  background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  padding: '28px 24px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s',
  display: 'block', textDecoration: 'none', color: 'inherit',
};
