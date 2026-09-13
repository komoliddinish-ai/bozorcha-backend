// auth.js — Telegram Mini App'dan kelgan initData'ni tekshirish
//
// Nima uchun kerak: mini app frontend'i Telegram ichida ochiladi va har bir
// foydalanuvchi haqida ma'lumotni (id, ism) window.Telegram.WebApp.initData
// orqali oladi. Lekin bu ma'lumotni brauzerdan kelayotgani uchun ISHONIB
// bo'LMAYDI — istalgan odam uni o'zgartirib, boshqa foydalanuvchi nomidan
// so'rov yuborishi mumkin. Shuning uchun har bir so'rovda initData botning
// maxfiy tokeni bilan HMAC-imzosi orqali tekshiriladi (Telegram hujjatida
// tavsiya qilingan usul).

const crypto = require('crypto');

function validateInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckArr = [];
  for (const [key, value] of [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    dataCheckArr.push(`${key}=${value}`);
  }
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) return null;

  const userJson = params.get('user');
  if (!userJson) return null;

  // 24 soatdan eski initData'ni rad etamiz (auth_date tekshiruvi)
  const authDate = Number(params.get('auth_date') || 0);
  const ageSeconds = Date.now() / 1000 - authDate;
  if (ageSeconds > 86400) return null;

  return JSON.parse(userJson); // { id, first_name, username, ... }
}

// Express middleware: Authorization header'dan "tma <initData>" formatini kutadi
function requireTelegramAuth(botToken) {
  return (req, res, next) => {
    const header = req.headers['authorization'] || '';
    const initData = header.startsWith('tma ') ? header.slice(4) : null;

    // Lokal development uchun: token o'rnatilmagan bo'lsa, tekshiruvni o'tkazib
    // yuborish (faqat DEV_SKIP_AUTH=1 bo'lsa). Productionda buni o'chirib qo'ying.
    if (process.env.DEV_SKIP_AUTH === '1') {
      req.telegramUser = { id: Number(req.headers['x-dev-user-id'] || 1), first_name: 'Dev' };
      return next();
    }

    if (!initData) return res.status(401).json({ error: 'initData topilmadi' });

    const user = validateInitData(initData, botToken);
    if (!user) return res.status(401).json({ error: 'initData yaroqsiz' });

    req.telegramUser = user;
    next();
  };
}

module.exports = { validateInitData, requireTelegramAuth };
