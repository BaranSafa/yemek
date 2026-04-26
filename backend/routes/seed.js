const router = require('express').Router();
const User     = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Product  = require('../models/Product');
const Order    = require('../models/Order');

// GET /api/seed — demo verilerini oluşturur (sadece DB boşsa çalışır)
router.get('/', async (req, res) => {
  try {
    const existingUser = await User.findOne({});
    if (existingUser) {
      return res.json({ message: 'Veriler zaten mevcut, seed atlandı.', alreadySeeded: true });
    }

    // Kullanıcılar
    const admin = await User.create({ firstName: 'Adile', lastName: 'Sultan', phone: '05001234567', password: 'admin123', role: 'admin' });
    const employee = await User.create({ firstName: 'Mehmet', lastName: 'Şef', phone: '05001234568', password: 'calisan123', role: 'employee' });
    await User.create({ firstName: 'Ayşe', lastName: 'Kaya', phone: '05001234569', password: 'musteri123', role: 'customer' });

    // Kategoriler
    await Category.insertMany([
      { name: 'Çorba',    emoji: '🥣', description: 'Sıcak ve besleyici çorbalar' },
      { name: 'Yemek',    emoji: '🍛', description: 'Ana yemekler ve etli tarifler' },
      { name: 'Tatlı',    emoji: '🍮', description: 'Geleneksel Türk tatlıları' },
      { name: 'İçecek',   emoji: '☕', description: 'Sıcak ve soğuk içecekler' },
      { name: 'Salata',   emoji: '🥗', description: 'Taze ve hafif salatalar' },
      { name: 'Kahvaltı', emoji: '🍳', description: 'Sabah kahvaltı çeşitleri' },
    ]);

    // Menü öğeleri
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

    // Bugünkü ürün listelemeleri
    const closeAt = new Date(); closeAt.setHours(22, 0, 0, 0);
    const now = new Date();
    const listings = [
      { menuItem: menuItems[0], portions: 20 },
      { menuItem: menuItems[2], portions: 15 },
      { menuItem: menuItems[3], portions: 12 },
      { menuItem: menuItems[4], portions: 10 },
      { menuItem: menuItems[6], portions: 30 },
    ];
    for (const { menuItem, portions } of listings) {
      const p = new Product({
        name: menuItem.name, category: menuItem.category, description: menuItem.description,
        imageUrl: '', basePrice: menuItem.basePrice, currentPrice: menuItem.basePrice,
        menuItemId: menuItem._id, totalPortions: portions, remainingPortions: portions,
        listedAt: now, expiresAt: closeAt, addedBy: employee._id,
      });
      p.calculateCurrentPrice();
      await p.save();
    }

    res.json({
      message: '✅ Seed tamamlandı!',
      users: {
        admin:    { phone: '05001234567', password: 'admin123' },
        employee: { phone: '05001234568', password: 'calisan123' },
        customer: { phone: '05001234569', password: 'musteri123' },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/seed/categories — sadece kategorileri ekler (yoksa)
router.get('/categories', async (req, res) => {
  try {
    const defaults = [
      { name: 'Çorba',    emoji: '🥣', description: 'Sıcak ve besleyici çorbalar' },
      { name: 'Yemek',    emoji: '🍛', description: 'Ana yemekler ve etli tarifler' },
      { name: 'Tatlı',    emoji: '🍮', description: 'Geleneksel Türk tatlıları' },
      { name: 'İçecek',   emoji: '☕', description: 'Sıcak ve soğuk içecekler' },
      { name: 'Salata',   emoji: '🥗', description: 'Taze ve hafif salatalar' },
      { name: 'Kahvaltı', emoji: '🍳', description: 'Sabah kahvaltı çeşitleri' },
    ];

    const added = [];
    for (const cat of defaults) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        added.push(cat.name);
      }
    }

    res.json({ message: 'Kategoriler kontrol edildi', added: added.length ? added : 'Zaten mevcut' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
