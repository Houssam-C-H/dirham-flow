import type { CurrencyDisplay } from '../types/user';

/**
 * Formats a monetary amount for Moroccan Dirhams (MAD/DH).
 * Uses Unicode LTR Isolation (\u2066...\u2069) to prevent BiDi number reversal in RTL Arabic mode.
 */
export function formatCurrency(
  amount: number,
  displayMode: CurrencyDisplay = 'DH',
  showDecimalIfZero: boolean = false
): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasFraction = rounded % 1 !== 0;

  let formattedNum = '';

  if (displayMode === 'DH') {
    // Moroccan French / Darija standard: space separation for thousands (e.g., 12 500)
    const integerPart = Math.floor(Math.abs(rounded))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); // Non-breaking space
    const fractionPart = hasFraction ? (Math.abs(rounded) % 1).toFixed(2).slice(1) : (showDecimalIfZero ? '.00' : '');
    formattedNum = `${integerPart}${fractionPart}`;
    const result = rounded < 0 ? `-${formattedNum} DH` : `${formattedNum} DH`;
    return `\u2066${result}\u2069`;
  } else {
    // MAD standard: comma separation for thousands (e.g., 12,500)
    const integerPart = Math.floor(Math.abs(rounded))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const fractionPart = hasFraction ? (Math.abs(rounded) % 1).toFixed(2).slice(1) : (showDecimalIfZero ? '.00' : '');
    formattedNum = `${integerPart}${fractionPart}`;
    const result = rounded < 0 ? `-${formattedNum} MAD` : `${formattedNum} MAD`;
    return `\u2066${result}\u2069`;
  }
}

/**
 * Returns a concise formatted number string without currency symbol
 */
export function formatNumber(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}
