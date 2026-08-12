export const CSV_BOM = '\uFEFF';

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatCsvRow(values: readonly unknown[]): string {
  return values.map(escapeCsvCell).join(',');
}

export function formatCsvRecord(headers: readonly string[], row: Record<string, unknown>): string {
  return formatCsvRow(headers.map((header) => row[header]));
}

export function toCsv(headers: readonly string[], rows: ReadonlyArray<Record<string, unknown>>): string {
  return `${CSV_BOM}${[formatCsvRow(headers), ...rows.map((row) => formatCsvRecord(headers, row))].join('\n')}`;
}
