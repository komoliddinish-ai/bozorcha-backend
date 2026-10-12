// bot.js — Telegram bot
//  • /start — do'kon tugmasini yuboradi
//  • /id    — foydalanuvchi va chat ID'sini ko'rsatadi (ADMIN_IDS / ADMIN_CHAT_ID sozlash uchun)
//  • /arizalar — (faqat adminlar) ko'rib chiqilmagan arizalar
//  • yangi ariza kelganda adminlarga tugmali xabar yuboradi
// Bu fayl server.js orqali avtomatik ishga tushadi (alohida deploy shart emas).

const TelegramBot = require('node-telegram-bot-api');
const db = require('./db');
const { ADMIN_IDS, ADMIN_CHAT_ID, isAdmin } = require('./config');
const { getApplication, setStatus, changePaid, formatForAdmin, adminKeyboard } = require('./applications');

let bot = null;

function startBot(botToken, webAppUrl) {
  if (!botToken || !webAppUrl) {
    console.log('BOT_TOKEN yoki WEBAPP_URL yo\'q — bot ishga tushmadi (faqat API ishlaydi).');
    return;
  }

  bot = new TelegramBot(botToken, { polling: true });

  bot.onText(/^\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Fursat'ga xush kelibsiz! Telefonlarni bo'lib to'lab sotib olish uchun tugmani bosing 👇", {
      reply_markup: {
        inline_keyboard: [[
          { text: '📱 Katalogni ochish', web_app: { url: webAppUrl } }
        ]]
      }
    });
  });

  bot.onText(/^\/id/, (msg) => {
    bot.sendMessage(msg.chat.id, `Sizning ID: <code>${msg.from.id}</code>\nShu chat ID: <code>${msg.chat.id}</code>`, { parse_mode: 'HTML' });
  });

  bot.onText(/^\/arizalar/, (msg) => {
    if (!isAdmin(msg.from.id)) return;
    const rows = db.prepare("SELECT * FROM applications WHERE status IN ('new','contacted') ORDER BY id DESC LIMIT 10").all();
    if (rows.length === 0) {
      bot.sendMessage(msg.chat.id, "Ko'rib chiqilmagan ariza yo'q 👌");
      return;
    }
    for (const app of rows.reverse()) {
      bot.sendMessage(msg.chat.id, formatForAdmin(app), { parse_mode: 'HTML', reply_markup: adminKeyboard(app) });
    }
  });

  // Admin xabaridagi tugmalar bosilganda
  bot.on('callback_query', async (q) => {
    if (!isAdmin(q.from.id)) {
      return bot.answerCallbackQuery(q.id, { text: "Sizda ruxsat yo'q", show_alert: true });
    }
    const [kind, idStr, value] = String(q.data || '').split(':');
    const id = Number(idStr);
    let app = null;
    if (kind === 'st') app = setStatus(id, value);
    else if (kind === 'pay') app = changePaid(id, Number(value));

    if (!app) return bot.answerCallbackQuery(q.id, { text: 'Ariza topilmadi' });

    await bot.answerCallbackQuery(q.id, { text: 'Saqlandi' });
    if (kind === 'st') notifyCustomer(app);
    bot.editMessageText(formatForAdmin(app), {
      chat_id: q.message.chat.id,
      message_id: q.message.message_id,
      parse_mode: 'HTML',
      reply_markup: adminKeyboard(app),
    }).catch(() => {});
  });

  bot.setChatMenuButton({
    menu_button: { type: 'web_app', text: 'Katalog', web_app: { url: webAppUrl } }
  }).catch((e) => console.log('Menu tugmasini o\'rnatishda xato:', e.message));

  bot.on('polling_error', (e) => console.log('Bot polling xatosi:', e.code || e.message));

  if (!ADMIN_CHAT_ID && ADMIN_IDS.length === 0) {
    console.log('DIQQAT: ADMIN_IDS ham, ADMIN_CHAT_ID ham berilmagan — yangi arizalar hech kimga yuborilmaydi.');
  }
  console.log('Telegram bot ishga tushdi (polling rejimida).');
}

// Yangi ariza haqida adminlarga xabar
async function notifyNewApplication(appId, user) {
  if (!bot) return;
  const app = getApplication(appId);
  if (!app) return;
  const targets = ADMIN_CHAT_ID ? [ADMIN_CHAT_ID] : ADMIN_IDS;
  for (const chatId of targets) {
    try {
      await bot.sendMessage(chatId, formatForAdmin(app, user), { parse_mode: 'HTML', reply_markup: adminKeyboard(app) });
    } catch (e) {
      // Ko'p uchraydigan sabab: admin botga hali /start bosmagan
      console.log(`Adminga (${chatId}) xabar yuborilmadi:`, e.message);
    }
  }
}

// Mijozga holat o'zgargani haqida xabar (mijoz botga /start bosgan bo'lsa yetib boradi)
async function notifyCustomer(app) {
  if (!bot) return;
  const texts = {
    contacted: `Arizangiz (#${app.id}) bo'yicha operatorimiz siz bilan bog'landi.`,
    approved: `🎉 Arizangiz (#${app.id}) tasdiqlandi! ${app.product_name} — ${app.term_months} oyga.`,
    rejected: `Afsuski, arizangiz (#${app.id}) tasdiqlanmadi. Savollar bo'lsa, call markazga qo'ng'iroq qiling.`,
  };
  const text = texts[app.status];
  if (!text) return;
  bot.sendMessage(app.telegram_id, text).catch(() => {});
}

module.exports = { startBot, notifyNewApplication, notifyCustomer };
