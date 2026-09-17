// seed.js — namunaviy telefon brendlari, modellari va variantlarini bazaga qo'shadi
// DIQQAT: bu NAMUNA ma'lumotlar. 1C bazasiga ulanganimizda, bu o'rniga
// haqiqiy mahsulotlar (va ularning haqiqiy variantlari) avtomatik olib kelinadi.
//
// model_group — bir xil modelning turli variantlarini (xotira/rang) birlashtiradi.
// Bitta model_group ichida 1 ta mahsulot bo'lsa — foydalanuvchi to'g'ridan-to'g'ri
// o'sha mahsulotga o'tadi. Bir nechta bo'lsa — avval variant tanlash ekrani chiqadi.
//
// Ishga tushirish: npm run seed (yoki server ishga tushganda avtomatik)

const db = require('./db');

const categories = ['iPhone', 'Samsung', 'Xiaomi'];
const catIds = {};

const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
for (const name of categories) {
  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  catIds[name] = existing ? existing.id : insertCat.run(name).lastInsertRowid;
}

const products = [
  // ---------- iPhone — yangi ----------
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Kumush', condition: 'new', description: '256GB, Kumush, Neverlock', price: 18500000, image_url: 'https://picsum.photos/seed/i17pm256s/400/400' },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Qora', condition: 'new', description: '256GB, Qora, Neverlock', price: 18700000, image_url: 'https://picsum.photos/seed/i17pm256b/400/400' },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 512GB Qora', condition: 'new', description: '512GB, Qora, Neverlock', price: 21200000, image_url: 'https://picsum.photos/seed/i17pm512b/400/400' },
  { cat: 'iPhone', group: 'iPhone 17 Pro', name: 'iPhone 17 Pro 256GB', condition: 'new', description: '256GB, Neverlock', price: 16200000, image_url: 'https://picsum.photos/seed/iphone17p/400/400' },
  { cat: 'iPhone', group: 'iPhone 17', name: 'iPhone 17 128GB', condition: 'new', description: '128GB, Neverlock', price: 12800000, image_url: 'https://picsum.photos/seed/iphone17/400/400' },
  { cat: 'iPhone', group: 'iPhone 16 Pro Max', name: 'iPhone 16 Pro Max 256GB', condition: 'new', description: '256GB, Neverlock', price: 15900000, image_url: 'https://picsum.photos/seed/iphone16pm/400/400' },
  { cat: 'iPhone', group: 'iPhone 16 Pro', name: 'iPhone 16 Pro 128GB', condition: 'new', description: '128GB, Neverlock', price: 13600000, image_url: 'https://picsum.photos/seed/iphone16p/400/400' },
  { cat: 'iPhone', group: 'iPhone 16', name: 'iPhone 16 128GB', condition: 'new', description: '128GB, Neverlock', price: 10900000, image_url: 'https://picsum.photos/seed/iphone16/400/400' },

  // ---------- iPhone — ishlatilgan (B/U) ----------
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Kumush, B/U', condition: 'used', description: "256GB, Kumush, holati: 92%, B/U", price: 15200000, image_url: 'https://picsum.photos/seed/i17pm256sused/400/400' },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Qora, B/U', condition: 'used', description: "256GB, Qora, holati: 90%, B/U", price: 15000000, image_url: 'https://picsum.photos/seed/i17pm256bused/400/400' },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 512GB Qora, B/U', condition: 'used', description: "512GB, Qora, holati: 88%, B/U", price: 17400000, image_url: 'https://picsum.photos/seed/i17pm512bused/400/400' },
  { cat: 'iPhone', group: 'iPhone 17 Pro', name: 'iPhone 17 Pro 256GB, B/U', condition: 'used', description: "256GB, holati: 90%, B/U", price: 13300000, image_url: 'https://picsum.photos/seed/iphone17pused/400/400' },
  { cat: 'iPhone', group: 'iPhone 17', name: 'iPhone 17 128GB, B/U', condition: 'used', description: "128GB, holati: 90%, B/U", price: 10500000, image_url: 'https://picsum.photos/seed/iphone17used/400/400' },
  { cat: 'iPhone', group: 'iPhone 16 Pro Max', name: 'iPhone 16 Pro Max 256GB, B/U', condition: 'used', description: "256GB, holati: 88%, B/U", price: 13000000, image_url: 'https://picsum.photos/seed/iphone16pmused/400/400' },
  { cat: 'iPhone', group: 'iPhone 16 Pro', name: 'iPhone 16 Pro 128GB, B/U', condition: 'used', description: "128GB, holati: 88%, B/U", price: 11100000, image_url: 'https://picsum.photos/seed/iphone16pused/400/400' },
  { cat: 'iPhone', group: 'iPhone 16', name: 'iPhone 16 128GB, B/U', condition: 'used', description: "128GB, holati: 87%, B/U", price: 8900000, image_url: 'https://picsum.photos/seed/iphone16used/400/400' },
  { cat: 'iPhone', group: 'iPhone 15 Pro', name: 'iPhone 15 Pro 128GB, B/U', condition: 'used', description: '128GB, holati: 90%, B/U', price: 9800000, image_url: 'https://picsum.photos/seed/iphone15pused/400/400' },
  { cat: 'iPhone', group: 'iPhone 13', name: 'iPhone 13 128GB, B/U', condition: 'used', description: '128GB, holati: 85%, B/U', price: 5900000, image_url: 'https://picsum.photos/seed/iphone13used/400/400' },

  // ---------- Samsung — yangi ----------
  { cat: 'Samsung', group: 'Samsung Galaxy S24 Ultra', name: 'Galaxy S24 Ultra 12/256GB', condition: 'new', description: '12/256GB', price: 12800000, image_url: 'https://picsum.photos/seed/s24ultra256/400/400' },
  { cat: 'Samsung', group: 'Samsung Galaxy S24 Ultra', name: 'Galaxy S24 Ultra 12/512GB', condition: 'new', description: '12/512GB', price: 14200000, image_url: 'https://picsum.photos/seed/s24ultra512/400/400' },
  { cat: 'Samsung', group: 'Samsung Galaxy S24', name: 'Galaxy S24 8/256GB', condition: 'new', description: '8/256GB', price: 9800000, image_url: 'https://picsum.photos/seed/s24/400/400' },
  { cat: 'Samsung', group: 'Samsung Galaxy A55', name: 'Galaxy A55 8/256GB', condition: 'new', description: '8/256GB', price: 4600000, image_url: 'https://picsum.photos/seed/a55/400/400' },
  // ---------- Samsung — ishlatilgan (B/U) ----------
  { cat: 'Samsung', group: 'Samsung Galaxy S24 Ultra', name: 'Galaxy S24 Ultra 12/256GB, B/U', condition: 'used', description: '12/256GB, holati: 90%, B/U', price: 10200000, image_url: 'https://picsum.photos/seed/s24ultraused/400/400' },
  { cat: 'Samsung', group: 'Samsung Galaxy S24', name: 'Galaxy S24 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 90%, B/U', price: 7800000, image_url: 'https://picsum.photos/seed/s24used/400/400' },
  { cat: 'Samsung', group: 'Samsung Galaxy S23', name: 'Galaxy S23 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 88%, B/U', price: 6200000, image_url: 'https://picsum.photos/seed/s23used/400/400' },
  { cat: 'Samsung', group: 'Samsung Galaxy A55', name: 'Galaxy A55 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 87%, B/U', price: 3600000, image_url: 'https://picsum.photos/seed/a55used/400/400' },

  // ---------- Xiaomi — yangi ----------
  { cat: 'Xiaomi', group: 'Xiaomi 14T', name: 'Xiaomi 14T 12/256GB', condition: 'new', description: '12/256GB', price: 7200000, image_url: 'https://picsum.photos/seed/xiaomi14t/400/400' },
  { cat: 'Xiaomi', group: 'Xiaomi 13T', name: 'Xiaomi 13T 12/256GB', condition: 'new', description: '12/256GB', price: 5900000, image_url: 'https://picsum.photos/seed/xiaomi13t/400/400' },
  { cat: 'Xiaomi', group: 'Redmi Note 13 Pro', name: 'Redmi Note 13 Pro 8/256GB', condition: 'new', description: '8/256GB', price: 3100000, image_url: 'https://picsum.photos/seed/redmi13/400/400' },
  // ---------- Xiaomi — ishlatilgan (B/U) ----------
  { cat: 'Xiaomi', group: 'Xiaomi 13T', name: 'Xiaomi 13T 12/256GB, B/U', condition: 'used', description: '12/256GB, holati: 88%, B/U', price: 4400000, image_url: 'https://picsum.photos/seed/xiaomi13tused/400/400' },
  { cat: 'Xiaomi', group: 'Redmi Note 13 Pro', name: 'Redmi Note 13 Pro 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 87%, B/U', price: 2300000, image_url: 'https://picsum.photos/seed/redmi13used/400/400' },
  { cat: 'Xiaomi', group: 'Redmi Note 12', name: 'Redmi Note 12 6/128GB, B/U', condition: 'used', description: '6/128GB, holati: 85%, B/U', price: 1900000, image_url: 'https://picsum.photos/seed/redmi12used/400/400' },
];

const insertProd = db.prepare(`
  INSERT INTO products (category_id, model_group, name, condition, description, price, image_url)
  VALUES (@category_id, @model_group, @name, @condition, @description, @price, @image_url)
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
      image_url: p.image_url,
    });
  }
  console.log(`${products.length} ta telefon qo'shildi.`);
} else {
  console.log('Mahsulotlar allaqachon mavjud, seed o\'tkazib yuborildi.');
}
