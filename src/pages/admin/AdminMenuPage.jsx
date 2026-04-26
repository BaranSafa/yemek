import { useState, useEffect } from 'react';
import { menuItemAPI, categoryAPI } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const EMPTY = { name: '', category: '', description: '', imageUrl: '', basePrice: '' };

export default function AdminMenuPage() {
  const { t } = useLanguage();
  const [items, setItems]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // null | 'add' | 'edit'
  const [form, setForm]           = useState(EMPTY);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const fetchAll = async () => {
    try {
      const [mRes, cRes] = await Promise.all([menuItemAPI.getAll(), categoryAPI.getAll()]);
      setItems(Array.isArray(mRes.data) ? mRes.data : []);
      setCategories(Array.isArray(cRes.data) ? cRes.data : []);
    } catch { toast.error('Yüklenemedi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal('add'); };
  const openEdit = (item) => { setForm({ name: item.name, category: item.category, description: item.description, imageUrl: item.imageUrl, basePrice: item.basePrice }); setEditId(item._id); setModal('edit'); };
  const closeModal = () => setModal(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, basePrice: Number(form.basePrice) };
      if (modal === 'add') {
        await menuItemAPI.create(payload);
        toast.success('Yemek eklendi');
      } else {
        await menuItemAPI.update(editId, payload);
        toast.success('Yemek güncellendi');
      }
      closeModal();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" yemeğini silmek istiyor musunuz?`)) return;
    try { await menuItemAPI.delete(id); toast.success('Silindi'); fetchAll(); }
    catch { toast.error('Hata'); }
  };

  const shown = filterCat ? items.filter((i) => i.category === filterCat) : items;

  return (
    <div style={page}>
      <div className="container">
        <div style={headerRow}>
          <div>
            <h1 style={pageTitle}>🍽️ {t('adminMenu.title')}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.9rem' }}>{t('adminMenu.subtitle')}</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={openAdd} style={{ justifyContent: 'center' }}>
            {t('adminMenu.add')}
          </button>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div style={filterRow}>
            <button style={{ ...filterBtn, ...(filterCat === '' ? filterActive : {}) }} onClick={() => setFilterCat('')}>Tümü</button>
            {categories.map((c) => (
              <button key={c._id} style={{ ...filterBtn, ...(filterCat === c.name ? filterActive : {}) }} onClick={() => setFilterCat(c.name)}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div style={overlay} onClick={closeModal}>
            <div style={modalBox} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>
                {modal === 'add' ? t('adminMenu.addTitle') : t('adminMenu.editTitle')}
              </h2>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">{t('adminMenu.name')}</label>
                  <input className="form-input" placeholder={t('adminMenu.namePlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('adminMenu.category')}</label>
                  <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                    <option value="">— Seçin —</option>
                    {categories.map((c) => <option key={c._id} value={c.name}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('adminMenu.description')}</label>
                  <textarea className="form-input" rows={2} placeholder={t('adminMenu.descPlaceholder')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('adminMenu.basePrice')}</label>
                  <input type="number" min="0" step="0.01" className="form-input" placeholder="45.00" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('adminMenu.imageUrl')}</label>
                  <input className="form-input" placeholder={t('adminMenu.imageUrlPlaceholder')} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                  {form.imageUrl && (
                    <div style={{ marginTop: 8, height: 120, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--cream)' }}>
                      <img src={form.imageUrl} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={closeModal} style={{ flex: 1, justifyContent: 'center' }}>İptal</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 2, justifyContent: 'center' }}>
                    {saving ? 'Kaydediliyor...' : t('adminMenu.' + (modal === 'add' ? 'add' : 'editTitle'))}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? <div className="spinner" /> : shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
            <p>{t('adminMenu.empty')}</p>
          </div>
        ) : (
          <div style={grid}>
            {shown.map((item) => {
              const cat = categories.find((c) => c.name === item.category);
              return (
                <div key={item._id} style={itemCard}>
                  <div style={imgWrap}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div style={{ display: item.imageUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                      {cat?.emoji || '🍽️'}
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: '1rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {cat?.emoji} {item.category}
                    </div>
                    {item.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>{item.description}</div>
                    )}
                    <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--terracotta)', fontSize: '1.1rem' }}>₺{Number(item.basePrice).toFixed(2)}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id, item.name)}>🗑</button>
                      </div>
                    </div>
                  </div>
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
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: '2rem' };
const filterRow = { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 };
const filterBtn = { padding: '6px 14px', borderRadius: '999px', border: '1.5px solid var(--border)', background: 'var(--cream)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--charcoal)', fontFamily: "'DM Sans', sans-serif" };
const filterActive = { background: 'var(--terracotta)', color: 'white', borderColor: 'var(--terracotta)' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const modalBox = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 };
const itemCard = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const imgWrap = { height: 140, background: 'var(--cream)', overflow: 'hidden', position: 'relative' };
