// config.js — bo'lib to'lash shartlari
//
// DIQQAT: bu yerdagi foizlar NAMUNA sifatida qo'yilgan (o'ylab topilgan,
// haqiqiy moliyaviy hisob-kitob emas). Haqiqiy ustama foizlaringizni
// aytsangiz, shu yerga to'g'ri qiymatlarni qo'yib beraman.
//
// markup: muddat uzayganda narxga qo'shiladigan ustama (masalan 0.18 = 18%)

const TERM_OPTIONS = [
  { months: 3, markup: 0.05 },
  { months: 6, markup: 0.10 },
  { months: 12, markup: 0.18 },
  { months: 24, markup: 0.30 },
];

function calcInstallment(basePrice, months) {
  const term = TERM_OPTIONS.find(t => t.months === Number(months));
  if (!term) return null;
  const total = Math.round(basePrice * (1 + term.markup));
  const monthly = Math.round(total / term.months);
  return { months: term.months, markup: term.markup, total_price: total, monthly_payment: monthly };
}

// ---------- Call markaz va filiallar ----------
// DIQQAT: bular ham NAMUNA. Haqiqiy raqam/manzillaringizni ayting — shu
// yerga to'g'rilab qo'yaman.

const CALL_CENTER = [
  { label: 'Call markaz', phone: '+998712000000' },
  { label: "Qo'llab-quvvatlash", phone: '+998712000001' },
];

const BRANCHES = [
  { name: 'Chilonzor filiali', address: "Toshkent, Chilonzor tumani, Bunyodkor ko'chasi 12", phone: '+998712000010' },
  { name: 'Yunusobod filiali', address: 'Toshkent, Yunusobod tumani, Amir Temur shoh ko\'chasi 45', phone: '+998712000020' },
];

module.exports = { TERM_OPTIONS, calcInstallment, CALL_CENTER, BRANCHES };
