import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import type { AuthUser, SignInPayload, SignUpPayload } from '../types/auth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    usersApi
      .getMe()
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signInMutation = useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (response) => setUser(response.data.user),
  });

  const signUpMutation = useMutation({
    mutationFn: authApi.signUp,
    onSuccess: (response) => setUser(response.data.user),
  });

  const signOutMutation = useMutation({
    mutationFn: authApi.signOut,
  });

  const signIn = (payload: SignInPayload) => signInMutation.mutateAsync(payload);

  const signUp = (payload: SignUpPayload) => signUpMutation.mutateAsync(payload);

  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync();
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
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
