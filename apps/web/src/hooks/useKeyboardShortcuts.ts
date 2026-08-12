import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { CREATE_SHORTCUTS, CREATE_SHORTCUT_KEYS, isTypingInField } from '../lib/keyboard-shortcuts';

function isFormPage(pathname: string) {
  return pathname.includes('/new') || pathname.includes('/edit');
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingInField(event.target)) return;
      if (isFormPage(location.pathname)) return;

      const path = CREATE_SHORTCUT_KEYS[event.key.toLowerCase()];
      if (!path) return;

      const shortcut = CREATE_SHORTCUTS.find((entry) => entry.path === path);
      if (shortcut?.adminOnly && user?.role !== 'ADMIN') return;

      event.preventDefault();
      navigate(path);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname, navigate, user?.role]);
}
