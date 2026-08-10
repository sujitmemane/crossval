import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { paths } from '../../routes/paths';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
      <Link to={paths.dashboard.home} className="text-sm font-semibold text-slate-900 md:hidden">
        Settle
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <Link to={paths.dashboard.profile} className="text-sm text-slate-600 hover:text-slate-900">
          <span className="font-medium text-slate-900">{user?.name}</span>
          <span className="ml-1 text-slate-400">({user?.role})</span>
        </Link>
        <Button variant="secondary" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
