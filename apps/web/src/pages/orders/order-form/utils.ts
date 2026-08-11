import type { DueDatePreset, OrderLine } from './types';

export const DUE_DATE_PRESETS: { id: DueDatePreset; label: string; days?: number }[] = [
  { id: '3', label: '3 days', days: 3 },
  { id: '7', label: '7 days', days: 7 },
  { id: '15', label: '15 days', days: 15 },
  { id: 'custom', label: 'Custom' },
];

export const DEFAULT_DUE_DAYS = 7;

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysFromToday(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return formatDateLocal(date);
}

export function detectDueDatePreset(dateStr: string): DueDatePreset {
  for (const preset of DUE_DATE_PRESETS) {
    if (preset.days && dateStr === addDaysFromToday(preset.days)) return preset.id;
  }
  return 'custom';
}

export function formatDueDateLabel(dateStr: string) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function normalizeItems(items: OrderLine[]) {
  return [...items].map((item) => `${item.itemId}:${item.quantity}`).sort().join('|');
}
