import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paths } from '../../routes/paths';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur-sm md:px-8">
      <p className="truncate text-sm text-muted">
        Hi <span className="font-medium text-foreground">{user?.name ?? 'there'}</span>
      </p>

      <div className="flex items-center gap-5">
        <Link
          to={paths.dashboard.profile}
          className="hidden text-sm text-muted transition-colors hover:text-foreground sm:inline"
        >
          Profile
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
