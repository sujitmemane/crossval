import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { LayoutProvider } from '../components/layout/LayoutContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useKeyboardShortcuts();

  return (
    <LayoutProvider sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded}>
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
