// seed.js — namunaviy telefon brendlari, modellari va variantlarini bazaga qo'shadi
// DIQQAT: bu NAMUNA ma'lumotlar (narxlar AQSh dollarida). 1C bazasiga ulanganimizda, bu o'rniga
// haqiqiy mahsulotlar (rasmlari bilan birga) avtomatik olib kelinadi.
//
// model_group — bir xil modelning turli variantlarini (xotira/rang) birlashtiradi.
// Ishga tushirish: npm run seed (yoki server ishga tushganda avtomatik)

const db = require('./db');

// Rasmlar: image_url bo'sh qoldiriladi — mini app telefonning brendi, modeli va
// rangiga qarab illyustratsiya chizadi. Haqiqiy foto kerak bo'lsa, admin panelda
// "Rasm havolasi" maydoniga kiritiladi (1C ulanganda u yerdan keladi).

const categories = ['iPhone', 'Samsung', 'Xiaomi'];
const catIds = {};

const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
for (const name of categories) {
  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  catIds[name] = existing ? existing.id : insertCat.run(name).lastInsertRowid;
}

const products = [
  // ---------- iPhone — yangi ----------
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Kumush', condition: 'new', description: '256GB, Kumush, Neverlock', price: 1540 },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Qora', condition: 'new', description: '256GB, Qora, Neverlock', price: 1560 },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 512GB Qora', condition: 'new', description: '512GB, Qora, Neverlock', price: 1770 },
  { cat: 'iPhone', group: 'iPhone 17 Pro', name: 'iPhone 17 Pro 256GB', condition: 'new', description: '256GB, Neverlock', price: 1350 },
  { cat: 'iPhone', group: 'iPhone 17', name: 'iPhone 17 128GB', condition: 'new', description: '128GB, Neverlock', price: 1070 },
  { cat: 'iPhone', group: 'iPhone 16 Pro Max', name: 'iPhone 16 Pro Max 256GB', condition: 'new', description: '256GB, Neverlock', price: 1320 },
  { cat: 'iPhone', group: 'iPhone 16 Pro', name: 'iPhone 16 Pro 128GB', condition: 'new', description: '128GB, Neverlock', price: 1130 },
  { cat: 'iPhone', group: 'iPhone 16', name: 'iPhone 16 128GB', condition: 'new', description: '128GB, Neverlock', price: 910 },

  // ---------- iPhone — ishlatilgan (B/U) ----------
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Kumush, B/U', condition: 'used', description: "256GB, Kumush, holati: 92%, B/U", price: 1270 },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Qora, B/U', condition: 'used', description: "256GB, Qora, holati: 90%, B/U", price: 1250 },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 512GB Qora, B/U', condition: 'used', description: "512GB, Qora, holati: 88%, B/U", price: 1450 },
  { cat: 'iPhone', group: 'iPhone 17 Pro', name: 'iPhone 17 Pro 256GB, B/U', condition: 'used', description: "256GB, holati: 90%, B/U", price: 1110 },
  { cat: 'iPhone', group: 'iPhone 17', name: 'iPhone 17 128GB, B/U', condition: 'used', description: "128GB, holati: 90%, B/U", price: 880 },
  { cat: 'iPhone', group: 'iPhone 16 Pro Max', name: 'iPhone 16 Pro Max 256GB, B/U', condition: 'used', description: "256GB, holati: 88%, B/U", price: 1080 },
  { cat: 'iPhone', group: 'iPhone 16 Pro', name: 'iPhone 16 Pro 128GB, B/U', condition: 'used', description: "128GB, holati: 88%, B/U", price: 920 },
  { cat: 'iPhone', group: 'iPhone 16', name: 'iPhone 16 128GB, B/U', condition: 'used', description: "128GB, holati: 87%, B/U", price: 740 },
  { cat: 'iPhone', group: 'iPhone 15 Pro', name: 'iPhone 15 Pro 128GB, B/U', condition: 'used', description: '128GB, holati: 90%, B/U', price: 820 },
  { cat: 'iPhone', group: 'iPhone 13', name: 'iPhone 13 128GB, B/U', condition: 'used', description: '128GB, holati: 85%, B/U', price: 490 },

  // ---------- Samsung — yangi ----------
  { cat: 'Samsung', group: 'Samsung Galaxy S24 Ultra', name: 'Galaxy S24 Ultra 12/256GB', condition: 'new', description: '12/256GB', price: 1070 },
  { cat: 'Samsung', group: 'Samsung Galaxy S24 Ultra', name: 'Galaxy S24 Ultra 12/512GB', condition: 'new', description: '12/512GB', price: 1180 },
  { cat: 'Samsung', group: 'Samsung Galaxy S24', name: 'Galaxy S24 8/256GB', condition: 'new', description: '8/256GB', price: 820 },
  { cat: 'Samsung', group: 'Samsung Galaxy A55', name: 'Galaxy A55 8/256GB', condition: 'new', description: '8/256GB', price: 380 },
  // ---------- Samsung — ishlatilgan (B/U) ----------
  { cat: 'Samsung', group: 'Samsung Galaxy S24 Ultra', name: 'Galaxy S24 Ultra 12/256GB, B/U', condition: 'used', description: '12/256GB, holati: 90%, B/U', price: 850 },
  { cat: 'Samsung', group: 'Samsung Galaxy S24', name: 'Galaxy S24 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 90%, B/U', price: 650 },
  { cat: 'Samsung', group: 'Samsung Galaxy S23', name: 'Galaxy S23 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 88%, B/U', price: 520 },
  { cat: 'Samsung', group: 'Samsung Galaxy A55', name: 'Galaxy A55 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 87%, B/U', price: 300 },

  // ---------- Xiaomi — yangi ----------
  { cat: 'Xiaomi', group: 'Xiaomi 14T', name: 'Xiaomi 14T 12/256GB', condition: 'new', description: '12/256GB', price: 600 },
  { cat: 'Xiaomi', group: 'Xiaomi 13T', name: 'Xiaomi 13T 12/256GB', condition: 'new', description: '12/256GB', price: 490 },
  { cat: 'Xiaomi', group: 'Redmi Note 13 Pro', name: 'Redmi Note 13 Pro 8/256GB', condition: 'new', description: '8/256GB', price: 260 },
  // ---------- Xiaomi — ishlatilgan (B/U) ----------
  { cat: 'Xiaomi', group: 'Xiaomi 13T', name: 'Xiaomi 13T 12/256GB, B/U', condition: 'used', description: '12/256GB, holati: 88%, B/U', price: 370 },
  { cat: 'Xiaomi', group: 'Redmi Note 13 Pro', name: 'Redmi Note 13 Pro 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 87%, B/U', price: 190 },
  { cat: 'Xiaomi', group: 'Redmi Note 12', name: 'Redmi Note 12 6/128GB, B/U', condition: 'used', description: '6/128GB, holati: 85%, B/U', price: 160 },
];

const insertProd = db.prepare(`
  INSERT INTO products (category_id, model_group, name, condition, description, price)
  VALUES (@category_id, @model_group, @name, @condition, @description, @price)
`);

const existingCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (existingCount === 0) {
  for (const p of products) {
    insertProd.run({
      category_id: catIds[p.cat],
      model_group: p.group,
      name: p.name,
      condition: p.condition,
      description: p.description,
      price: p.price,
    });
  }
  console.log(`${products.length} ta telefon qo'shildi.`);
} else {
  console.log('Mahsulotlar allaqachon mavjud, seed o\'tkazib yuborildi.');
}
