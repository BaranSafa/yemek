import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { lang, toggle, t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success(lang === 'tr' ? 'Çıkış yapıldı' : 'Signed out');
    navigate('/');
  };

  const roleLabel = user?.role === 'admin'
    ? t('nav.roleAdmin')
    : user?.role === 'employee'
    ? t('nav.roleEmployee')
    : t('nav.roleCustomer');

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
          {/* Language toggle */}
          <button onClick={toggle} style={styles.langBtn} title="Change language">
            <span style={styles.langFlag}>{lang === 'tr' ? '🇹🇷' : '🇬🇧'}</span>
            <span style={styles.langText}>{lang === 'tr' ? 'TR' : 'EN'}</span>
          </button>

          {/* Cart — only customers */}
          {user?.role === 'customer' && (
            <Link to="/cart" style={styles.cartBtn}>
              <span>🛒</span>
              {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
            </Link>
          )}

          {!user ? (
            <Link to="/login" className="btn btn-primary btn-sm">{t('nav.login')}</Link>
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{roleLabel}</div>
                  </div>

                  {user.role === 'customer' && (
                    <Link to="/orders" style={styles.dropdownItem}>📦 {t('nav.orders')}</Link>
                  )}

                  {(user.role === 'employee' || user.role === 'admin') && (
                    <>
                      <Link to="/employee" style={styles.dropdownItem}>🏠 {t('nav.employeePanel')}</Link>
                      <Link to="/employee/products" style={styles.dropdownItem}>🍜 {t('nav.productMgmt')}</Link>
                      <Link to="/employee/deliver" style={styles.dropdownItem}>✅ {t('nav.delivery')}</Link>
                      <Link to="/employee/orders" style={styles.dropdownItem}>📋 {t('nav.allOrders')}</Link>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <>
                      <div style={styles.dropdownDivider} />
                      <Link to="/admin" style={styles.dropdownItem}>👑 {t('nav.adminPanel')}</Link>
                      <Link to="/admin/categories" style={styles.dropdownItem}>🏷️ {t('nav.categories')}</Link>
                      <Link to="/admin/users" style={styles.dropdownItem}>👥 {t('nav.users')}</Link>
                    </>
                  )}

                  <div style={styles.dropdownDivider} />
                  <button onClick={handleLogout} style={{ ...styles.dropdownItem, color: 'var(--danger)', width: '100%', textAlign: 'left' }}>
                    🚪 {t('nav.logout')}
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
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
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
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  langBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: 'var(--cream)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--charcoal)',
    transition: 'all 0.15s',
    fontFamily: "'DM Sans', sans-serif",
  },
  langFlag: { fontSize: 16 },
  langText: { letterSpacing: '0.04em' },
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
  dropdownDivider: { height: 1, background: 'var(--border)', margin: '4px 0' },
};
