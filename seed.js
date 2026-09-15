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
  // iPhone — yangi
  { cat: 'iPhone', name: 'iPhone 17 Pro Max', condition: 'new', description: '256GB, Neverlock', price: 18500000, image_url: 'https://picsum.photos/seed/iphone17pm/400/400' },
  { cat: 'iPhone', name: 'iPhone 17 Pro', condition: 'new', description: '256GB, Neverlock', price: 16200000, image_url: 'https://picsum.photos/seed/iphone17p/400/400' },
  { cat: 'iPhone', name: 'iPhone 17', condition: 'new', description: '128GB, Neverlock', price: 12800000, image_url: 'https://picsum.photos/seed/iphone17/400/400' },
  { cat: 'iPhone', name: 'iPhone 16 Pro Max', condition: 'new', description: '256GB, Neverlock', price: 15900000, image_url: 'https://picsum.photos/seed/iphone16pm/400/400' },
  { cat: 'iPhone', name: 'iPhone 16 Pro', condition: 'new', description: '128GB, Neverlock', price: 13600000, image_url: 'https://picsum.photos/seed/iphone16p/400/400' },
  { cat: 'iPhone', name: 'iPhone 16', condition: 'new', description: '128GB, Neverlock', price: 10900000, image_url: 'https://picsum.photos/seed/iphone16/400/400' },
  // iPhone — ishlatilgan (B/U)
  { cat: 'iPhone', name: 'iPhone 15 Pro', condition: 'used', description: '128GB, holati: 90%', price: 9800000, image_url: 'https://picsum.photos/seed/iphone15pused/400/400' },
  { cat: 'iPhone', name: 'iPhone 13', condition: 'used', description: '128GB, holati: 85%', price: 5900000, image_url: 'https://picsum.photos/seed/iphone13used/400/400' },
  // Samsung — yangi
  { cat: 'Samsung', name: 'Samsung Galaxy S24', condition: 'new', description: '8/256GB', price: 9800000, image_url: 'https://picsum.photos/seed/s24/400/400' },
  { cat: 'Samsung', name: 'Samsung Galaxy A55', condition: 'new', description: '8/256GB', price: 4600000, image_url: 'https://picsum.photos/seed/a55/400/400' },
  // Samsung — ishlatilgan
  { cat: 'Samsung', name: 'Samsung Galaxy S23', condition: 'used', description: '8/256GB, holati: 90%', price: 6200000, image_url: 'https://picsum.photos/seed/s23used/400/400' },
  // Xiaomi — yangi
  { cat: 'Xiaomi', name: 'Redmi Note 13 Pro', condition: 'new', description: '8/256GB', price: 3100000, image_url: 'https://picsum.photos/seed/redmi13/400/400' },
  { cat: 'Xiaomi', name: 'Xiaomi 13T', condition: 'new', description: '12/256GB', price: 5900000, image_url: 'https://picsum.photos/seed/xiaomi13t/400/400' },
  // Xiaomi — ishlatilgan
  { cat: 'Xiaomi', name: 'Redmi Note 12', condition: 'used', description: '6/128GB, holati: 88%', price: 1900000, image_url: 'https://picsum.photos/seed/redmi12used/400/400' },
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
