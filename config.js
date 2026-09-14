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

module.exports = { TERM_OPTIONS, calcInstallment };
