// applications.js — arizalar bilan ishlash (server va bot birgalikda ishlatadi)

const db = require('./db');

const STATUSES = ['new', 'contacted', 'approved', 'rejected'];
const STATUS_LABELS = {
  new: '🆕 Yangi',
  contacted: "📞 Bog'lanildi",
  approved: '✅ Tasdiqlandi',
  rejected: '❌ Rad etildi',
};

function getApplication(id) {
  return db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
}

function setStatus(id, status) {
  if (!STATUSES.includes(status)) return null;
  db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, id);
  return getApplication(id);
}

// delta: +1 (bir oylik to'lov qabul qilindi) yoki -1 (xato belgilangan bo'lsa)
function changePaid(id, delta) {
  const app = getApplication(id);
  if (!app) return null;
  const paid = Math.min(app.term_months, Math.max(0, app.paid_installments + delta));
  db.prepare('UPDATE applications SET paid_installments = ? WHERE id = ?').run(paid, id);
  return getApplication(id);
}

// "+998 90 123 45 67" ko'rinishiga keltiradi; noto'g'ri raqam bo'lsa null
function normalizePhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 9) digits = '998' + digits;
  if (digits.length !== 12 || !digits.startsWith('998')) return null;
  return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
}

function money(v) {
  return Number(v).toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Telegram xabari uchun (parse_mode: HTML)
function formatForAdmin(app, user) {
  const lines = [
    `<b>Ariza #${app.id}</b> · ${STATUS_LABELS[app.status] || app.status}`,
    '',
    `👤 ${escapeHtml(app.customer_name)}`,
    `📱 ${escapeHtml(app.customer_phone)}`,
  ];
  if (user?.username) lines.push(`💬 @${escapeHtml(user.username)}`);
  lines.push(
    '',
    `📦 ${escapeHtml(app.product_name)}`,
    `💵 Naqd narxi: ${money(app.base_price)}`,
    `⬇️ Boshlang'ich: ${money(app.down_payment)}`,
    `🗓 ${app.term_months} oy × ${money(app.monthly_payment)}`,
    `Σ Jami: ${money(app.total_price)}`,
  );
  if (app.status === 'approved') {
    lines.push('', `To'langan: ${app.paid_installments}/${app.term_months} oy`);
  }
  return lines.join('\n');
}

// Xabar ostidagi tugmalar — holatga qarab o'zgaradi
function adminKeyboard(app) {
  const rows = [];
  if (app.status === 'new') {
    rows.push([{ text: "📞 Bog'lanildi", callback_data: `st:${app.id}:contacted` }]);
  }
  if (app.status === 'new' || app.status === 'contacted') {
    rows.push([
      { text: '✅ Tasdiqlash', callback_data: `st:${app.id}:approved` },
      { text: '❌ Rad etish', callback_data: `st:${app.id}:rejected` },
    ]);
  }
  if (app.status === 'approved' && app.paid_installments < app.term_months) {
    rows.push([{ text: "💳 +1 oy to'landi", callback_data: `pay:${app.id}:1` }]);
  }
  return { inline_keyboard: rows };
}

module.exports = {
  STATUSES, STATUS_LABELS, getApplication, setStatus, changePaid,
  normalizePhone, formatForAdmin, adminKeyboard, escapeHtml,
};
