import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { LayoutProvider } from '../components/layout/LayoutContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const SIDEBAR_KEY = 'settle-sidebar-expanded';

function readSidebarPreference() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(readSidebarPreference);

  useKeyboardShortcuts();

  const setSidebarExpandedPersisted = (expanded: boolean) => {
    setSidebarExpanded(expanded);
    try {
      localStorage.setItem(SIDEBAR_KEY, String(expanded));
    } catch {
      // ignore storage errors
    }
  };

  return (
    <LayoutProvider sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpandedPersisted}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 md:px-8 md:py-7 md:pb-7">
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutProvider>
  );
}
