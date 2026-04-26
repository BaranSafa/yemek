/**
 * Adile Sultan — Veritabanı Seed Scripti
 * Çalıştırmak için: node seed.js
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User     = require('./backend/models/User');
const Category = require('./backend/models/Category');
const MenuItem = require('./backend/models/MenuItem');
const Product  = require('./backend/models/Product');
const Order    = require('./backend/models/Order');

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('❌ MONGODB_URI bulunamadı (.env dosyasını kontrol et)'); process.exit(1); }

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlandı\n');

  await Promise.all([User.deleteMany({}), Category.deleteMany({}), MenuItem.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);
  console.log('🧹 Eski veriler temizlendi\n');

  // ── Kullanıcılar ─────────────────────────────────────────────────────────
  const admin = await User.create({ firstName: 'Adile', lastName: 'Sultan', phone: '05001234567', password: 'admin123', role: 'admin' });
  console.log('👑 Admin    →', admin.phone, '/ admin123');

  const employee = await User.create({ firstName: 'Mehmet', lastName: 'Şef', phone: '05001234568', password: 'calisan123', role: 'employee' });
  console.log('👷 Çalışan  →', employee.phone, '/ calisan123');

  const customer = await User.create({ firstName: 'Ayşe', lastName: 'Kaya', phone: '05001234569', password: 'musteri123', role: 'customer' });
  console.log('👤 Müşteri  →', customer.phone, '/ musteri123\n');

  // ── Kategoriler ───────────────────────────────────────────────────────────
  const cats = await Category.insertMany([
    { name: 'Çorba',    emoji: '🥣', description: 'Sıcak ve besleyici çorbalar' },
    { name: 'Yemek',    emoji: '🍛', description: 'Ana yemekler ve etli tarifler' },
    { name: 'Tatlı',    emoji: '🍮', description: 'Geleneksel Türk tatlıları' },
    { name: 'İçecek',   emoji: '☕', description: 'Sıcak ve soğuk içecekler' },
    { name: 'Salata',   emoji: '🥗', description: 'Taze ve hafif salatalar' },
    { name: 'Kahvaltı', emoji: '🍳', description: 'Sabah kahvaltı çeşitleri' },
  ]);
  console.log(`📂 ${cats.length} kategori oluşturuldu`);

  // ── Menü öğeleri (admin tarafından eklenir) ───────────────────────────────
  const menuItems = await MenuItem.insertMany([
    { name: 'Mercimek Çorbası',  category: 'Çorba',  description: 'Geleneksel kırmızı mercimek çorbası, naneli ve limonlu', basePrice: 35, createdBy: admin._id },
    { name: 'Ezogelin Çorbası',  category: 'Çorba',  description: 'Yoğun baharatlı Ezogelin çorbası', basePrice: 38, createdBy: admin._id },
    { name: 'İzmir Köfte',       category: 'Yemek',  description: 'Domatesli soslu fırın köfte, pirinç pilavı ile', basePrice: 95, createdBy: admin._id },
    { name: 'Karnıyarık',        category: 'Yemek',  description: 'Kıymalı patlıcan dolması, yoğurt ile servis', basePrice: 85, createdBy: admin._id },
    { name: 'Sütlaç',            category: 'Tatlı',  description: 'Fırınlanmış geleneksel sütlaç', basePrice: 45, createdBy: admin._id },
    { name: 'Baklava',           category: 'Tatlı',  description: 'Antep fıstıklı ev baklavası', basePrice: 65, createdBy: admin._id },
    { name: 'Türk Kahvesi',      category: 'İçecek', description: 'Geleneksel köpüklü Türk kahvesi, lokum ile', basePrice: 25, createdBy: admin._id },
    { name: 'Çoban Salatası',    category: 'Salata', description: 'Domates, salatalık, biber karışımı', basePrice: 30, createdBy: admin._id },
  ]);
  console.log(`🍽️  ${menuItems.length} menü öğesi oluşturuldu`);

  // ── Bugünkü listeler (çalışan tarafından eklenir) ──────────────────────────
  const closeAt = new Date(); closeAt.setHours(22, 0, 0, 0);
  const now = new Date();

  const listingData = [
    { menuItem: menuItems[0], portions: 20 },
    { menuItem: menuItems[2], portions: 15 },
    { menuItem: menuItems[3], portions: 12 },
    { menuItem: menuItems[4], portions: 10 },
    { menuItem: menuItems[6], portions: 30 },
  ];

  console.log('\n📦 Bugünkü ürün listelemeleri:');
  for (const { menuItem, portions } of listingData) {
    const p = new Product({
      name: menuItem.name, category: menuItem.category, description: menuItem.description,
      imageUrl: menuItem.imageUrl || '', basePrice: menuItem.basePrice, currentPrice: menuItem.basePrice,
      menuItemId: menuItem._id, totalPortions: portions, remainingPortions: portions,
      listedAt: now, expiresAt: closeAt, addedBy: employee._id,
    });
    p.calculateCurrentPrice();
    await p.save();
    console.log(`  🍜 ${p.name.padEnd(20)} ₺${p.basePrice} → ₺${p.currentPrice} (-%${p.discountRate})`);
  }

  console.log('\n✅ Seed tamamlandı!');
  console.log('─────────────────────────────────────');
  console.log('Admin   → 05001234567 / admin123');
  console.log('Çalışan → 05001234568 / calisan123');
  console.log('Müşteri → 05001234569 / musteri123');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
