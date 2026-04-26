/**
 * Adile Sultan — Veritabanı Seed Scripti
 * Çalıştırmak için:
 *   cd backend && node ../seed.js
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User     = require('./backend/models/User');
const Category = require('./backend/models/Category');
const Product  = require('./backend/models/Product');
const Order    = require('./backend/models/Order');

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('❌ MONGODB_URI bulunamadı'); process.exit(1); }

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlandı\n');

  // Temizle
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
  ]);
  console.log('🧹 Eski veriler silindi');

  // ── Kullanıcılar ─────────────────────────────────────────────────────────
  const admin = await User.create({
    firstName: 'Adile', lastName: 'Sultan',
    phone: '05001234567', password: 'admin123', role: 'admin',
  });
  console.log('👑 Admin    →', admin.phone, '/ admin123');

  const employee = await User.create({
    firstName: 'Mehmet', lastName: 'Şef',
    phone: '05001234568', password: 'calisan123', role: 'employee',
  });
  console.log('👷 Çalışan  →', employee.phone, '/ calisan123');

  const customer = await User.create({
    firstName: 'Ayşe', lastName: 'Kaya',
    phone: '05001234569', password: 'musteri123', role: 'customer',
  });
  console.log('👤 Müşteri  →', customer.phone, '/ musteri123');

  // ── Kategoriler ───────────────────────────────────────────────────────────
  const categories = await Category.insertMany([
    { name: 'Çorba',   emoji: '🥣', description: 'Sıcak ve besleyici çorbalar' },
    { name: 'Yemek',   emoji: '🍛', description: 'Ana yemekler ve etli tarifler' },
    { name: 'Tatlı',   emoji: '🍮', description: 'Geleneksel Türk tatlıları' },
    { name: 'İçecek',  emoji: '☕', description: 'Sıcak ve soğuk içecekler' },
    { name: 'Salata',  emoji: '🥗', description: 'Taze ve hafif salatalar' },
    { name: 'Kahvaltı',emoji: '🍳', description: 'Sabah kahvaltı çeşitleri' },
  ]);
  console.log(`\n📂 ${categories.length} kategori oluşturuldu`);

  // ── Örnek Ürünler ─────────────────────────────────────────────────────────
  const now = new Date();
  const productData = [
    {
      name: 'Mercimek Çorbası', category: 'Çorba',
      description: 'Geleneksel kırmızı mercimek çorbası, naneli ve limonlu',
      basePrice: 35, totalPortions: 20, remainingPortions: 14, salesDurationHours: 3,
      listedAt: new Date(now - 1 * 3600000), expiresAt: new Date(now + 2 * 3600000),
    },
    {
      name: 'İzmir Köfte', category: 'Yemek',
      description: 'Domatesli soslu fırın köfte, pirinç pilavı ile',
      basePrice: 95, totalPortions: 15, remainingPortions: 8, salesDurationHours: 4,
      listedAt: new Date(now - 2.5 * 3600000), expiresAt: new Date(now + 1.5 * 3600000),
    },
    {
      name: 'Karnıyarık', category: 'Yemek',
      description: 'Kıymalı patlıcan dolması, yoğurt ile servis',
      basePrice: 85, totalPortions: 12, remainingPortions: 5, salesDurationHours: 5,
      listedAt: new Date(now - 4 * 3600000), expiresAt: new Date(now + 1 * 3600000),
    },
    {
      name: 'Sütlaç', category: 'Tatlı',
      description: 'Fırınlanmış geleneksel sütlaç',
      basePrice: 45, totalPortions: 10, remainingPortions: 4, salesDurationHours: 2,
      listedAt: new Date(now - 1.8 * 3600000), expiresAt: new Date(now + 0.2 * 3600000),
    },
    {
      name: 'Türk Kahvesi', category: 'İçecek',
      description: 'Geleneksel köpüklü Türk kahvesi, lokum ile',
      basePrice: 25, totalPortions: 30, remainingPortions: 30, salesDurationHours: 8,
      listedAt: new Date(), expiresAt: new Date(now + 8 * 3600000),
    },
  ];

  for (const pData of productData) {
    const p = new Product({ ...pData, currentPrice: pData.basePrice, addedBy: employee._id });
    p.calculateCurrentPrice();
    await p.save();
    console.log(`  🍜 ${p.name.padEnd(18)} ₺${p.basePrice} → ₺${p.currentPrice} (-%${p.discountRate})`);
  }

  console.log('\n✅ Seed tamamlandı!');
  console.log('─────────────────────────────────');
  console.log('Admin   → 05001234567 / admin123');
  console.log('Çalışan → 05001234568 / calisan123');
  console.log('Müşteri → 05001234569 / musteri123');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
