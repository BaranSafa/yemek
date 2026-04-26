import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.employeeLogin({ phone, password });
      const { token, user } = res.data;
      if (user.role !== 'admin' && user.role !== 'employee') {
        toast.error('Bu panel yalnızca yetkili personele açıktır.');
        return;
      }
      login(token, user);
      toast.success('Hoş geldiniz!');
      navigate(user.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={header}>
          <div style={lockIcon}>🔐</div>
          <h1 style={title}>Personel Girişi</h1>
          <p style={subtitle}>Adile Sultan Yönetim Paneli</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Telefon Numarası</label>
            <input
              type="tel"
              className="form-input"
              placeholder="05XX XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
              style={inputStyle}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Şifre</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={submitBtn}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={footer}>
          Bu sayfa yalnızca yetkili personele yöneliktir.
        </div>
      </div>
    </div>
  );
}

const page = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a1208 0%, var(--charcoal) 60%, #3d2810 100%)',
  padding: '24px 16px',
};

const card = {
  width: '100%',
  maxWidth: 400,
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
};

const header = {
  padding: '40px 32px 28px',
  textAlign: 'center',
  background: 'rgba(255,255,255,0.04)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const lockIcon = {
  fontSize: 40,
  marginBottom: 12,
};

const title = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '1.6rem',
  fontWeight: 700,
  color: 'var(--cream)',
  marginBottom: 6,
};

const subtitle = {
  fontSize: '0.82rem',
  color: 'rgba(255,255,255,0.4)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const formStyle = {
  padding: '28px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  background: 'rgba(0,0,0,0.2)',
};

const inputStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'white',
};

const submitBtn = {
  width: '100%',
  justifyContent: 'center',
  marginTop: 8,
  padding: '13px',
  background: 'var(--terracotta)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.03em',
};

const footer = {
  padding: '16px 32px',
  textAlign: 'center',
  fontSize: '0.75rem',
  color: 'rgba(255,255,255,0.25)',
  background: 'rgba(0,0,0,0.3)',
  letterSpacing: '0.02em',
};
