function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

/** MongoDB stores UTC. Export shows the same instant as plain date + time in UTC. */
export function formatUtcDateTime(date: Date | string): string {
  const value = toDate(date);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(value);

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

export const CSV_UTC_DATE_NOTE = 'All dates are in UTC.';
