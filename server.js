require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');
require('./seed'); // baza bo'sh bo'lsa, namunaviy telefonlarni avtomatik qo'shadi
const { requireTelegramAuth } = require('./auth');
const { TERM_OPTIONS, calcInstallment, CALL_CENTER, BRANCHES, isAdmin } = require('./config');
const { STATUSES, setStatus, changePaid, normalizePhone } = require('./applications');
const { startBot, notifyNewApplication, notifyCustomer } = require('./bot');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const auth = requireTelegramAuth(BOT_TOKEN);

function requireAdmin(req, res, next) {
  if (!isAdmin(req.telegramUser?.id)) return res.status(403).json({ error: "Ruxsat yo'q" });
  next();
}

function upsertUser(user) {
  db.prepare(`
    INSERT INTO users (telegram_id, first_name, username)
    VALUES (@id, @first_name, @username)
    ON CONFLICT(telegram_id) DO UPDATE SET first_name = @first_name, username = @username
  `).run({ id: user.id, first_name: user.first_name || '', username: user.username || '' });
}

// Mini app'ni shu serverning o'zidan ham ochish mumkin: https://<server>/
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ---------- Mahsulotlar ----------

app.get('/api/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY id').all());
});

app.get('/api/products', (req, res) => {
  const { category_id, condition } = req.query;
  const clauses = ['is_active = 1'];
  const params = [];
  if (category_id) { clauses.push('category_id = ?'); params.push(category_id); }
  if (condition) { clauses.push('condition = ?'); params.push(condition); }
  const rows = db.prepare(`SELECT * FROM products WHERE ${clauses.join(' AND ')} ORDER BY price DESC`).all(...params);
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

// ---------- Call markaz va filiallar ----------

app.get('/api/call-center', (req, res) => {
  res.json(CALL_CENTER);
});

app.get('/api/branches', (req, res) => {
  res.json(BRANCHES);
});

// ---------- Foydalanuvchi ----------

app.get('/api/me', auth, (req, res) => {
  res.json({ id: req.telegramUser.id, first_name: req.telegramUser.first_name, is_admin: isAdmin(req.telegramUser.id) });
});

// ---------- Arizalar ----------

const MAX_APPLICATIONS_PER_DAY = 5;

app.post('/api/applications', auth, (req, res) => {
  upsertUser(req.telegramUser);
  const { product_id, term_months, down_payment } = req.body;
  const customer_name = String(req.body.customer_name || '').trim().slice(0, 100);
  const customer_phone = normalizePhone(req.body.customer_phone);

  if (!customer_name) return res.status(400).json({ error: 'Ismingizni kiriting' });
  if (!customer_phone) return res.status(400).json({ error: "Telefon raqam noto'g'ri. Masalan: +998 90 123 45 67" });

  const recent = db.prepare(
    "SELECT COUNT(*) AS c FROM applications WHERE telegram_id = ? AND created_at > datetime('now', '-1 day')"
  ).get(req.telegramUser.id).c;
  if (recent >= MAX_APPLICATIONS_PER_DAY) {
    return res.status(429).json({ error: "Bugun juda ko'p ariza yubordingiz. Operatorimiz siz bilan bog'lanadi." });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(product_id);
  if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });

  const plan = calcInstallment(product.price, term_months, down_payment);
  if (!plan) return res.status(400).json({ error: "Muddat yoki boshlang'ich to'lov noto'g'ri" });

  const result = db.prepare(`
    INSERT INTO applications
      (telegram_id, customer_name, customer_phone, product_id, product_name, base_price, down_payment, term_months, monthly_payment, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.telegramUser.id, customer_name, customer_phone,
    product.id, product.name, product.price, plan.down_payment,
    plan.months, plan.monthly_payment, plan.total_price
  );

  notifyNewApplication(result.lastInsertRowid, req.telegramUser);
  res.status(201).json({ application_id: result.lastInsertRowid, ...plan });
});

app.get('/api/applications', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM applications WHERE telegram_id = ? ORDER BY id DESC').all(req.telegramUser.id);
  res.json(rows);
});

// ---------- Admin ----------

app.get('/api/admin/applications', auth, requireAdmin, (req, res) => {
  const { status } = req.query;
  const rows = STATUSES.includes(status)
    ? db.prepare('SELECT * FROM applications WHERE status = ? ORDER BY id DESC LIMIT 200').all(status)
    : db.prepare('SELECT * FROM applications ORDER BY id DESC LIMIT 200').all();
  res.json(rows);
});

app.patch('/api/admin/applications/:id', auth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  let row = null;
  if (req.body.status !== undefined) {
    row = setStatus(id, req.body.status);
    if (row) notifyCustomer(row);
  }
  if (req.body.paid_delta !== undefined) row = changePaid(id, Number(req.body.paid_delta) > 0 ? 1 : -1);
  if (!row) return res.status(400).json({ error: "Ariza topilmadi yoki qiymat noto'g'ri" });
  res.json(row);
});

app.get('/api/admin/products', auth, requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY category_id, model_group, price').all());
});

const PRODUCT_FIELDS = ['category_id', 'model_group', 'name', 'description', 'condition', 'price', 'image_url', 'stock', 'is_active'];

function cleanProduct(body) {
  const out = {};
  for (const f of PRODUCT_FIELDS) if (body[f] !== undefined) out[f] = body[f];
  if (out.price !== undefined) out.price = Math.round(Number(out.price));
  if (out.price !== undefined && !(out.price > 0)) return { error: "Narx noto'g'ri" };
  if (out.condition !== undefined && !['new', 'used'].includes(out.condition)) return { error: "Holat noto'g'ri" };
  if (out.is_active !== undefined) out.is_active = out.is_active ? 1 : 0;
  for (const f of ['name', 'model_group', 'description']) if (out[f] !== undefined) out[f] = String(out[f]).trim();
  return { data: out };
}

app.post('/api/admin/products', auth, requireAdmin, (req, res) => {
  const { data, error } = cleanProduct(req.body);
  if (error) return res.status(400).json({ error });
  if (!data.name || !data.model_group || !data.price || !data.category_id) {
    return res.status(400).json({ error: 'Nomi, modeli, brendi va narxi majburiy' });
  }
  const cols = Object.keys(data);
  const result = db.prepare(
    `INSERT INTO products (${cols.join(', ')}) VALUES (${cols.map(c => '@' + c).join(', ')})`
  ).run(data);
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid));
});

app.patch('/api/admin/products/:id', auth, requireAdmin, (req, res) => {
  const { data, error } = cleanProduct(req.body);
  if (error) return res.status(400).json({ error });
  const cols = Object.keys(data);
  if (cols.length === 0) return res.status(400).json({ error: "O'zgarish yo'q" });
  const result = db.prepare(
    `UPDATE products SET ${cols.map(c => `${c} = @${c}`).join(', ')} WHERE id = @id`
  ).run({ ...data, id: Number(req.params.id) });
  if (result.changes === 0) return res.status(404).json({ error: 'Mahsulot topilmadi' });
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

// Kutilmagan xatolar — server yiqilmasin, foydalanuvchiga tushunarli javob qaytsin
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Serverda xatolik. Birozdan so'ng qayta urinib ko'ring." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend http://localhost:${PORT} da ishlamoqda`));

// Bot ham shu server bilan birga ishga tushadi (alohida deploy shart emas)
startBot(process.env.BOT_TOKEN, process.env.WEBAPP_URL);
