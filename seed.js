// seed.js — namunaviy kategoriya va mahsulotlarni bazaga qo'shadi
// Ishga tushirish: npm run seed

const db = require('./db');

const categories = ['Elektronika', "Kiyim-kechak", 'Uy jihozlari'];
const catIds = {};

const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
for (const name of categories) {
  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  catIds[name] = existing ? existing.id : insertCat.run(name).lastInsertRowid;
}

const products = [
  { cat: 'Elektronika', name: 'Simsiz quloqchin', description: 'Bluetooth 5.3, 30 soat batareya', price: 250000, image_url: 'https://picsum.photos/seed/headphones/400/400' },
  { cat: 'Elektronika', name: 'Quvvat banki 20000mAh', description: 'Tez zaryadlash, 2 ta USB port', price: 180000, image_url: 'https://picsum.photos/seed/powerbank/400/400' },
  { cat: 'Kiyim-kechak', name: 'Erkaklar futbolkasi', description: '100% paxta, S/M/L/XL', price: 90000, image_url: 'https://picsum.photos/seed/tshirt/400/400' },
  { cat: 'Kiyim-kechak', name: 'Ayollar sport krossovkasi', description: 'Yengil, nafas oluvchi mato', price: 320000, image_url: 'https://picsum.photos/seed/sneakers/400/400' },
  { cat: 'Uy jihozlari', name: 'Choy to\'plami (6 dona)', description: 'Keramika, sovg\'a qutisida', price: 150000, image_url: 'https://picsum.photos/seed/teaset/400/400' },
  { cat: 'Uy jihozlari', name: 'Aromatik shamlar (3 dona)', description: 'Lavanda, vanil, sandal hidlari', price: 75000, image_url: 'https://picsum.photos/seed/candles/400/400' },
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
  console.log(`${products.length} ta mahsulot qo'shildi.`);
} else {
  console.log('Mahsulotlar allaqachon mavjud, seed o\'tkazib yuborildi.');
}
