import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div style={page}>
      <div style={box}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🍽️</div>
        <h1 style={title}>404</h1>
        <h2 style={subtitle}>{t('notFound.title')}</h2>
        <p style={desc}>{t('notFound.desc')}</p>
        <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: 32, justifyContent: 'center' }}>
          {t('notFound.back')}
        </Link>
      </div>
    </div>
  );
}

const page = { minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' };
const box = { textAlign: 'center', maxWidth: 420 };
const title = { fontFamily: "'Playfair Display', serif", fontSize: '6rem', fontWeight: 900, color: 'var(--terracotta)', lineHeight: 1, marginBottom: 8 };
const subtitle = { fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: 'var(--charcoal)', marginBottom: 12 };
const desc = { color: 'var(--text-muted)', fontSize: '0.95rem' };
