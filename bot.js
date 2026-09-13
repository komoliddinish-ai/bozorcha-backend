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
    bot.sendMessage(msg.chat.id, "Bozorchaga xush kelibsiz! Xarid qilish uchun tugmani bosing 👇", {
      reply_markup: {
        inline_keyboard: [[
          { text: '🛍 Do\'konni ochish', web_app: { url: webAppUrl } }
        ]]
      }
    });
  });

  bot.setChatMenuButton({
    menu_button: { type: 'web_app', text: 'Do\'kon', web_app: { url: webAppUrl } }
  }).catch((e) => console.log('Menu tugmasini o\'rnatishda xato:', e.message));

  console.log('Telegram bot ishga tushdi (polling rejimida).');
}

module.exports = { startBot };
