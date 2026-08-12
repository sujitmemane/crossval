import { paths } from '../routes/paths';

export function getPageTitle(pathname: string): string | null {
  if (pathname === paths.dashboard.home) return 'Dashboard';
  if (pathname === paths.dashboard.orders) return 'Orders';
  if (pathname === paths.dashboard.ordersNew) return 'New order';
  if (pathname.startsWith('/dashboard/orders/') && pathname.endsWith('/edit')) return 'Edit order';
  if (pathname === paths.dashboard.items) return 'Items';
  if (pathname === paths.dashboard.itemsNew) return 'Add item';
  if (pathname.startsWith('/dashboard/items/') && pathname.endsWith('/edit')) return 'Edit item';
  if (pathname === paths.dashboard.users) return 'Users';
  if (pathname === paths.dashboard.usersNew) return 'Add user';
  if (pathname.startsWith('/dashboard/users/') && pathname.endsWith('/edit')) return 'Edit user';
  if (pathname === paths.dashboard.organization) return 'Organization';
  if (pathname === paths.dashboard.profile) return 'Profile';
  return null;
}
