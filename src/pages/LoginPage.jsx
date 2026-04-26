import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ phone, password });
      login(res.data.token, res.data.user);
      toast.success(t('login.welcome'));
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={header}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🍽️</div>
          <h1 style={title}>Adile Sultan</h1>
          <p style={subtitle}>{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div className="form-group">
            <label className="form-label">{t('login.phone')}</label>
            <input
              type="tel"
              className="form-input"
              placeholder={t('login.phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('login.password')}</label>
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
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>

        <div style={footer}>
          {t('login.noAccount')}{' '}
          <Link to="/register" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>
            {t('login.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}

const page = { minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--cream)' };
const card = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 420, overflow: 'hidden' };
const header = { background: 'linear-gradient(135deg, var(--charcoal), var(--brown))', padding: '32px 32px 24px', textAlign: 'center', color: 'white' };
const title = { fontSize: '1.8rem', fontWeight: 700, color: 'var(--cream)' };
const subtitle = { color: 'rgba(255,255,255,0.65)', marginTop: 4, fontSize: '0.9rem' };
const formStyle = { padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 };
const footer = { textAlign: 'center', padding: '0 32px 24px', fontSize: '0.88rem' };
