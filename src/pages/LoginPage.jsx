import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [tab, setTab] = useState('customer');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fn = tab === 'customer' ? authAPI.login : authAPI.employeeLogin;
      const res = await fn({ phone, password });
      login(res.data.token, res.data.user);
      toast.success('Hoş geldiniz!');
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'employee') navigate('/employee');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        {/* Header */}
        <div style={header}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🍽️</div>
          <h1 style={title}>Adile Sultan</h1>
          <p style={subtitle}>Hesabınıza giriş yapın</p>
        </div>

        {/* Tab switcher */}
        <div style={tabRow}>
          <button
            style={{ ...tabBtn, ...(tab === 'customer' ? tabActive : {}) }}
            onClick={() => setTab('customer')}
          >
            👤 Müşteri Girişi
          </button>
          <button
            style={{ ...tabBtn, ...(tab === 'employee' ? tabActive : {}) }}
            onClick={() => setTab('employee')}
          >
            👷 Çalışan Girişi
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div className="form-group">
            <label className="form-label">Telefon Numarası</label>
            <input
              type="tel"
              className="form-input"
              placeholder="05XX XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {tab === 'customer' && (
          <div style={footer}>
            Hesabınız yok mu?{' '}
            <Link to="/register" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>
              Kayıt Ol
            </Link>
          </div>
        )}

        {tab === 'employee' && (
          <div style={{ ...footer, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Çalışan hesabı oluşturmak için yöneticinizle iletişime geçin.
          </div>
        )}
      </div>
    </div>
  );
}

const page = { minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--cream)' };
const card = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 420, overflow: 'hidden' };
const header = { background: 'linear-gradient(135deg, var(--charcoal), var(--brown))', padding: '32px 32px 24px', textAlign: 'center', color: 'white' };
const title = { fontSize: '1.8rem', fontWeight: 700, color: 'var(--cream)' };
const subtitle = { color: 'rgba(255,255,255,0.65)', marginTop: 4, fontSize: '0.9rem' };
const tabRow = { display: 'flex', borderBottom: '2px solid var(--border)' };
const tabBtn = { flex: 1, padding: '14px 8px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-muted)', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" };
const tabActive = { color: 'var(--terracotta)', borderBottom: '2px solid var(--terracotta)', marginBottom: -2 };
const formStyle = { padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 };
const footer = { textAlign: 'center', padding: '0 32px 24px', fontSize: '0.88rem', color: 'var(--charcoal)' };
