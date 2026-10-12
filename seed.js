// seed.js — namunaviy telefon brendlari, modellari va variantlarini bazaga qo'shadi
// DIQQAT: bu NAMUNA ma'lumotlar. 1C bazasiga ulanganimizda, bu o'rniga
// haqiqiy mahsulotlar (rasmlari bilan birga) avtomatik olib kelinadi.
//
// model_group — bir xil modelning turli variantlarini (xotira/rang) birlashtiradi.
// Ishga tushirish: npm run seed (yoki server ishga tushganda avtomatik)

const db = require('./db');

// ---------- Rasm generatori ----------
// Haqiqiy telefon fotolarini ishlatmayapmiz, chunki ular Apple/Samsung/Xiaomi'ning
// mualliflik huquqi bilan himoyalangan rasmiy suratlari. Buning o'rniga har bir
// mahsulot uchun uning rangiga mos, oddiy va toza ikonka-rasm yaratamiz.
// 1C bazasiga ulanganimizda, bu o'rniga haqiqiy fotolar keladi.
function phoneImage(color) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#EEF4F1'/><stop offset='1' stop-color='#DCE8E2'/>
      </linearGradient>
      <linearGradient id='gl' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#fff' stop-opacity='.55'/><stop offset='.5' stop-color='#fff' stop-opacity='0'/>
      </linearGradient>
    </defs>
    <rect width='240' height='240' fill='url(#bg)'/>
    <ellipse cx='120' cy='212' rx='46' ry='6' fill='#000' opacity='.08'/>
    <rect x='80' y='28' width='80' height='178' rx='18' fill='${color}'/>
    <rect x='86' y='34' width='68' height='166' rx='13' fill='#0E1512'/>
    <rect x='86' y='34' width='68' height='166' rx='13' fill='url(#gl)'/>
    <rect x='108' y='41' width='24' height='7' rx='3.5' fill='${color}'/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function colorFor(description, name, cat) {
  const text = `${description || ''} ${name}`;
  if (text.includes('Kumush')) return '#D8D8D8';
  if (text.includes('Qora')) return '#141414';
  if (text.includes("Ko'k")) return '#2F5D9E';
  if (cat === 'iPhone') return '#1C1C1E';
  if (cat === 'Samsung') return '#2B2F36';
  return '#20232A'; // Xiaomi va boshqalar
}

const categories = ['iPhone', 'Samsung', 'Xiaomi'];
const catIds = {};

const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
for (const name of categories) {
  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  catIds[name] = existing ? existing.id : insertCat.run(name).lastInsertRowid;
}

const products = [
  // ---------- iPhone — yangi ----------
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Kumush', condition: 'new', description: '256GB, Kumush, Neverlock', price: 18500000 },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Qora', condition: 'new', description: '256GB, Qora, Neverlock', price: 18700000 },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 512GB Qora', condition: 'new', description: '512GB, Qora, Neverlock', price: 21200000 },
  { cat: 'iPhone', group: 'iPhone 17 Pro', name: 'iPhone 17 Pro 256GB', condition: 'new', description: '256GB, Neverlock', price: 16200000 },
  { cat: 'iPhone', group: 'iPhone 17', name: 'iPhone 17 128GB', condition: 'new', description: '128GB, Neverlock', price: 12800000 },
  { cat: 'iPhone', group: 'iPhone 16 Pro Max', name: 'iPhone 16 Pro Max 256GB', condition: 'new', description: '256GB, Neverlock', price: 15900000 },
  { cat: 'iPhone', group: 'iPhone 16 Pro', name: 'iPhone 16 Pro 128GB', condition: 'new', description: '128GB, Neverlock', price: 13600000 },
  { cat: 'iPhone', group: 'iPhone 16', name: 'iPhone 16 128GB', condition: 'new', description: '128GB, Neverlock', price: 10900000 },

  // ---------- iPhone — ishlatilgan (B/U) ----------
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Kumush, B/U', condition: 'used', description: "256GB, Kumush, holati: 92%, B/U", price: 15200000 },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 256GB Qora, B/U', condition: 'used', description: "256GB, Qora, holati: 90%, B/U", price: 15000000 },
  { cat: 'iPhone', group: 'iPhone 17 Pro Max', name: 'iPhone 17 Pro Max 512GB Qora, B/U', condition: 'used', description: "512GB, Qora, holati: 88%, B/U", price: 17400000 },
  { cat: 'iPhone', group: 'iPhone 17 Pro', name: 'iPhone 17 Pro 256GB, B/U', condition: 'used', description: "256GB, holati: 90%, B/U", price: 13300000 },
  { cat: 'iPhone', group: 'iPhone 17', name: 'iPhone 17 128GB, B/U', condition: 'used', description: "128GB, holati: 90%, B/U", price: 10500000 },
  { cat: 'iPhone', group: 'iPhone 16 Pro Max', name: 'iPhone 16 Pro Max 256GB, B/U', condition: 'used', description: "256GB, holati: 88%, B/U", price: 13000000 },
  { cat: 'iPhone', group: 'iPhone 16 Pro', name: 'iPhone 16 Pro 128GB, B/U', condition: 'used', description: "128GB, holati: 88%, B/U", price: 11100000 },
  { cat: 'iPhone', group: 'iPhone 16', name: 'iPhone 16 128GB, B/U', condition: 'used', description: "128GB, holati: 87%, B/U", price: 8900000 },
  { cat: 'iPhone', group: 'iPhone 15 Pro', name: 'iPhone 15 Pro 128GB, B/U', condition: 'used', description: '128GB, holati: 90%, B/U', price: 9800000 },
  { cat: 'iPhone', group: 'iPhone 13', name: 'iPhone 13 128GB, B/U', condition: 'used', description: '128GB, holati: 85%, B/U', price: 5900000 },

  // ---------- Samsung — yangi ----------
  { cat: 'Samsung', group: 'Samsung Galaxy S24 Ultra', name: 'Galaxy S24 Ultra 12/256GB', condition: 'new', description: '12/256GB', price: 12800000 },
  { cat: 'Samsung', group: 'Samsung Galaxy S24 Ultra', name: 'Galaxy S24 Ultra 12/512GB', condition: 'new', description: '12/512GB', price: 14200000 },
  { cat: 'Samsung', group: 'Samsung Galaxy S24', name: 'Galaxy S24 8/256GB', condition: 'new', description: '8/256GB', price: 9800000 },
  { cat: 'Samsung', group: 'Samsung Galaxy A55', name: 'Galaxy A55 8/256GB', condition: 'new', description: '8/256GB', price: 4600000 },
  // ---------- Samsung — ishlatilgan (B/U) ----------
  { cat: 'Samsung', group: 'Samsung Galaxy S24 Ultra', name: 'Galaxy S24 Ultra 12/256GB, B/U', condition: 'used', description: '12/256GB, holati: 90%, B/U', price: 10200000 },
  { cat: 'Samsung', group: 'Samsung Galaxy S24', name: 'Galaxy S24 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 90%, B/U', price: 7800000 },
  { cat: 'Samsung', group: 'Samsung Galaxy S23', name: 'Galaxy S23 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 88%, B/U', price: 6200000 },
  { cat: 'Samsung', group: 'Samsung Galaxy A55', name: 'Galaxy A55 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 87%, B/U', price: 3600000 },

  // ---------- Xiaomi — yangi ----------
  { cat: 'Xiaomi', group: 'Xiaomi 14T', name: 'Xiaomi 14T 12/256GB', condition: 'new', description: '12/256GB', price: 7200000 },
  { cat: 'Xiaomi', group: 'Xiaomi 13T', name: 'Xiaomi 13T 12/256GB', condition: 'new', description: '12/256GB', price: 5900000 },
  { cat: 'Xiaomi', group: 'Redmi Note 13 Pro', name: 'Redmi Note 13 Pro 8/256GB', condition: 'new', description: '8/256GB', price: 3100000 },
  // ---------- Xiaomi — ishlatilgan (B/U) ----------
  { cat: 'Xiaomi', group: 'Xiaomi 13T', name: 'Xiaomi 13T 12/256GB, B/U', condition: 'used', description: '12/256GB, holati: 88%, B/U', price: 4400000 },
  { cat: 'Xiaomi', group: 'Redmi Note 13 Pro', name: 'Redmi Note 13 Pro 8/256GB, B/U', condition: 'used', description: '8/256GB, holati: 87%, B/U', price: 2300000 },
  { cat: 'Xiaomi', group: 'Redmi Note 12', name: 'Redmi Note 12 6/128GB, B/U', condition: 'used', description: '6/128GB, holati: 85%, B/U', price: 1900000 },
];

const insertProd = db.prepare(`
  INSERT INTO products (category_id, model_group, name, condition, description, price, image_url)
  VALUES (@category_id, @model_group, @name, @condition, @description, @price, @image_url)
`);

const existingCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (existingCount === 0) {
  for (const p of products) {
    const color = colorFor(p.description, p.name, p.cat);
    insertProd.run({
      category_id: catIds[p.cat],
      model_group: p.group,
      name: p.name,
      condition: p.condition,
      description: p.description,
      price: p.price,
      image_url: phoneImage(color),
    });
  }
  console.log(`${products.length} ta telefon qo'shildi.`);
} else {
  console.log('Mahsulotlar allaqachon mavjud, seed o\'tkazib yuborildi.');
}
