// config.js — bo'lib to'lash shartlari
// Manba: foydalanuvchi bergan "Hisoblash_2026_yangi.xlsx" fayli, "Tariflar" varag'i.
//
// Formula:
//   Qoldiq          = Naqd narxi − Boshlang'ich to'lov
//   Nasiya narxi     = Qoldiq × (1 + ustama) + Boshlang'ich to'lov
//   Oylik to'lov     = Qoldiq × (1 + ustama) ÷ oylar soni
//
// Ustama = 0.05 × oylar soni + 0.10  (3 oy → 25%, 4 oy → 30%, ... 9 oy → 55%)
// Bu formula Excel faylidagi B4:H7 va B22:F25 katakchalaridan chiqarib olindi.

const MIN_DOWN_PAYMENT_RATE = 0.30; // boshlang'ich to'lov kamida naqd narxining 30% bo'lishi kerak

const TERM_OPTIONS = [3, 4, 5, 6, 7, 8, 9].map(months => ({
  months,
  markup: Math.round((0.05 * months + 0.10) * 100) / 100,
}));

function minDownPayment(basePrice) {
  return Math.round(basePrice * MIN_DOWN_PAYMENT_RATE);
}

// downPayment berilmasa, minimal (30%) qiymat ishlatiladi
function calcInstallment(basePrice, months, downPayment) {
  const term = TERM_OPTIONS.find(t => t.months === Number(months));
  if (!term) return null;

  const minDp = minDownPayment(basePrice);
  const dp = downPayment != null ? Number(downPayment) : minDp;
  if (dp < minDp) return null; // boshlang'ich to'lov minimaldan kam bo'lishi mumkin emas

  const remaining = basePrice - dp;
  const remainingWithMarkup = Math.round(remaining * (1 + term.markup));
  const totalPrice = remainingWithMarkup + dp;
  const monthly = Math.round(remainingWithMarkup / term.months);

  return {
    months: term.months,
    markup: term.markup,
    down_payment: dp,
    min_down_payment: minDp,
    total_price: totalPrice,
    monthly_payment: monthly,
  };
}

// ---------- Call markaz va filiallar ----------

const CALL_CENTER = [
  { label: 'Asosiy raqam', phone: '+998 97 107 44 44' },
  { label: "Texnik bo'lim", phone: '+998 98 177 15 53' },
  { label: "To'lov bo'limi", phone: '+998 97 103 44 40' },
];

const BRANCHES = [
  { name: 'Parkent filiali', address: 'Parkent, 74', phone: '+998 97 107 44 44' },
  { name: "Bog'iravon filiali", address: "Bog'iravon, 33", phone: '+998 97 107 44 44' },
  { name: 'Chorsu filiali', address: 'Chorsu', phone: '+998 97 107 44 44' },
];

module.exports = { TERM_OPTIONS, MIN_DOWN_PAYMENT_RATE, minDownPayment, calcInstallment, CALL_CENTER, BRANCHES };
