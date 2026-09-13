// db.js — SQLite ulanishi va jadval sxemasi
// SQLite tanlandi, chunki kichik/o'rta do'kon uchun alohida server kerak emas —
// ma'lumotlar bitta faylda (shop.db) saqlanadi. Katta yuk kutilsa, keyinchalik
// Postgres'ga o'tish oson (so'rovlar deyarli standart SQL).

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'shop.db'));
db.pragma('journal_mode = WAL');

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
    name          TEXT NOT NULL,
    description   TEXT,
    price         INTEGER NOT NULL,      -- tiyin/so'mda butun son sifatida
    image_url     TEXT,
    stock         INTEGER DEFAULT 100,
    is_active     INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id   INTEGER NOT NULL,
    product_id    INTEGER NOT NULL REFERENCES products(id),
    quantity      INTEGER NOT NULL DEFAULT 1,
    UNIQUE(telegram_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id   INTEGER NOT NULL,
    total_price   INTEGER NOT NULL,
    status        TEXT DEFAULT 'new',    -- new -> confirmed -> shipped -> done
    address       TEXT,
    phone         TEXT,
    created_at    TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id      INTEGER NOT NULL REFERENCES orders(id),
    product_id    INTEGER NOT NULL,
    name          TEXT NOT NULL,          -- buyurtma vaqtidagi nom (tarix uchun)
    price         INTEGER NOT NULL,       -- buyurtma vaqtidagi narx
    quantity      INTEGER NOT NULL
  );
`);

module.exports = db;
