import { createContext } from 'react';
import type { Company, LoginPayload } from '../types/auth';

export interface AuthContextValue {
  company: Company | null;
  /** True while we are checking a saved session on first load. */
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
