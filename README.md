# Fursat — Telegram Mini App (bo'lib to'lash do'koni)

Telefonlarni bo'lib to'lab sotish uchun Telegram mini app + bot + API (Node.js, Express, SQLite).

## Imkoniyatlar

**Mijoz uchun (mini app):** katalog (yangi / B/U, brend, qidiruv) → model → variant →
muddat (3–9 oy) va boshlang'ich to'lovni (30–80%) tanlash → ariza. "To'lovlarim",
call markaz, filiallar (xaritada ko'rish).

**Admin uchun:**
- Har bir yangi ariza bot orqali adminlarga (yoki guruhga) tugmalar bilan keladi:
  *Bog'lanildi / Tasdiqlash / Rad etish / +1 oy to'landi*.
- Mini app ichida **Admin panel** (faqat `ADMIN_IDS` dagilarga ko'rinadi):
  arizalar ro'yxati va holatlari, to'langan oylar, mahsulot qo'shish/tahrirlash/yashirish.
- Botda `/arizalar` — ko'rib chiqilmagan arizalar, `/id` — Telegram ID'ni bilish.
- Ariza holati o'zgarganda mijozga bot orqali xabar boradi.

## Railway sozlamalari (Variables)

| O'zgaruvchi | Misol | Izoh |
|---|---|---|
| `BOT_TOKEN` | `123:ABC...` | @BotFather bergan token |
| `WEBAPP_URL` | `https://...up.railway.app/` | Mini app manzili |
| `ADMIN_IDS` | `123456789,987654321` | Adminlarning Telegram ID'lari (botga `/id` yozing) |
| `ADMIN_CHAT_ID` | `-1001234567890` | *Ixtiyoriy.* Arizalar keladigan guruh ID'si |
| `DB_PATH` | `/data/shop.db` | **Muhim:** Volume ichidagi baza fayli |

### Ma'lumotlar yo'qolmasligi uchun Volume

Railway'da servis → **Settings → Volumes → New Volume**, Mount path: `/data`.
Keyin `DB_PATH=/data/shop.db` qo'ying. Volume'siz har deploy'da arizalar o'chib ketadi.

### Admin bo'lish

1. Botga `/start`, keyin `/id` yozing — ID'ingizni ko'rsatadi.
2. Uni `ADMIN_IDS` ga qo'shing.
3. Guruhga yuborilsin desangiz: botni guruhga qo'shing, guruhda `/id` yozing va
   "Shu chat ID"ni `ADMIN_CHAT_ID` ga qo'ying.

> Admin botga kamida bir marta `/start` bosgan bo'lishi kerak, aks holda Telegram
> botga unga xabar yuborishga ruxsat bermaydi.

## Mini app manzili

`index.html` ni server o'zi `/` manzilda beradi, ya'ni `WEBAPP_URL` sifatida
Railway manzilining o'zini qo'yish mumkin (alohida hosting shart emas).

## Lokal ishga tushirish

```bash
npm install
DEV_SKIP_AUTH=1 ADMIN_IDS=1 npm start
```
`DEV_SKIP_AUTH=1` faqat lokal sinov uchun — productionda **hech qachon** qo'ymang.

## Keyingi bosqich: 1C

Mijoz roziligidan so'ng `seed.js` dagi namuna mahsulotlar o'rniga 1C'dan
mahsulotlar (narx, qoldiq, rasm) sinxronlanadi. Bo'lib to'lash formulasi `config.js` da.
