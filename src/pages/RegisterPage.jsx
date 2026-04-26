import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(t('register.mismatch')); return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      toast.success(t('register.success'));
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={header}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🍽️</div>
          <h1 style={title}>{t('register.title')}</h1>
          <p style={subtitle}>{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">{t('register.firstName')}</label>
              <input name="firstName" className="form-input" placeholder={t('register.firstPlaceholder')} value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('register.lastName')}</label>
              <input name="lastName" className="form-input" placeholder={t('register.lastPlaceholder')} value={form.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('register.phone')}</label>
            <input name="phone" type="tel" className="form-input" placeholder={t('register.phonePlaceholder')} value={form.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">{t('register.password')}</label>
            <input name="password" type="password" className="form-input" placeholder={t('register.passwordPlaceholder')} value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">{t('register.confirm')}</label>
            <input name="confirmPassword" type="password" className="form-input" placeholder={t('register.confirmPlaceholder')} value={form.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? t('register.loading') : t('register.submit')}
          </button>
        </form>

        <div style={footer}>
          {t('register.hasAccount')}{' '}
          <Link to="/login" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>{t('register.login')}</Link>
        </div>
      </div>
    </div>
  );
}

const page = { minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' };
const card = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 440, overflow: 'hidden' };
const header = { background: 'linear-gradient(135deg, var(--charcoal), var(--brown))', padding: '32px 32px 24px', textAlign: 'center' };
const title = { fontSize: '1.8rem', fontWeight: 700, color: 'var(--cream)' };
const subtitle = { color: 'rgba(255,255,255,0.65)', marginTop: 4, fontSize: '0.9rem' };
const formStyle = { padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 14 };
const footer = { textAlign: 'center', padding: '0 32px 24px', fontSize: '0.88rem' };
