/**
 * Calculates the next pay date based on user's target pay day (1-31).
 * If today is August 23 and pay day is 25, next pay date is August 25.
 * If today is August 26 and pay day is 25, next pay date is September 25.
 */
export function getNextPayDate(payDay: number = 25, referenceDate: Date = new Date()): Date {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const currentDay = referenceDate.getDate();

  // Create date for this month's payday
  const thisMonthPayDay = new Date(currentYear, currentMonth, payDay);

  if (currentDay <= payDay) {
    return thisMonthPayDay;
  } else {
    // Return next month's payday
    return new Date(currentYear, currentMonth + 1, payDay);
  }
}

/**
 * Calculates the number of days remaining until the next payday.
 */
export function getDaysUntilPayday(payDay: number = 25, referenceDate: Date = new Date()): number {
  const nextPayDate = getNextPayDate(payDay, referenceDate);
  const diffTime = nextPayDate.getTime() - referenceDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD string into French date representation (e.g., "25 Septembre")
 */
export function formatDateFrench(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const monthsFr = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return `${date.getDate()} ${monthsFr[date.getMonth()]}`;
}

/**
 * Returns current period key (YYYY-MM)
 */
export function getCurrentPeriodKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
