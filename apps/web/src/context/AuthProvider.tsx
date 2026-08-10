import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../lib/api-client';
import type { AuthSession, AuthUser, SignInPayload, SignUpPayload } from '../types/auth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch<AuthUser>('/users/me')
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (payload: SignInPayload) => {
    const response = await apiFetch<AuthSession>('/auth/sign-in', {
      method: 'POST',
      data: payload,
      skipAuth: true,
    });
    setUser(response.data.user);
  };

  const signUp = async (payload: SignUpPayload) => {
    const response = await apiFetch<AuthSession>('/auth/sign-up', {
      method: 'POST',
      data: payload,
      skipAuth: true,
    });
    setUser(response.data.user);
  };

  const signOut = async () => {
    try {
      await apiFetch('/auth/sign-out', { method: 'POST', skipAuth: true });
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
