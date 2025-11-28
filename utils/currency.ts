
const CURRENCY_SYMBOLS: Record<string, string> = {
  aed: 'د.إ',
  ars: '$',
  aud: '$',
  brl: 'R$',
  cad: '$',
  chf: 'CHF',
  clp: '$',
  cny: '¥',
  cop: '$',
  czk: 'Kč',
  dkk: 'kr',
  eur: '€',
  gbp: '£',
  hkd: '$',
  huf: 'Ft',
  idr: 'Rp',
  ils: '₪',
  inr: '₹',
  jpy: '¥',
  krw: '₩',
  mxn: '$',
  myr: 'RM',
  ngn: '₦',
  nok: 'kr',
  nzd: '$',
  php: '₱',
  pkr: '₨',
  pln: 'zł',
  rub: '₽',
  sar: '﷼',
  sek: 'kr',
  sgd: '$',
  thb: '฿',
  try: '₺',
  twd: 'NT$',
  uah: '₴',
  usd: '$',
  vnd: '₫',
  zar: 'R',
};

/**
 * Gets the common symbol for a given currency code.
 * Falls back to the uppercase currency code if no symbol is found.
 * @param currencyCode - The 3-letter currency code (e.g., 'usd').
 * @returns The currency symbol (e.g., '$') or the code itself.
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode.toLowerCase()] || currencyCode.toUpperCase();
};
