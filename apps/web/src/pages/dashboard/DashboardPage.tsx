import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { paths } from '../../routes/paths';

interface QuickLink {
  to: string;
  title: string;
  description: string;
  adminOnly?: boolean;
}

const quickLinks: QuickLink[] = [
  { to: paths.dashboard.orders, title: 'Orders', description: 'Track dues and payment status across customer orders.' },
  { to: paths.dashboard.items, title: 'Items', description: 'Manage the products and services you sell.' },
  { to: paths.dashboard.users, title: 'Users', description: 'Invite teammates and manage roles.', adminOnly: true },
];

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Welcome back, ${user?.name ?? ''}`} description="Here's a quick jump-off point for Settle." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks
          .filter((link) => !link.adminOnly || user?.role === 'ADMIN')
          .map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{link.title}</p>
              <p className="mt-1 text-sm text-slate-500">{link.description}</p>
            </Link>
          ))}
      </div>
    </div>
  );
}
