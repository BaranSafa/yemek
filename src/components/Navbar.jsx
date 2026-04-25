import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Çıkış yapıldı');
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🍽️</span>
          <div>
            <div style={styles.logoTitle}>Adile Sultan</div>
            <div style={styles.logoSub}>Taze & İndirimli</div>
          </div>
        </Link>

        {/* Right side */}
        <div style={styles.right}>
          {user?.role === 'customer' && (
            <Link to="/cart" style={styles.cartBtn}>
              <span>🛒</span>
              {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
            </Link>
          )}

          {!user ? (
            <Link to="/login" className="btn btn-primary btn-sm">Giriş Yap</Link>
          ) : (
            <div style={{ position: 'relative' }}>
              <button style={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <span style={styles.avatarCircle}>
                  {user.firstName?.[0] || user.phone?.[0]}
                </span>
                <span style={styles.userName}>
                  {user.firstName || user.phone}
                </span>
                <span>{menuOpen ? '▲' : '▼'}</span>
              </button>

              {menuOpen && (
                <div style={styles.dropdown} onClick={() => setMenuOpen(false)}>
                  <div style={styles.dropdownHeader}>
                    <div style={{ fontWeight: 700 }}>{user.firstName} {user.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {user.role === 'admin' ? '👑 Admin' : user.role === 'employee' ? '👷 Çalışan' : '👤 Müşteri'}
                    </div>
                  </div>

                  {user.role === 'customer' && (
                    <Link to="/orders" style={styles.dropdownItem}>📦 Siparişlerim</Link>
                  )}

                  {(user.role === 'employee' || user.role === 'admin') && (
                    <>
                      <Link to="/employee" style={styles.dropdownItem}>🏠 Çalışan Paneli</Link>
                      <Link to="/employee/products" style={styles.dropdownItem}>🍜 Ürün Yönetimi</Link>
                      <Link to="/employee/deliver" style={styles.dropdownItem}>✅ Teslimat</Link>
                      <Link to="/employee/orders" style={styles.dropdownItem}>📋 Siparişler</Link>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <>
                      <div style={styles.dropdownDivider} />
                      <Link to="/admin" style={styles.dropdownItem}>👑 Admin Paneli</Link>
                      <Link to="/admin/users" style={styles.dropdownItem}>👥 Kullanıcılar</Link>
                    </>
                  )}

                  <div style={styles.dropdownDivider} />
                  <button onClick={handleLogout} style={{ ...styles.dropdownItem, color: 'var(--danger)', width: '100%', textAlign: 'left' }}>
                    🚪 Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'var(--warm-white)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: { fontSize: 28 },
  logoTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'var(--charcoal)',
    lineHeight: 1,
  },
  logoSub: {
    fontSize: '0.7rem',
    color: 'var(--terracotta)',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  cartBtn: {
    position: 'relative',
    fontSize: 22,
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    background: 'var(--terracotta)',
    color: 'white',
    borderRadius: '50%',
    width: 18,
    height: 18,
    fontSize: '0.7rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: 'var(--charcoal)',
    fontWeight: 500,
  },
  avatarCircle: {
    background: 'var(--terracotta)',
    color: 'white',
    borderRadius: '50%',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
    textTransform: 'uppercase',
  },
  userName: { maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--warm-white)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: 220,
    zIndex: 200,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '14px 16px',
    background: 'var(--cream)',
    borderBottom: '1px solid var(--border)',
  },
  dropdownItem: {
    display: 'block',
    padding: '10px 16px',
    fontSize: '0.9rem',
    color: 'var(--charcoal)',
    transition: 'background 0.15s',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textDecoration: 'none',
  },
  dropdownDivider: {
    height: 1,
    background: 'var(--border)',
    margin: '4px 0',
  },
};
