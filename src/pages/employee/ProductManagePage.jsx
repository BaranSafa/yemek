import { useState, useEffect } from 'react';
import { productAPI, categoryAPI, menuItemAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// ── Stepper ────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Kategori Seç', 'Ürün Seç', 'Stok & Onayla'];
  return (
    <div style={stepBar}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} style={stepItem}>
            <div style={{ ...stepCircle, background: done ? 'var(--success)' : active ? 'var(--terracotta)' : 'var(--border)', color: done || active ? 'white' : 'var(--text-muted)' }}>
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

// ── Step 1: Category ───────────────────────────────────────────────────────
function StepCategory({ categories, selected, onSelect, onNext, onCancel }) {
  return (
    <div>
      <h3 style={stepTitle}>Kategori Seçin</h3>
      <p style={stepSubtitle}>Hangi kategoriden ürün ekleyeceksiniz?</p>
      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
          <p>Henüz kategori yok. Admin panelinden kategori ekleyin.</p>
        </div>
      ) : (
        <div style={catGrid}>
          {categories.map((cat) => (
            <button key={cat._id} type="button" onClick={() => onSelect(cat)} style={{ ...catCard, borderColor: selected?._id === cat._id ? 'var(--terracotta)' : 'var(--border)', background: selected?._id === cat._id ? '#fff3ef' : 'var(--cream)' }}>
              <div style={catImgWrap}>
                {cat.imageUrl
                  ? <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  : <span style={{ fontSize: 36 }}>{cat.emoji || '🍽️'}</span>}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selected?._id === cat._id ? 'var(--terracotta)' : 'var(--charcoal)' }}>{cat.name}</div>
              {selected?._id === cat._id && <div style={{ fontSize: '0.72rem', color: 'var(--terracotta)', fontWeight: 700 }}>✓ Seçildi</div>}
            </button>
          ))}
        </div>
      )}
      <div style={stepFooter}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>İptal</button>
        <button type="button" className="btn btn-primary" disabled={!selected} onClick={onNext} style={{ minWidth: 140 }}>Devam Et →</button>
      </div>
    </div>
  );
}

// ── Step 2: Menu Item Select ───────────────────────────────────────────────
function StepMenuItem({ menuItems, selected, onSelect, selectedCategory, onNext, onBack, loading }) {
  const filtered = menuItems.filter((m) => m.category === selectedCategory.name);
  return (
    <div>
      <div style={catBadge}>
        <span style={{ fontSize: 20 }}>{selectedCategory.emoji || '🍽️'}</span>
        <span style={{ fontWeight: 600 }}>{selectedCategory.name}</span>
      </div>
      <h3 style={stepTitle}>Ürün Seçin</h3>
      <p style={stepSubtitle}>Satışa çıkarmak istediğiniz ürünü seçin.</p>

      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
          <p>Bu kategoride henüz ürün tanımlanmamış.</p>
          <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Admin paneli → Ürün Yönetimi bölümünden ekleyin.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          {filtered.map((item) => {
            const isSelected = selected?._id === item._id;
            return (
              <button key={item._id} type="button" onClick={() => onSelect(item)}
                style={{ border: `2px solid ${isSelected ? 'var(--terracotta)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isSelected ? '#fff3ef' : 'var(--cream)', transition: 'all 0.15s', width: '100%', textAlign: 'left' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: isSelected ? 'var(--terracotta)' : 'var(--charcoal)' }}>
                  {item.name}
                </span>
                {isSelected && <span style={{ color: 'var(--terracotta)', fontWeight: 700, fontSize: '1.1rem' }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      <div style={stepFooter}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>← Geri</button>
        <button type="button" className="btn btn-primary" disabled={!selected} onClick={onNext} style={{ minWidth: 140 }}>Devam Et →</button>
      </div>
    </div>
  );
}

// ── Step 3: Stock & Confirm ────────────────────────────────────────────────
function StepStock({ selectedMenuItem, selectedCategory, totalPortions, onChange, onBack, onConfirm, saving }) {
  const now = new Date();
  const closeAt = new Date();
  closeAt.setHours(22, 0, 0, 0);
  const hoursLeft = Math.max(0, (closeAt - now) / 3600000);

  const pricingTiers = [
    { label: '> 6 saat kala', hours: '>6', rate: 0 },
    { label: '4–6 saat kala', hours: '4-6', rate: 10 },
    { label: '2–4 saat kala', hours: '2-4', rate: 25 },
    { label: '1–2 saat kala', hours: '1-2', rate: 40 },
    { label: '< 1 saat kala', hours: '<1', rate: 55 },
  ];

  const currentRate = hoursLeft > 6 ? 0 : hoursLeft > 4 ? 10 : hoursLeft > 2 ? 25 : hoursLeft > 1 ? 40 : 55;
  const price = Number(selectedMenuItem.basePrice);

  return (
    <div>
      <div style={catBadge}>
        <span style={{ fontSize: 20 }}>{selectedCategory.emoji || '🍽️'}</span>
        <span style={{ fontWeight: 600 }}>{selectedCategory.name}</span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span style={{ fontWeight: 600 }}>{selectedMenuItem.name}</span>
      </div>

      <h3 style={stepTitle}>Stok Miktarı</h3>
      <p style={stepSubtitle}>Bugün kaç porsiyon satışa çıkarmak istiyorsunuz?</p>

      <div className="form-group" style={{ marginBottom: 20 }}>
        <input
          type="number" min="1" className="form-input"
          placeholder="ör. 20"
          value={totalPortions}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', letterSpacing: '0.1em' }}
        />
      </div>

      {/* 22:00 info */}
      <div style={{ background: '#fff8e1', border: '1px solid var(--gold)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 16, fontSize: '0.85rem', color: '#8a6010', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>⏰</span>
        <span>Tüm ürünler bugün <strong>22:00'de</strong> kapanır. Şu an <strong>{Math.floor(hoursLeft)}s {Math.round((hoursLeft % 1) * 60)}dk</strong> kaldı.</span>
      </div>

      {/* Pricing preview */}
      {price > 0 && (
        <div style={pricingBox}>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.88rem' }}>📊 Otomatik İndirim Takvimi</div>
          {pricingTiers.map((tier) => {
            const isCurrent = tier.rate === currentRate;
            return (
              <div key={tier.rate} style={{ ...pricingRow, background: isCurrent ? '#fff3ef' : 'transparent', borderRadius: 6, padding: '4px 8px' }}>
                <span style={{ color: isCurrent ? 'var(--terracotta)' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: isCurrent ? 700 : 400 }}>
                  {isCurrent ? '▶ ' : ''}{tier.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {tier.rate > 0 && <span style={discountTag}>-%{tier.rate}</span>}
                  <span style={{ fontWeight: 700, color: isCurrent ? 'var(--terracotta)' : 'var(--charcoal)', fontSize: '0.88rem' }}>
                    ₺{(price * (1 - tier.rate / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div style={summaryCard}>
        {[
          ['Kategori', selectedCategory.name],
          ['Ürün', selectedMenuItem.name],
          ['Taban Fiyat', `₺${price.toFixed(2)}`],
          ['Şu anki fiyat', `₺${(price * (1 - currentRate / 100)).toFixed(2)} (-%${currentRate})`],
          ['Porsiyon', totalPortions ? `${totalPortions} adet` : '—'],
          ['Kapanış', 'Bugün 22:00'],
        ].map(([label, val]) => (
          <div key={label} style={summaryRow}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={stepFooter}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>← Geri</button>
        <button type="button" className="btn btn-success btn-lg" disabled={!totalPortions || saving} onClick={onConfirm} style={{ minWidth: 160, justifyContent: 'center' }}>
          {saving ? 'Ekleniyor...' : '✅ Satışa Çıkar'}
        </button>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function ProductManagePage() {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [menuItems, setMenuItems]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [showWizard, setShowWizard]   = useState(false);
  const [step, setStep]               = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [totalPortions, setTotalPortions] = useState('');
  const [saving, setSaving]           = useState(false);

  // Edit modal
  const [editProduct, setEditProduct] = useState(null);
  const [editPortions, setEditPortions] = useState('');
  const [editSaving, setEditSaving]   = useState(false);

  const fetchAll = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([productAPI.getAllAdmin(), categoryAPI.getAll()]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch { toast.error('Veriler yüklenemedi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openWizard = async () => {
    setSelectedCategory(null);
    setSelectedMenuItem(null);
    setTotalPortions('');
    setStep(1);
    setShowWizard(true);

    if (menuItems.length === 0) {
      setMenuLoading(true);
      try {
        const res = await menuItemAPI.getAll();
        setMenuItems(Array.isArray(res.data) ? res.data : []);
      } catch { toast.error('Menü yüklenemedi'); }
      finally { setMenuLoading(false); }
    }
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await productAPI.create({ menuItemId: selectedMenuItem._id, totalPortions: Number(totalPortions) });
      toast.success(`🎉 "${selectedMenuItem.name}" satışa çıkarıldı!`);
      setShowWizard(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata oluştu');
    } finally { setSaving(false); }
  };

  const openEdit = (p) => { setEditProduct(p); setEditPortions(String(p.remainingPortions)); };
  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await productAPI.update(editProduct._id, { remainingPortions: Number(editPortions) });
      toast.success('Stok güncellendi');
      setEditProduct(null);
      fetchAll();
    } catch { toast.error('Hata'); }
    finally { setEditSaving(false); }
  };
  const handleToggle = async (p) => {
    try {
      await productAPI.update(p._id, { isActive: !p.isActive });
      toast.success(p.isActive ? 'Yayından kaldırıldı' : 'Yeniden yayınlandı');
      fetchAll();
    } catch { toast.error('Hata'); }
  };

  const minutesUntilClose = () => {
    const close = new Date(); close.setHours(22, 0, 0, 0);
    return Math.max(0, Math.round((close - new Date()) / 60000));
  };
  const formatMins = (m) => { if (m <= 0) return 'Kapandı'; const h = Math.floor(m / 60); const min = m % 60; return h ? `${h}s ${min}dk` : `${min}dk`; };

  return (
    <div style={page}>
      <div className="container">
        <div style={headerRow}>
          <div>
            <h1 style={pageTitle}>🍜 Ürün Yönetimi</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.9rem' }}>{products.length} ürün listelendi • Kapanış: 22:00</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={openWizard} style={{ justifyContent: 'center' }}>+ Satışa Çıkarılacak Ürün Ekle</button>
        </div>

        {/* Wizard */}
        {showWizard && (
          <div style={overlay} onClick={() => setShowWizard(false)}>
            <div style={wizardModal} onClick={(e) => e.stopPropagation()}>
              <StepBar step={step} />
              <div style={{ marginTop: 24 }}>
                {step === 1 && (
                  <StepCategory categories={categories} selected={selectedCategory} onSelect={setSelectedCategory}
                    onNext={() => setStep(2)} onCancel={() => setShowWizard(false)} />
                )}
                {step === 2 && (
                  <StepMenuItem menuItems={menuItems} selected={selectedMenuItem} onSelect={setSelectedMenuItem}
                    selectedCategory={selectedCategory} onNext={() => setStep(3)} onBack={() => setStep(1)} loading={menuLoading} />
                )}
                {step === 3 && (
                  <StepStock selectedMenuItem={selectedMenuItem} selectedCategory={selectedCategory}
                    totalPortions={totalPortions} onChange={setTotalPortions}
                    onBack={() => setStep(2)} onConfirm={handleConfirm} saving={saving} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editProduct && (
          <div style={overlay} onClick={() => setEditProduct(null)}>
            <div style={editModal} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>✏️ Stok Güncelle</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>{editProduct.name}</p>
              <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Kalan Porsiyon</label>
                  <input type="number" min="0" className="form-input" value={editPortions} onChange={(e) => setEditPortions(e.target.value)} required style={{ fontSize: '1.4rem', textAlign: 'center', fontWeight: 700 }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditProduct(null)} style={{ flex: 1, justifyContent: 'center' }}>İptal</button>
                  <button type="submit" className="btn btn-primary" disabled={editSaving} style={{ flex: 1, justifyContent: 'center' }}>
                    {editSaving ? 'Kaydediliyor...' : 'Güncelle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product list */}
        {loading ? <div className="spinner" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍜</div>
                <p>Bugün henüz ürün eklenmemiş.</p>
              </div>
            )}
            {products.map((p) => {
              const minsLeft = minutesUntilClose();
              return (
                <div key={p._id} style={{ ...productRow, opacity: p.isActive ? 1 : 0.5 }}>
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt={p.name} style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
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
                      <><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₺{p.basePrice?.toFixed(2)}</div>
                      <span className="badge badge-discount">-%{p.discountRate}</span></>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: minsLeft < 60 ? 'var(--terracotta)' : 'var(--text-muted)', minWidth: 80, textAlign: 'center' }}>
                    ⏰ {formatMins(minsLeft)}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️</button>
                    <button className={`btn btn-sm ${p.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(p)}>
                      {p.isActive ? '🚫' : '✅'}
                    </button>
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

// Styles
const page = { paddingTop: 40, paddingBottom: 64, minHeight: 'calc(100vh - 70px)' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: '2rem' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const wizardModal = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' };
const editModal = { background: 'var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-lg)' };
const productRow = { background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap' };
const stepBar = { display: 'flex', alignItems: 'center', paddingBottom: 20, borderBottom: '1px solid var(--border)' };
const stepItem = { display: 'flex', alignItems: 'center', gap: 8, flex: 1 };
const stepCircle = { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 };
const stepLine = { flex: 1, height: 2, background: 'var(--border)', margin: '0 8px' };
const stepTitle = { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', margin: '0 0 4px' };
const stepSubtitle = { color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 };
const stepFooter = { display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' };
const catGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 8 };
const catCard = { border: '2px solid', borderRadius: 'var(--radius)', padding: '10px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.15s', textAlign: 'center' };
const catImgWrap = { width: 56, height: 56, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const catBadge = { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '999px', padding: '5px 14px', marginBottom: 16, fontSize: '0.88rem' };
const menuItemRow = { border: '2px solid', borderRadius: 'var(--radius)', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s', textAlign: 'left', width: '100%' };
const menuItemImg = { width: 52, height: 52, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const pricingBox = { background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 14 };
const pricingRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 };
const discountTag = { background: '#fff0ea', color: 'var(--terracotta)', padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 };
const summaryCard = { background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 };
const summaryRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' };
