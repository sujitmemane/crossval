import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface LayoutContextValue {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({
  sidebarExpanded,
  setSidebarExpanded,
  children,
}: {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  children: ReactNode;
}) {
  return (
    <LayoutContext.Provider
      value={{
        sidebarExpanded,
        setSidebarExpanded,
        toggleSidebar: () => setSidebarExpanded(!sidebarExpanded),
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
}
