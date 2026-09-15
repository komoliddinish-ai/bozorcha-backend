// seed.js — namunaviy telefon brendlari va modellarini bazaga qo'shadi
// DIQQAT: bu NAMUNA ma'lumotlar. 1C bazasiga ulanganimizda, bu o'rniga
// haqiqiy mahsulotlar avtomatik olib kelinadi.
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
  { cat: 'iPhone', name: 'iPhone 17 Pro Max', condition: 'new', description: '256GB, Neverlock', price: 18500000, image_url: 'https://picsum.photos/seed/iphone17pm/400/400' },
  { cat: 'iPhone', name: 'iPhone 17 Pro', condition: 'new', description: '256GB, Neverlock', price: 16200000, image_url: 'https://picsum.photos/seed/iphone17p/400/400' },
  { cat: 'iPhone', name: 'iPhone 17', condition: 'new', description: '128GB, Neverlock', price: 12800000, image_url: 'https://picsum.photos/seed/iphone17/400/400' },
  { cat: 'iPhone', name: 'iPhone 16 Pro Max', condition: 'new', description: '256GB, Neverlock', price: 15900000, image_url: 'https://picsum.photos/seed/iphone16pm/400/400' },
  { cat: 'iPhone', name: 'iPhone 16 Pro', condition: 'new', description: '128GB, Neverlock', price: 13600000, image_url: 'https://picsum.photos/seed/iphone16p/400/400' },
  { cat: 'iPhone', name: 'iPhone 16', condition: 'new', description: '128GB, Neverlock', price: 10900000, image_url: 'https://picsum.photos/seed/iphone16/400/400' },
  // ---------- iPhone — ishlatilgan (B/U) ----------
  { cat: 'iPhone', name: 'iPhone 17 Pro Max', condition: 'used', description: "256GB, holati: 92%, B/U", price: 15200000, image_url: 'https://picsum.photos/seed/iphone17pmused/400/400' },
  { cat: 'iPhone', name: 'iPhone 17 Pro', condition: 'used', description: "256GB, holati: 90%, B/U", price: 13300000, image_url: 'https://picsum.photos/seed/iphone17pused/400/400' },
  { cat: 'iPhone', name: 'iPhone 17', condition: 'used', description: "128GB, holati: 90%, B/U", price: 10500000, image_url: 'https://picsum.photos/seed/iphone17used/400/400' },
  { cat: 'iPhone', name: 'iPhone 16 Pro Max', condition: 'used', description: "256GB, holati: 88%, B/U", price: 13000000, image_url: 'https://picsum.photos/seed/iphone16pmused/400/400' },
  { cat: 'iPhone', name: 'iPhone 16 Pro', condition: 'used', description: "128GB, holati: 88%, B/U", price: 11100000, image_url: 'https://picsum.photos/seed/iphone16pused/400/400' },
  { cat: 'iPhone', name: 'iPhone 16', condition: 'used', description: "128GB, holati: 87%, B/U", price: 8900000, image_url: 'https://picsum.photos/seed/iphone16used/400/400' },
  { cat: 'iPhone', name: 'iPhone 15 Pro', condition: 'used', description: '128GB, holati: 90%, B/U', price: 9800000, image_url: 'https://picsum.photos/seed/iphone15pused/400/400' },
  { cat: 'iPhone', name: 'iPhone 13', condition: 'used', description: '128GB, holati: 85%, B/U', price: 5900000, image_url: 'https://picsum.photos/seed/iphone13used/400/400' },

  // ---------- Samsung — yangi ----------
  { cat: 'Samsung', name: 'Samsung Galaxy S24 Ultra', condition: 'new', description: '12/256GB', price: 12800000, image_url: 'https://picsum.photos/seed/s24ultra/400/400' },
  { cat: 'Samsung', name: 'Samsung Galaxy S24', condition: 'new', description: '8/256GB', price: 9800000, image_url: 'https://picsum.photos/seed/s24/400/400' },
  { cat: 'Samsung', name: 'Samsung Galaxy A55', condition: 'new', description: '8/256GB', price: 4600000, image_url: 'https://picsum.photos/seed/a55/400/400' },
  // ---------- Samsung — ishlatilgan (B/U) ----------
  { cat: 'Samsung', name: 'Samsung Galaxy S24 Ultra', condition: 'used', description: '12/256GB, holati: 90%, B/U', price: 10200000, image_url: 'https://picsum.photos/seed/s24ultraused/400/400' },
  { cat: 'Samsung', name: 'Samsung Galaxy S24', condition: 'used', description: '8/256GB, holati: 90%, B/U', price: 7800000, image_url: 'https://picsum.photos/seed/s24used/400/400' },
  { cat: 'Samsung', name: 'Samsung Galaxy S23', condition: 'used', description: '8/256GB, holati: 88%, B/U', price: 6200000, image_url: 'https://picsum.photos/seed/s23used/400/400' },
  { cat: 'Samsung', name: 'Samsung Galaxy A55', condition: 'used', description: '8/256GB, holati: 87%, B/U', price: 3600000, image_url: 'https://picsum.photos/seed/a55used/400/400' },

  // ---------- Xiaomi — yangi ----------
  { cat: 'Xiaomi', name: 'Xiaomi 14T', condition: 'new', description: '12/256GB', price: 7200000, image_url: 'https://picsum.photos/seed/xiaomi14t/400/400' },
  { cat: 'Xiaomi', name: 'Xiaomi 13T', condition: 'new', description: '12/256GB', price: 5900000, image_url: 'https://picsum.photos/seed/xiaomi13t/400/400' },
  { cat: 'Xiaomi', name: 'Redmi Note 13 Pro', condition: 'new', description: '8/256GB', price: 3100000, image_url: 'https://picsum.photos/seed/redmi13/400/400' },
  // ---------- Xiaomi — ishlatilgan (B/U) ----------
  { cat: 'Xiaomi', name: 'Xiaomi 13T', condition: 'used', description: '12/256GB, holati: 88%, B/U', price: 4400000, image_url: 'https://picsum.photos/seed/xiaomi13tused/400/400' },
  { cat: 'Xiaomi', name: 'Redmi Note 13 Pro', condition: 'used', description: '8/256GB, holati: 87%, B/U', price: 2300000, image_url: 'https://picsum.photos/seed/redmi13used/400/400' },
  { cat: 'Xiaomi', name: 'Redmi Note 12', condition: 'used', description: '6/128GB, holati: 85%, B/U', price: 1900000, image_url: 'https://picsum.photos/seed/redmi12used/400/400' },
];

const insertProd = db.prepare(`
  INSERT INTO products (category_id, name, condition, description, price, image_url)
  VALUES (@category_id, @name, @condition, @description, @price, @image_url)
`);

const existingCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (existingCount === 0) {
  for (const p of products) {
    insertProd.run({
      category_id: catIds[p.cat],
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
