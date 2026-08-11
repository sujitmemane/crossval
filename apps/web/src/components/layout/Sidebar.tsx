import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLayout } from './LayoutContext';
import { dashboardNavItems } from './nav-config';
import { IconChevronLeft, IconChevronRight, IconProfile } from '../ui/Icons';
import { paths } from '../../routes/paths';

export function Sidebar() {
  const { user } = useAuth();
  const { sidebarExpanded, toggleSidebar } = useLayout();

  const visibleItems = dashboardNavItems.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <>
      <aside
        className={`relative hidden shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 md:flex ${
          sidebarExpanded ? 'w-52' : 'w-16'
        }`}
      >
        <div className={`flex h-14 items-center ${sidebarExpanded ? 'px-4' : 'justify-center'}`}>
          <Link to={paths.dashboard.home} className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              S
            </div>
            {sidebarExpanded ? <span className="truncate text-sm font-semibold text-foreground">Settle</span> : null}
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === paths.dashboard.home}
                title={sidebarExpanded ? undefined : item.label}
                className={({ isActive }) =>
                  `flex items-center rounded-lg transition-colors ${
                    sidebarExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'
                  } ${
                    isActive
                      ? 'bg-surfaceMuted text-accent'
                      : 'text-muted hover:bg-surfaceMuted/70 hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {sidebarExpanded ? <span className="truncate text-sm font-medium">{item.label}</span> : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-2 pb-3">
          <Link
            to={paths.dashboard.profile}
            title={sidebarExpanded ? undefined : 'Profile'}
            className={`flex items-center rounded-lg text-muted transition-colors hover:bg-surfaceMuted/70 hover:text-foreground ${
              sidebarExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'
            }`}
          >
            <IconProfile className="h-[18px] w-[18px] shrink-0" />
            {sidebarExpanded ? <span className="truncate text-sm font-medium">Profile</span> : null}
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="absolute -right-3 top-[4.25rem] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition-colors hover:text-foreground"
        >
          {sidebarExpanded ? <IconChevronLeft className="h-3.5 w-3.5" /> : <IconChevronRight className="h-3.5 w-3.5" />}
        </button>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background px-2 py-2 md:hidden">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === paths.dashboard.home}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium ${
                  isActive ? 'text-accent' : 'text-muted'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
