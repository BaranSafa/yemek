import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Şifreler eşleşmiyor!'); return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      toast.success('Hesabınız oluşturuldu!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={header}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🍽️</div>
          <h1 style={title}>Kayıt Ol</h1>
          <p style={subtitle}>Adile Sultan ailesine katılın</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Ad</label>
              <input name="firstName" className="form-input" placeholder="Ayşe" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Soyad</label>
              <input name="lastName" className="form-input" placeholder="Kaya" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Telefon Numarası</label>
            <input name="phone" type="tel" className="form-input" placeholder="05XX XXX XX XX" value={form.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input name="password" type="password" className="form-input" placeholder="En az 6 karakter" value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Şifre Tekrarı</label>
            <input name="confirmPassword" type="password" className="form-input" placeholder="Şifrenizi tekrar girin" value={form.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
          </button>
        </form>

        <div style={footer}>
          Zaten hesabınız var mı?{' '}
          <Link to="/login" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>Giriş Yap</Link>
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
