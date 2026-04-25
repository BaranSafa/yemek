import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// ── Stepper indicator ──────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Kategori Seç', 'Ürün Bilgileri', 'Stok & Onayla'];
  return (
    <div style={stepBar}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} style={stepItem}>
            <div style={{
              ...stepCircle,
              background: done ? 'var(--success)' : active ? 'var(--terracotta)' : 'var(--border)',
              color: done || active ? 'white' : 'var(--text-muted)',
            }}>
              {done ? '✓' : idx}
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: active ? 700 : 500, color: active ? 'var(--terracotta)' : done ? 'var(--success)' : 'var(--text-muted)' }}>
              {label}
            </span>
            {i < steps.length - 1 && <div style={stepLine} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Category selection ─────────────────────────────────────────────
function StepCategory({ categories, selected, onSelect, onNext, onCancel }) {
  return (
    <div>
      <h3 style={stepTitle}>Kategori Seçin</h3>
      <p style={stepSubtitle}>Ürününüz hangi kategoriye ait?</p>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
          <p>Henüz kategori yok. Önce Admin panelinden kategori ekleyin.</p>
        </div>
      ) : (
        <div style={catGrid}>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => onSelect(cat)}
              style={{
                ...catCard,
                borderColor: selected?._id === cat._id ? 'var(--terracotta)' : 'var(--border)',
                background: selected?._id === cat._id ? '#fff3ef' : 'var(--cream)',
                transform: selected?._id === cat._id ? 'translateY(-2px)' : 'none',
                boxShadow: selected?._id === cat._id ? 'var(--shadow-md)' : 'none',
              }}
            >
              <div style={catImgWrap}>
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <span style={{ fontSize: 40 }}>{cat.emoji || '🍽️'}</span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: selected?._id === cat._id ? 'var(--terracotta)' : 'var(--charcoal)' }}>
                {cat.name}
              </div>
              {cat.description && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{cat.description}</div>
              )}
              {selected?._id === cat._id && (
                <div style={{ fontSize: '0.75rem', color: 'var(--terracotta)', fontWeight: 700, marginTop: 4 }}>✓ Seçildi</div>
              )}
            </button>
          ))}
        </div>
      )}

      <div style={stepFooter}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>İptal</button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selected}
          onClick={onNext}
          style={{ minWidth: 140 }}
        >
          Devam Et →
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Product details ────────────────────────────────────────────────
function StepDetails({ form, onChange, selectedCategory, onNext, onBack }) {
  return (
    <div>
      <div style={selectedCatBadge}>
        <span style={{ fontSize: 20 }}>{selectedCategory.emoji || '🍽️'}</span>
        <span style={{ fontWeight: 600 }}>{selectedCategory.name}</span>
      </div>

      <h3 style={stepTitle}>Ürün Bilgileri</h3>
      <p style={stepSubtitle}>Ürünün adı, açıklaması ve fiyatını girin.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Ürün Adı *</label>
          <input
            name="name"
            className="form-input"
            placeholder="ör. Mercimek Çorbası"
            value={form.name}
            onChange={onChange}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Açıklama (opsiyonel)</label>
          <textarea
            name="description"
            className="form-input"
            placeholder="Ürün hakkında kısa bir açıklama..."
            value={form.description}
            onChange={onChange}
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Taban Fiyat (₺) *</label>
            <input
              name="basePrice"
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              placeholder="45.00"
              value={form.basePrice}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Satış Süresi (Saat) *</label>
            <input
              name="salesDurationHours"
              type="number"
              min="0.5"
              step="0.5"
              className="form-input"
              placeholder="4"
              value={form.salesDurationHours}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Görsel URL (opsiyonel)</label>
          <input
            name="imageUrl"
            className="form-input"
            placeholder="https://example.com/food.jpg"
            value={form.imageUrl}
            onChange={onChange}
          />
          {form.imageUrl && (
            <div style={{ marginTop: 8, borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: 100, background: 'var(--cream)' }}>
              <img src={form.imageUrl} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </div>
      </div>

      <div style={stepFooter}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>← Geri</button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!form.name.trim() || !form.basePrice || !form.salesDurationHours}
          onClick={onNext}
          style={{ minWidth: 140 }}
        >
          Devam Et →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Stock & Confirm ────────────────────────────────────────────────
function StepStock({ form, onChange, selectedCategory, onBack, onConfirm, saving }) {
  const price = Number(form.basePrice);
  const pricingTiers = [
    { label: 'İlk %60 süre', rate: 0 },
    { label: '%40–60 kalan', rate: 10 },
    { label: '%20–40 kalan', rate: 25 },
    { label: '%10–20 kalan', rate: 40 },
    { label: 'Son %10', rate: 55 },
  ];

  return (
    <div>
      <div style={selectedCatBadge}>
        <span style={{ fontSize: 20 }}>{selectedCategory.emoji || '🍽️'}</span>
        <span style={{ fontWeight: 600 }}>{selectedCategory.name}</span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span style={{ fontWeight: 600 }}>{form.name}</span>
      </div>

      <h3 style={stepTitle}>Stok & Onayla</h3>
      <p style={stepSubtitle}>Kaç porsiyon satışa çıkaracaksınız?</p>

      <div className="form-group" style={{ marginBottom: 24 }}>
        <label className="form-label">Toplam Porsiyon Sayısı *</label>
        <input
          name="totalPortions"
          type="number"
          min="1"
          className="form-input"
          placeholder="ör. 20"
          value={form.totalPortions}
          onChange={onChange}
          required
          autoFocus
          style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', letterSpacing: '0.1em' }}
        />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
          Bu sayı kadar porsiyon müşterilere sunulacak.
        </p>
      </div>

      {/* Pricing preview */}
      {price > 0 && (
        <div style={pricingBox}>
          <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📊</span> Dinamik Fiyatlandırma Önizleme
          </div>
          {pricingTiers.map((tier) => (
            <div key={tier.rate} style={pricingRow}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{tier.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {tier.rate > 0 && (
                  <span style={discountTag}>-%{tier.rate}</span>
                )}
                <span style={{ fontWeight: 700, color: tier.rate > 0 ? 'var(--terracotta)' : 'var(--charcoal)', fontSize: '0.9rem' }}>
                  ₺{(price * (1 - tier.rate / 100)).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary card */}
      <div style={summaryCard}>
        <div style={summaryRow}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kategori</span>
          <span style={{ fontWeight: 600 }}>{selectedCategory.name}</span>
        </div>
        <div style={summaryRow}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ürün</span>
          <span style={{ fontWeight: 600 }}>{form.name}</span>
        </div>
        <div style={summaryRow}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Taban fiyat</span>
          <span style={{ fontWeight: 600 }}>₺{Number(form.basePrice).toFixed(2)}</span>
        </div>
        <div style={summaryRow}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Satış süresi</span>
          <span style={{ fontWeight: 600 }}>{form.salesDurationHours} saat</span>
        </div>
        <div style={summaryRow}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Porsiyon</span>
          <span style={{ fontWeight: 700, color: form.totalPortions ? 'var(--terracotta)' : 'var(--text-muted)' }}>
            {form.totalPortions || '—'} adet
          </span>
        </div>
      </div>

      <div style={stepFooter}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>← Geri</button>
        <button
          type="button"
          className="btn btn-success btn-lg"
          disabled={!form.totalPortions || saving}
          onClick={onConfirm}
          style={{ minWidth: 160, justifyContent: 'center' }}
        >
          {saving ? 'Ekleniyor...' : '✅ Satışa Çıkar'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', description: '', basePrice: '', salesDurationHours: '', totalPortions: '', imageUrl: '' };

export default function ProductManagePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Edit mode (direct modal, no wizard)
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([productAPI.getAllAdmin(), categoryAPI.getAll()]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch { toast.error('Veriler yüklenemedi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openWizard = () => {
    setForm(EMPTY_FORM);
    setSelectedCategory(null);
    setStep(1);
    setShowWizard(true);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await productAPI.create({
        name: form.name,
        category: selectedCategory.name,
        categoryId: selectedCategory._id,
        description: form.description,
        imageUrl: form.imageUrl,
        basePrice: Number(form.basePrice),
        totalPortions: Number(form.totalPortions),
        salesDurationHours: Number(form.salesDurationHours),
      });
      toast.success(`🎉 "${form.name}" satışa çıkarıldı!`);
      setShowWizard(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setEditForm({
      name: p.name,
      description: p.description || '',
      remainingPortions: p.remainingPortions,
      salesDurationHours: p.salesDurationHours,
      imageUrl: p.imageUrl || '',
    });
    setShowEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await productAPI.update(editProduct._id, {
        name: editForm.name,
        description: editForm.description,
        remainingPortions: Number(editForm.remainingPortions),
        salesDurationHours: Number(editForm.salesDurationHours),
        imageUrl: editForm.imageUrl,
      });
      toast.success('Ürün güncellendi');
      setShowEditModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata');
    } finally {
      setEditSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Bu ürünü yayından kaldırmak istiyor musunuz?')) return;
    try { await productAPI.delete(id); toast.success('Ürün kaldırıldı'); fetchAll(); }
    catch { toast.error('Hata'); }
  };

  const handleReactivate = async (id) => {
    try { await productAPI.update(id, { isActive: true }); toast.success('Ürün yeniden yayınlandı'); fetchAll(); }
    catch { toast.error('Hata'); }
  };

  const formatTime = (mins) => {
    if (!mins || mins <= 0) return 'Süresi doldu';
    const h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
  };

  return (
    <div style={page}>
      <div className="container">
        <div style={headerRow}>
          <div>
            <h1 style={pageTitle}>🍜 Ürün Yönetimi</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.9rem' }}>
              {products.length} ürün listelendi
            </p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={openWizard} style={{ justifyContent: 'center' }}>
            + Yeni Ürün Ekle
          </button>
        </div>

        {/* ── Wizard overlay ── */}
        {showWizard && (
          <div style={overlay} onClick={() => setShowWizard(false)}>
            <div style={wizardModal} onClick={(e) => e.stopPropagation()}>
              <StepBar step={step} />
              <div style={{ marginTop: 24 }}>
                {step === 1 && (
                  <StepCategory
                    categories={categories}
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                    onNext={() => setStep(2)}
                    onCancel={() => setShowWizard(false)}
                  />
                )}
                {step === 2 && (
                  <StepDetails
                    form={form}
                    onChange={handleChange}
                    selectedCategory={selectedCategory}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                  />
                )}
                {step === 3 && (
                  <StepStock
                    form={form}
                    onChange={handleChange}
                    selectedCategory={selectedCategory}
                    onBack={() => setStep(2)}
                    onConfirm={handleConfirm}
                    saving={saving}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Edit modal ── */}
        {showEditModal && (
          <div style={overlay} onClick={() => setShowEditModal(false)}>
            <div style={editModal} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>✏️ Ürün Düzenle</h2>
              <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Ürün Adı</label>
                  <input className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Açıklama</label>
                  <textarea className="form-input" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Kalan Porsiyon</label>
                    <input type="number" min="0" className="form-input" value={editForm.remainingPortions} onChange={(e) => setEditForm({ ...editForm, remainingPortions: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Satış Süresi (Saat)</label>
                    <input type="number" min="0.5" step="0.5" className="form-input" value={editForm.salesDurationHours} onChange={(e) => setEditForm({ ...editForm, salesDurationHours: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Görsel URL</label>
                  <input className="form-input" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)} style={{ flex: 1, justifyContent: 'center' }}>İptal</button>
                  <button type="submit" className="btn btn-primary" disabled={editSaving} style={{ flex: 1, justifyContent: 'center' }}>
                    {editSaving ? 'Kaydediliyor...' : 'Güncelle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Product list ── */}
        {loading ? <div className="spinner" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍜</div>
                <p>Henüz ürün eklenmemiş.</p>
              </div>
            )}
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
                    <>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₺{p.basePrice?.toFixed(2)}</div>
                      <span className="badge badge-discount">-%{p.discountRate}</span>
                    </>
                  )}
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

// Styles
const page = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: '2rem' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const wizardModal = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' };
const editModal = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' };
const productRow = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap' };

// Step styles
const stepBar = { display: 'flex', alignItems: 'center', gap: 0, paddingBottom: 20, borderBottom: '1px solid var(--border)' };
const stepItem = { display: 'flex', alignItems: 'center', gap: 8, flex: 1 };
const stepCircle = { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 };
const stepLine = { flex: 1, height: 2, background: 'var(--border)', margin: '0 8px' };
const stepTitle = { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', margin: '0 0 4px' };
const stepSubtitle = { color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 };
const stepFooter = { display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' };

// Category picker
const catGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 8 };
const catCard = { border: '2px solid', borderRadius: 'var(--radius)', padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.15s', textAlign: 'center' };
const catImgWrap = { width: 64, height: 64, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

// Step 2 & 3
const selectedCatBadge = { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '999px', padding: '5px 14px', marginBottom: 16, fontSize: '0.88rem' };
const pricingBox = { background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 16 };
const pricingRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 };
const discountTag = { background: '#fff0ea', color: 'var(--terracotta)', padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 };
const summaryCard = { background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 };
const summaryRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' };
