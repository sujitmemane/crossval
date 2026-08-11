import type { ComponentType, SVGProps } from 'react';
import {
  IconDashboard,
  IconItems,
  IconOrders,
  IconOrganization,
  IconUsers,
} from '../ui/Icons';
import { paths } from '../../routes/paths';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: IconComponent;
  adminOnly?: boolean;
}

export const dashboardNavItems: DashboardNavItem[] = [
  { to: paths.dashboard.home, label: 'Dashboard', icon: IconDashboard },
  { to: paths.dashboard.orders, label: 'Orders', icon: IconOrders },
  { to: paths.dashboard.items, label: 'Items', icon: IconItems },
  { to: paths.dashboard.users, label: 'Users', icon: IconUsers, adminOnly: true },
  { to: paths.dashboard.organization, label: 'Organization', icon: IconOrganization },
];
