// bot.js — Telegram bot: /start bosilganda do'kon tugmasini yuboradi
// Bu fayl server.js orqali avtomatik ishga tushadi (alohida deploy shart emas).

const TelegramBot = require('node-telegram-bot-api');

function startBot(botToken, webAppUrl) {
  if (!botToken || !webAppUrl) {
    console.log('BOT_TOKEN yoki WEBAPP_URL yo\'q — bot ishga tushmadi (faqat API ishlaydi).');
    return;
  }

  const bot = new TelegramBot(botToken, { polling: true });

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Fursat'ga xush kelibsiz! Telefonlarni bo'lib to'lab sotib olish uchun tugmani bosing 👇", {
      reply_markup: {
        inline_keyboard: [[
          { text: '📱 Katalogni ochish', web_app: { url: webAppUrl } }
        ]]
      }
    });
  });

  bot.setChatMenuButton({
    menu_button: { type: 'web_app', text: 'Katalog', web_app: { url: webAppUrl } }
  }).catch((e) => console.log('Menu tugmasini o\'rnatishda xato:', e.message));

  console.log('Telegram bot ishga tushdi (polling rejimida).');
}

module.exports = { startBot };
