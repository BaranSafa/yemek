import { useState, useEffect } from 'react';
import { productAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Çorba', 'Yemek', 'Tatlı', 'İçecek', 'Diğer'];
const EMPTY_FORM = { name: '', category: 'Yemek', description: '', basePrice: '', totalPortions: '', salesDurationHours: '', imageUrl: '' };

export default function ProductManagePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAllAdmin();
      setProducts(res.data);
    } catch { toast.error('Ürünler yüklenemedi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, category: p.category, description: p.description || '',
      basePrice: p.basePrice, totalPortions: p.totalPortions,
      remainingPortions: p.remainingPortions,
      salesDurationHours: p.salesDurationHours, imageUrl: p.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProduct) {
        await productAPI.update(editProduct._id, {
          name: form.name, category: form.category, description: form.description,
          remainingPortions: Number(form.remainingPortions),
          salesDurationHours: Number(form.salesDurationHours),
          imageUrl: form.imageUrl,
        });
        toast.success('Ürün güncellendi');
      } else {
        await productAPI.create({
          ...form,
          basePrice: Number(form.basePrice),
          totalPortions: Number(form.totalPortions),
          salesDurationHours: Number(form.salesDurationHours),
        });
        toast.success('Ürün eklendi');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata oluştu');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Bu ürünü yayından kaldırmak istiyor musunuz?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Ürün kaldırıldı');
      fetchProducts();
    } catch { toast.error('Hata'); }
  };

  const handleReactivate = async (id) => {
    try {
      await productAPI.update(id, { isActive: true });
      toast.success('Ürün yeniden yayınlandı');
      fetchProducts();
    } catch { toast.error('Hata'); }
  };

  const formatTime = (mins) => {
    if (mins <= 0) return 'Süresi doldu';
    const h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
  };

  return (
    <div style={page}>
      <div className="container">
        <div style={header}>
          <h1 style={pageTitle}>🍜 Ürün Yönetimi</h1>
          <button className="btn btn-primary" onClick={openAdd}>+ Yeni Ürün Ekle</button>
        </div>

        {/* Modal form */}
        {showForm && (
          <div style={overlay}>
            <div style={modal}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>
                {editProduct ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün'}
              </h2>
              <form onSubmit={handleSave} style={formStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Ürün Adı</label>
                    <input name="name" className="form-input" placeholder="Mercimek Çorbası" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fiyat (₺)</label>
                    <input name="basePrice" type="number" min="0" step="0.01" className="form-input" placeholder="45.00"
                      value={form.basePrice} onChange={handleChange} required disabled={!!editProduct} />
                  </div>
                  {!editProduct ? (
                    <div className="form-group">
                      <label className="form-label">Toplam Porsiyon</label>
                      <input name="totalPortions" type="number" min="1" className="form-input" placeholder="20"
                        value={form.totalPortions} onChange={handleChange} required />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Kalan Porsiyon</label>
                      <input name="remainingPortions" type="number" min="0" className="form-input"
                        value={form.remainingPortions} onChange={handleChange} required />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Satış Süresi (Saat)</label>
                    <input name="salesDurationHours" type="number" min="0.5" step="0.5" className="form-input" placeholder="4"
                      value={form.salesDurationHours} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Görsel URL (opsiyonel)</label>
                    <input name="imageUrl" className="form-input" placeholder="https://..." value={form.imageUrl} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Açıklama (opsiyonel)</label>
                    <input name="description" className="form-input" placeholder="Kısa bir açıklama..." value={form.description} onChange={handleChange} />
                  </div>
                </div>

                {/* Pricing preview */}
                {form.basePrice && form.salesDurationHours && !editProduct && (
                  <div style={pricingPreview}>
                    <strong>📊 Dinamik Fiyatlandırma Önizleme</strong>
                    {[
                      { label: 'İlk %60 süre', rate: 0 },
                      { label: '%40–60 kalan', rate: 10 },
                      { label: '%20–40 kalan', rate: 25 },
                      { label: '%10–20 kalan', rate: 40 },
                      { label: 'Son %10', rate: 55 },
                    ].map((s) => (
                      <div key={s.rate} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                        <span style={{ fontWeight: 600, color: s.rate > 0 ? 'var(--terracotta)' : 'var(--charcoal)' }}>
                          ₺{(Number(form.basePrice) * (1 - s.rate / 100)).toFixed(2)}
                          {s.rate > 0 && ` (-%${s.rate})`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1, justifyContent: 'center' }}>İptal</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                    {saving ? 'Kaydediliyor...' : editProduct ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products table */}
        {loading ? <div className="spinner" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Henüz ürün eklenmemiş.</p>}
            {products.map((p) => (
              <div key={p._id} style={{ ...productRow, opacity: p.isActive ? 1 : 0.55 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {p.category} · {p.remainingPortions}/{p.totalPortions} porsiyon
                  </div>
                  {!p.isActive && <span className="badge badge-danger" style={{ marginTop: 4 }}>Yayında Değil</span>}
                </div>
                <div style={{ textAlign: 'center', minWidth: 90 }}>
                  <div style={{ fontWeight: 700, color: 'var(--terracotta)' }}>₺{p.currentPrice?.toFixed(2)}</div>
                  {p.discountRate > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₺{p.basePrice?.toFixed(2)}</div>
                  )}
                  {p.discountRate > 0 && <span className="badge badge-discount">-%{p.discountRate}</span>}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.82rem', minWidth: 80, color: p.remainingMinutes < 60 ? 'var(--terracotta)' : 'var(--text-muted)' }}>
                  ⏱ {formatTime(p.remainingMinutes)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Düzenle</button>
                  {p.isActive
                    ? <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(p._id)}>🚫 Kaldır</button>
                    : <button className="btn btn-success btn-sm" onClick={() => handleReactivate(p._id)}>✅ Yayınla</button>
                  }
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
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: '2rem' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const modal = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: 14 };
const pricingPreview = { background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', border: '1px solid var(--border)' };
const productRow = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap' };
