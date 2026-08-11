import { NavLink } from 'react-router-dom';
import { paths } from '../../routes/paths';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: paths.dashboard.home, label: 'Dashboard' },
  { to: paths.dashboard.orders, label: 'Orders' },
  { to: paths.dashboard.items, label: 'Items' },
  { to: paths.dashboard.users, label: 'Users', adminOnly: true },
  { to: paths.dashboard.organization, label: 'Organization' },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 md:flex">
      <div className="px-2 pb-6 text-lg font-semibold text-slate-900">Settle</div>
      <nav className="flex flex-col gap-1">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === 'ADMIN')
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === paths.dashboard.home}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
