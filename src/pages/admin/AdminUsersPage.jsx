import { useState, useEffect } from 'react';
import { adminAPI, authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ROLE_MAP = {
  customer: { label: '👤 Müşteri', color: '#4a7c59' },
  employee: { label: '👷 Çalışan', color: '#c17f24' },
  admin: { label: '👑 Admin', color: '#c4622d' },
};
const EMPTY_EMP = { firstName: '', lastName: '', phone: '', password: '', role: 'employee' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_EMP);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const params = roleFilter ? { role: roleFilter } : {};
      const res = await adminAPI.getUsers(params);
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Kullanıcıyı silmek istiyor musunuz?')) return;
    try { await adminAPI.deleteUser(id); toast.success('Silindi'); fetchUsers(); }
    catch { toast.error('Hata'); }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.createEmployee(form);
      toast.success('Çalışan oluşturuldu');
      setShowForm(false);
      setForm(EMPTY_EMP);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
    finally { setSaving(false); }
  };

  return (
    <div style={page}>
      <div className="container">
        <div style={headerRow}>
          <h1 style={pageTitle}>👥 Kullanıcı Yönetimi</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Çalışan Ekle</button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {['', 'customer', 'employee', 'admin'].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              style={{ padding: '7px 18px', borderRadius: '999px', border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif",
                background: roleFilter === r ? 'var(--terracotta)' : 'var(--warm-white)',
                color: roleFilter === r ? 'white' : 'var(--charcoal)',
                borderColor: roleFilter === r ? 'var(--terracotta)' : 'var(--border)',
              }}>
              {r ? ROLE_MAP[r]?.label : 'Tümü'}
            </button>
          ))}
        </div>

        {/* Modal */}
        {showForm && (
          <div style={overlay}>
            <div style={modal}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>Çalışan Ekle</h2>
              <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Ad</label>
                    <input className="form-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Soyad</label>
                    <input className="form-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Şifre</label>
                  <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="employee">Çalışan</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1, justifyContent: 'center' }}>İptal</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                    {saving ? 'Kaydediliyor...' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users list */}
        {loading ? <div className="spinner" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Kullanıcı bulunamadı.</p>}
            {users.map((u) => {
              const rm = ROLE_MAP[u.role];
              return (
                <div key={u._id} style={userRow}>
                  <div style={avatar}>{u.firstName?.[0] || u.phone?.[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.phone}</div>
                  </div>
                  <span style={{ background: '#f0e8e0', color: rm?.color, padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700 }}>
                    {rm?.label}
                  </span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Sil</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const page = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: '2rem' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const modal = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-lg)' };
const userRow = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap' };
const avatar = { width: 40, height: 40, borderRadius: '50%', background: 'var(--terracotta)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', flexShrink: 0 };
