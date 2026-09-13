
Server · JS
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
require('./seed'); // baza bo'sh bo'lsa, namunaviy mahsulotlarni avtomatik qo'shadi
const { requireTelegramAuth } = require('./auth');
 
const app = express();
app.use(cors());
app.use(express.json());
 
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const auth = requireTelegramAuth(BOT_TOKEN);
 
function upsertUser(user) {
  db.prepare(`
    INSERT INTO users (telegram_id, first_name, username)
    VALUES (@id, @first_name, @username)
    ON CONFLICT(telegram_id) DO UPDATE SET first_name = @first_name, username = @username
  `).run({ id: user.id, first_name: user.first_name || '', username: user.username || '' });
}
 
// ---------- Mahsulotlar ----------
 
app.get('/api/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories').all());
});
 
app.get('/api/products', (req, res) => {
  const { category_id } = req.query;
  let rows;
  if (category_id) {
    rows = db.prepare('SELECT * FROM products WHERE is_active = 1 AND category_id = ?').all(category_id);
  } else {
    rows = db.prepare('SELECT * FROM products WHERE is_active = 1').all();
  }
  res.json(rows);
});
 
app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Mahsulot topilmadi' });
  res.json(row);
});
 
// ---------- Savatcha (auth talab qilinadi) ----------
 
app.get('/api/cart', auth, (req, res) => {
  upsertUser(req.telegramUser);
  const items = db.prepare(`
    SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url
    FROM cart_items ci JOIN products p ON p.id = ci.product_id
    WHERE ci.telegram_id = ?
  `).all(req.telegramUser.id);
  res.json(items);
});
 
app.post('/api/cart', auth, (req, res) => {
  upsertUser(req.telegramUser);
  const { product_id, quantity = 1 } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });
 
  db.prepare(`
    INSERT INTO cart_items (telegram_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON CONFLICT(telegram_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity
  `).run(req.telegramUser.id, product_id, quantity);
 
  res.status(201).json({ ok: true });
});
 
app.patch('/api/cart/:itemId', auth, (req, res) => {
  const { quantity } = req.body;
  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ? AND telegram_id = ?').run(req.params.itemId, req.telegramUser.id);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND telegram_id = ?')
      .run(quantity, req.params.itemId, req.telegramUser.id);
  }
  res.json({ ok: true });
});
 
app.delete('/api/cart/:itemId', auth, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE id = ? AND telegram_id = ?').run(req.params.itemId, req.telegramUser.id);
  res.json({ ok: true });
});
 
// ---------- Buyurtmalar ----------
 
app.post('/api/orders', auth, (req, res) => {
  upsertUser(req.telegramUser);
  const { address, phone } = req.body;
  const items = db.prepare(`
    SELECT ci.quantity, p.id AS product_id, p.name, p.price
    FROM cart_items ci JOIN products p ON p.id = ci.product_id
    WHERE ci.telegram_id = ?
  `).all(req.telegramUser.id);
 
  if (items.length === 0) return res.status(400).json({ error: 'Savatcha bo\'sh' });
 
  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
 
  const insertOrder = db.transaction(() => {
    const orderId = db.prepare(`
      INSERT INTO orders (telegram_id, total_price, address, phone)
      VALUES (?, ?, ?, ?)
    `).run(req.telegramUser.id, total, address || '', phone || '').lastInsertRowid;
 
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, name, price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const it of items) {
      insertItem.run(orderId, it.product_id, it.name, it.price, it.quantity);
    }
    db.prepare('DELETE FROM cart_items WHERE telegram_id = ?').run(req.telegramUser.id);
    return orderId;
  });
 
  const orderId = insertOrder();
  res.status(201).json({ order_id: orderId, total_price: total });
});
 
app.get('/api/orders', auth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE telegram_id = ? ORDER BY created_at DESC').all(req.telegramUser.id);
  res.json(orders);
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend http://localhost:${PORT} da ishlamoqda`));
 
// Bot ham shu server bilan birga ishga tushadi (alohida deploy shart emas)
const { startBot } = require('./bot');
startBot(process.env.BOT_TOKEN, process.env.WEBAPP_URL);
 
