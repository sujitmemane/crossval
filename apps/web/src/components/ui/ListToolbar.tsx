interface FilterTab {
  id: string;
  label: string;
  count?: number;
}

interface ListToolbarProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function ListToolbar({
  tabs,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
}: ListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surfaceMuted/50 p-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-surface text-foreground shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span
                  className={`tabular-nums text-xs ${isActive ? 'text-muted' : 'text-mutedForeground'}`}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {onSearchChange ? (
        <div className="relative w-full sm:max-w-xs">
          <input
            id="list-search-input"
            type="search"
            value={search ?? ''}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-borderInput bg-surfaceInput py-2 pr-3 pl-9 text-sm text-foreground shadow-xs outline-none transition-all placeholder:text-mutedForeground focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <svg
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mutedForeground"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}
