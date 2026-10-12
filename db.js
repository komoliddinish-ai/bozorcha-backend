// db.js — SQLite ulanishi va jadval sxemasi
// SQLite tanlandi, chunki kichik/o'rta do'kon uchun alohida server kerak emas —
// ma'lumotlar bitta faylda saqlanadi. Katta yuk kutilsa, keyinchalik
// Postgres'ga o'tish oson (so'rovlar deyarli standart SQL).
//
// MUHIM (Railway): konteyner diski har deploy'da tozalanadi. Ma'lumotlar
// yo'qolmasligi uchun Railway'da Volume yarating (masalan /data ga ulang)
// va DB_PATH=/data/shop.db o'zgaruvchisini qo'ying.

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'shop.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    telegram_id   INTEGER PRIMARY KEY,
    first_name    TEXT,
    username      TEXT,
    created_at    TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id   INTEGER REFERENCES categories(id),
    model_group   TEXT NOT NULL,        -- model nomi (masalan "iPhone 17 Pro Max") — variantlarni guruhlaydi
    name          TEXT NOT NULL,        -- to'liq nom, variant bilan (masalan "iPhone 17 Pro Max 256GB Qora")
    description   TEXT,
    condition     TEXT NOT NULL DEFAULT 'new',  -- 'new' (yangi) yoki 'used' (ishlatilgan)
    price         INTEGER NOT NULL,      -- so'mda butun son sifatida
    image_url     TEXT,
    stock         INTEGER DEFAULT 100,
    is_active     INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS applications (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id       INTEGER NOT NULL,
    customer_name     TEXT NOT NULL,
    customer_phone    TEXT NOT NULL,
    product_id        INTEGER NOT NULL,
    product_name      TEXT NOT NULL,        -- ariza vaqtidagi nom (tarix uchun)
    base_price        INTEGER NOT NULL,     -- naqd narxi
    down_payment      INTEGER NOT NULL,     -- boshlang'ich to'lov (kamida 30%)
    term_months       INTEGER NOT NULL,
    monthly_payment   INTEGER NOT NULL,
    total_price       INTEGER NOT NULL,
    paid_installments INTEGER DEFAULT 0,    -- nechta oylik to'lov qilingan (admin belgilaydi)
    is_demo           INTEGER DEFAULT 0,    -- eski versiyadan qolgan ustun, endi ishlatilmaydi
    status            TEXT DEFAULT 'new',   -- new -> contacted -> approved | rejected
    created_at        TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Eski versiyada barcha foydalanuvchilarga ko'rinadigan "Namuna mijoz" arizasi
// qo'shilardi — haqiqiy mijozlarni chalg'itmasligi uchun o'chiramiz.
db.prepare('DELETE FROM applications WHERE is_demo = 1').run();

module.exports = db;
