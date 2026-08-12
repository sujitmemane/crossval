import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { getPageTitle } from '../../lib/page-titles';
import { paths } from '../../routes/paths';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { data: organization } = useOrganization();
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur-sm md:px-8">
      <div className="min-w-0">
        {pageTitle ? (
          <p className="truncate text-sm font-semibold text-foreground md:hidden">{pageTitle}</p>
        ) : null}
        <p className={`truncate text-sm text-muted ${pageTitle ? 'hidden md:block' : ''}`}>
          Hi <span className="font-medium text-foreground">{user?.name ?? 'there'}</span>
          {organization ? (
            <span className="text-mutedForeground">
              {' '}
              · <span className="hidden sm:inline">{organization.name}</span>
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <Link
          to={paths.dashboard.profile}
          className="text-sm text-muted transition-colors hover:text-foreground"
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
