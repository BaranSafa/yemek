import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={footerStyle}>
      <div className="container">
        <div style={inner}>
          {/* Brand */}
          <div style={brand}>
            <div style={logo}>
              <span style={{ fontSize: 24 }}>🍽️</span>
              <div>
                <div style={logoTitle}>Adile Sultan</div>
                <div style={logoSub}>Taze & İndirimli</div>
              </div>
            </div>
            <p style={tagline}>
              Gün sonu indirimleriyle taze yemekler — hem cüzdanına hem gezegene iyi gel.
            </p>
          </div>

          {/* Links */}
          <div style={linksCol}>
            <div style={colTitle}>Keşfet</div>
            <Link to="/" style={linkStyle}>Ana Sayfa</Link>
            <Link to="/login" style={linkStyle}>Giriş Yap</Link>
            <Link to="/register" style={linkStyle}>Kayıt Ol</Link>
          </div>

          <div style={linksCol}>
            <div style={colTitle}>Hesabım</div>
            <Link to="/cart" style={linkStyle}>Sepetim</Link>
            <Link to="/orders" style={linkStyle}>Siparişlerim</Link>
          </div>
        </div>

        <div style={bottom}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            © {year} Adile Sultan. Tüm hakları saklıdır.
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>İsrafı önle,</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--terracotta)', fontWeight: 600 }}>tasarruf et 🌱</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerStyle = {
  background: 'var(--charcoal)',
  color: 'var(--cream)',
  marginTop: 'auto',
  paddingTop: 48,
  paddingBottom: 24,
};

const inner = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr',
  gap: 40,
  paddingBottom: 40,
  borderBottom: '1px solid rgba(255,255,255,0.1)',
};

const brand = { display: 'flex', flexDirection: 'column', gap: 16 };

const logo = { display: 'flex', alignItems: 'center', gap: 12 };

const logoTitle = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '1.2rem',
  fontWeight: 700,
  color: 'var(--cream)',
};

const logoSub = {
  fontSize: '0.68rem',
  color: 'var(--terracotta-light)',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const tagline = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.85rem',
  lineHeight: 1.6,
  maxWidth: 280,
};

const linksCol = { display: 'flex', flexDirection: 'column', gap: 10 };

const colTitle = {
  fontWeight: 700,
  fontSize: '0.82rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--terracotta-light)',
  marginBottom: 4,
};

const linkStyle = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.88rem',
  textDecoration: 'none',
  transition: 'color 0.15s',
};

const bottom = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 20,
  flexWrap: 'wrap',
  gap: 8,
};
