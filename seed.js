/**
 * Adile Sultan — Veritabanı Seed Scripti
 * Çalıştırmak için: node seed.js
 *
 * Oluşturur:
 *  - 1 Admin kullanıcısı
 *  - 1 Çalışan hesabı
 *  - 1 Test müşterisi
 *  - Birkaç örnek ürün
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adile-sultan';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlandı');

  // Temizle
  await User.deleteMany({});
  await Product.deleteMany({});

  // Admin
  const admin = await User.create({
    firstName: 'Adile',
    lastName: 'Sultan',
    phone: '05001234567',
    password: 'admin123',
    role: 'admin',
  });
  console.log('👑 Admin oluşturuldu:', admin.phone, '/ admin123');

  // Çalışan
  const employee = await User.create({
    firstName: 'Mehmet',
    lastName: 'Şef',
    phone: '05001234568',
    password: 'calisan123',
    role: 'employee',
  });
  console.log('👷 Çalışan oluşturuldu:', employee.phone, '/ calisan123');

  // Test müşterisi
  const customer = await User.create({
    firstName: 'Ayşe',
    lastName: 'Kaya',
    phone: '05001234569',
    password: 'musteri123',
    role: 'customer',
  });
  console.log('👤 Müşteri oluşturuldu:', customer.phone, '/ musteri123');

  // Örnek ürünler
  const now = new Date();
  const products = [
    {
      name: 'Mercimek Çorbası',
      category: 'Çorba',
      description: 'Geleneksel kırmızı mercimek çorbası, naneli ve limonlu',
      basePrice: 35,
      totalPortions: 20,
      remainingPortions: 14,
      salesDurationHours: 3,
      listedAt: new Date(now - 1 * 3600000), // 1 saat önce
      expiresAt: new Date(now + 2 * 3600000), // 2 saat kaldı
      addedBy: employee._id,
    },
    {
      name: 'İzmir Köfte',
      category: 'Yemek',
      description: 'Domatesli soslu fırın köfte, pirinç pilavı ile',
      basePrice: 95,
      totalPortions: 15,
      remainingPortions: 8,
      salesDurationHours: 4,
      listedAt: new Date(now - 2.5 * 3600000), // 2.5 saat önce
      expiresAt: new Date(now + 1.5 * 3600000), // 1.5 saat kaldı
      addedBy: employee._id,
    },
    {
      name: 'Karnıyarık',
      category: 'Yemek',
      description: 'Kıymalı patlıcan dolması, yoğurt ile servis',
      basePrice: 85,
      totalPortions: 12,
      remainingPortions: 5,
      salesDurationHours: 5,
      listedAt: new Date(now - 4 * 3600000), // 4 saat önce
      expiresAt: new Date(now + 1 * 3600000), // 1 saat kaldı
      addedBy: employee._id,
    },
    {
      name: 'Sütlaç',
      category: 'Tatlı',
      description: 'Fırınlanmış geleneksel sütlaç',
      basePrice: 45,
      totalPortions: 10,
      remainingPortions: 4,
      salesDurationHours: 2,
      listedAt: new Date(now - 1.8 * 3600000),
      expiresAt: new Date(now + 0.2 * 3600000), // 12 dk kaldı
      addedBy: employee._id,
    },
    {
      name: 'Türk Kahvesi',
      category: 'İçecek',
      description: 'Geleneksel köpüklü Türk kahvesi, lokum ile',
      basePrice: 25,
      totalPortions: 30,
      remainingPortions: 30,
      salesDurationHours: 8,
      listedAt: new Date(),
      expiresAt: new Date(now + 8 * 3600000),
      addedBy: employee._id,
    },
  ];

  for (const pData of products) {
    const p = new Product({ ...pData, currentPrice: pData.basePrice });
    p.calculateCurrentPrice();
    await p.save();
    console.log(`🍜 ${p.name}: ₺${p.basePrice} → ₺${p.currentPrice} (-%${p.discountRate})`);
  }

  console.log('\n✅ Seed tamamlandı!');
  console.log('\n📋 GİRİŞ BİLGİLERİ:');
  console.log('Admin   → 05001234567 / admin123');
  console.log('Çalışan → 05001234568 / calisan123');
  console.log('Müşteri → 05001234569 / musteri123');

  await mongoose.disconnect();
}

seed().catch(console.error);