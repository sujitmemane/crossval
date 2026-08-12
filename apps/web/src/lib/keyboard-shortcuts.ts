import { paths } from '../routes/paths';

export function isTypingInField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

export interface CreateShortcut {
  key: string;
  label: string;
  description: string;
  path: string;
  adminOnly?: boolean;
}

export const CREATE_SHORTCUTS: CreateShortcut[] = [
  {
    key: 'O',
    label: 'Create order',
    description: 'Start a new customer order',
    path: paths.dashboard.ordersNew,
  },
  {
    key: 'I',
    label: 'Create item',
    description: 'Add a product or service',
    path: paths.dashboard.itemsNew,
  },
  {
    key: 'U',
    label: 'Create user',
    description: 'Invite a teammate or customer',
    path: paths.dashboard.usersNew,
    adminOnly: true,
  },
];

export const CREATE_SHORTCUT_KEYS: Record<string, string> = Object.fromEntries(
  CREATE_SHORTCUTS.map((shortcut) => [shortcut.key.toLowerCase(), shortcut.path]),
);
