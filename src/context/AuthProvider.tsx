import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { setUnauthorizedHandler } from '../api/httpClient';
import { tokenStorage } from '../api/tokenStorage';
import type { Company, LoginPayload } from '../types/auth';
import { AuthContext, type AuthContextValue } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(() => tokenStorage.getAccessToken() !== null);

  useEffect(() => {
    setUnauthorizedHandler(() => setCompany(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  // Restore the session from saved tokens.
  useEffect(() => {
    if (!tokenStorage.getAccessToken()) {
      setIsInitializing(false);
      return;
    }

    let isCancelled = false;

    authApi
      .getProfile()
      .then((profile) => {
        if (!isCancelled) setCompany(profile);
      })
      .catch(() => tokenStorage.clear())
      .finally(() => {
        if (!isCancelled) setIsInitializing(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { company: signedInCompany, ...tokens } = await authApi.login(payload);
    tokenStorage.setTokens(tokens);
    setCompany(signedInCompany);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Revoke the session on the server while we still hold the token.
      await authApi.logout();
    } catch {
      /* signing out locally is enough if the server cannot be reached */
    } finally {
      tokenStorage.clear();
      setCompany(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ company, isInitializing, login, logout }),
    [company, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
