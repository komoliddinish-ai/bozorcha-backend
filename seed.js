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
  { cat: 'iPhone', name: 'iPhone 13 128GB', description: 'Qora, Neverlock', price: 7200000, image_url: 'https://picsum.photos/seed/iphone13/400/400' },
  { cat: 'iPhone', name: 'iPhone 15 128GB', description: 'Ko\'k, Neverlock', price: 12500000, image_url: 'https://picsum.photos/seed/iphone15/400/400' },
  { cat: 'Samsung', name: 'Samsung Galaxy A54', description: '8/256GB, Qora', price: 4200000, image_url: 'https://picsum.photos/seed/galaxya54/400/400' },
  { cat: 'Samsung', name: 'Samsung Galaxy S23', description: '8/256GB, Kulrang', price: 9800000, image_url: 'https://picsum.photos/seed/galaxys23/400/400' },
  { cat: 'Xiaomi', name: 'Redmi Note 13 Pro', description: '8/256GB, Ko\'k', price: 3100000, image_url: 'https://picsum.photos/seed/redmi13/400/400' },
  { cat: 'Xiaomi', name: 'Xiaomi 13T', description: '12/256GB, Qora', price: 5900000, image_url: 'https://picsum.photos/seed/xiaomi13t/400/400' },
];

const insertProd = db.prepare(`
  INSERT INTO products (category_id, name, description, price, image_url)
  VALUES (@category_id, @name, @description, @price, @image_url)
`);

const existingCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (existingCount === 0) {
  for (const p of products) {
    insertProd.run({
      category_id: catIds[p.cat],
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
    });
  }
  console.log(`${products.length} ta telefon qo'shildi.`);
} else {
  console.log('Mahsulotlar allaqachon mavjud, seed o\'tkazib yuborildi.');
}
