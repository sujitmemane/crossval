import { createContext } from 'react';
import type { ApiEnvelope } from '../lib/api-client';
import type { AuthSession, AuthUser, SignInPayload, SignUpPayload } from '../types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: SignInPayload) => Promise<ApiEnvelope<AuthSession>>;
  signUp: (payload: SignUpPayload) => Promise<ApiEnvelope<AuthSession>>;
  signOut: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
