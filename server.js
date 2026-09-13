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
    INSERT INTO cart_items
