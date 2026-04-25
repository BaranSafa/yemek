import { useState, useEffect } from 'react';
import { categoryAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', emoji: '🍽️', imageUrl: '', description: '' };

const EMOJI_OPTIONS = ['🍲', '🍽️', '🍮', '☕', '🥡', '🥗', '🥩', '🍜', '🥘', '🫕', '🍱', '🥪', '🧆', '🍰', '🧁'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (cat) => {
    setEditItem(cat);
    setForm({ name: cat.name, emoji: cat.emoji || '🍽️', imageUrl: cat.imageUrl || '', description: cat.description || '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Kategori adı zorunlu'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await categoryAPI.update(editItem._id, form);
        toast.success('Kategori güncellendi');
      } else {
        await categoryAPI.create(form);
        toast.success('Kategori eklendi');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" kategorisini silmek istiyor musunuz?\nBu kategorideki ürünler etkilenebilir.`)) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Kategori silindi');
      fetchCategories();
    } catch {
      toast.error('Hata oluştu');
    }
  };

  return (
    <div style={page}>
      <div className="container">
        <div style={headerRow}>
          <div>
            <h1 style={pageTitle}>🏷️ Kategori Yönetimi</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.9rem' }}>
              Ürün kategorilerini ekleyin, düzenleyin veya kaldırın.
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Yeni Kategori</button>
        </div>

        {/* Modal */}
        {showForm && (
          <div style={overlay} onClick={() => setShowForm(false)}>
            <div style={modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 24 }}>
                {editItem ? '✏️ Kategori Düzenle' : '➕ Yeni Kategori'}
              </h2>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Kategori Adı *</label>
                  <input
                    className="form-input"
                    placeholder="ör. Çorba, Tatlı, İçecek..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <div style={emojiGrid}>
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setForm({ ...form, emoji: em })}
                        style={{
                          ...emojiBtn,
                          background: form.emoji === em ? 'var(--terracotta)' : 'var(--cream)',
                          border: `2px solid ${form.emoji === em ? 'var(--terracotta)' : 'var(--border)'}`,
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seçili:</span>
                    <span style={{ fontSize: 24 }}>{form.emoji}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Görsel URL (opsiyonel)</label>
                  <input
                    className="form-input"
                    placeholder="https://example.com/category.jpg"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />
                  {form.imageUrl && (
                    <div style={{ marginTop: 8, borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: 80, background: 'var(--cream)' }}>
                      <img
                        src={form.imageUrl}
                        alt="Önizleme"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Açıklama (opsiyonel)</label>
                  <textarea
                    className="form-input"
                    placeholder="Bu kategori hakkında kısa bir açıklama..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1, justifyContent: 'center' }}>
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                    {saving ? 'Kaydediliyor...' : editItem ? 'Güncelle' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories grid */}
        {loading ? (
          <div className="spinner" />
        ) : categories.length === 0 ? (
          <div style={emptyState}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🏷️</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif" }}>Henüz kategori yok</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 20 }}>
              İlk kategoriyi ekleyerek başlayın.
            </p>
            <button className="btn btn-primary" onClick={openAdd}>+ Kategori Ekle</button>
          </div>
        ) : (
          <div style={catGrid}>
            {categories.map((cat) => (
              <div key={cat._id} style={catCard}>
                {/* Image / Emoji */}
                <div style={catImageWrap}>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} style={catImage} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  ) : null}
                  <div style={{ ...catEmoji, display: cat.imageUrl ? 'none' : 'flex' }}>
                    {cat.emoji || '🍽️'}
                  </div>
                </div>

                {/* Info */}
                <div style={catBody}>
                  <div style={catName}>{cat.name}</div>
                  {cat.description && (
                    <div style={catDesc}>{cat.description}</div>
                  )}
                </div>

                {/* Actions */}
                <div style={catActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)} style={{ flex: 1, justifyContent: 'center' }}>
                    ✏️ Düzenle
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat._id, cat.name)} style={{ flex: 1, justifyContent: 'center' }}>
                    🗑 Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const page = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: '2rem' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const modal = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' };
const emojiGrid = { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 };
const emojiBtn = { width: 40, height: 40, borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' };
const emptyState = { textAlign: 'center', padding: '64px 0' };
const catGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 };
const catCard = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const catImageWrap = { height: 140, background: 'var(--cream)', position: 'relative', overflow: 'hidden', flexShrink: 0 };
const catImage = { width: '100%', height: '100%', objectFit: 'cover' };
const catEmoji = { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 56 };
const catBody = { padding: '16px 16px 12px', flex: 1 };
const catName = { fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--charcoal)' };
const catDesc = { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 };
const catActions = { display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border)' };
