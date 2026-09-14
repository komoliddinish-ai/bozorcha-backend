require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
require('./seed'); // baza bo'sh bo'lsa, namunaviy telefonlarni avtomatik qo'shadi
const { requireTelegramAuth } = require('./auth');
const { TERM_OPTIONS, calcInstallment } = require('./config');

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

// ---------- Bo'lib to'lash muddatlari ----------
// Frontend shu ro'yxatni ishlatib tugmalarni chizadi va oylik to'lovni hisoblaydi

app.get('/api/installment-terms', (req, res) => {
  res.json(TERM_OPTIONS);
});

// ---------- Arizalar ----------

app.post('/api/applications', auth, (req, res) => {
  upsertUser(req.telegramUser);
  const { product_id, term_months, customer_name, customer_phone } = req.body;

  if (!customer_name || !customer_phone) {
    return res.status(400).json({ error: 'Ism va telefon raqam kerak' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });

  const plan = calcInstallment(product.price, term_months);
  if (!plan) return res.status(400).json({ error: 'Muddat noto\'g\'ri' });

  const result = db.prepare(`
    INSERT INTO applications
      (telegram_id, customer_name, customer_phone, product_id, product_name, base_price, term_months, monthly_payment, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.telegramUser.id, customer_name, customer_phone,
    product.id, product.name, product.price,
    plan.months, plan.monthly_payment, plan.total_price
  );

  res.status(201).json({ application_id: result.lastInsertRowid, ...plan });
});

app.get('/api/applications', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM applications WHERE telegram_id = ? ORDER BY created_at DESC').all(req.telegramUser.id);
  res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend http://localhost:${PORT} da ishlamoqda`));

// Bot ham shu server bilan birga ishga tushadi (alohida deploy shart emas)
const { startBot } = require('./bot');
startBot(process.env.BOT_TOKEN, process.env.WEBAPP_URL);
