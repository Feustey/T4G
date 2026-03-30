const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

const THRESHOLDS: [number, Intl.RelativeTimeFormatUnit][] = [
  [60, 'seconds'],
  [3600, 'minutes'],
  [86400, 'hours'],
  [2592000, 'days'],
  [31536000, 'months'],
  [Infinity, 'years'],
];

const DIVISORS: Partial<Record<Intl.RelativeTimeFormatUnit, number>> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  months: 2592000,
  years: 31536000,
};

/** "il y a 3 minutes", "il y a 2 jours", etc. */
export function timeAgo(ts: string | number | Date): string {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  for (const [limit, unit] of THRESHOLDS) {
    if (Math.abs(diff) < limit) {
      return rtf.format(-Math.round(diff / (DIVISORS[unit] ?? 1)), unit);
    }
  }
  return rtf.format(-Math.round(diff / 31536000), 'years');
}

/** "28/03/25 14:30" */
export function formatShortDate(ts: string | number | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}
