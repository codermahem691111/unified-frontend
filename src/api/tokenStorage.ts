import type { SessionTokens } from '../types/auth';

const ACCESS_TOKEN_KEY = 'erp.accessToken';
const REFRESH_TOKEN_KEY = 'erp.refreshToken';

/** Keeps the session tokens in localStorage. Every call is guarded because storage can be blocked. */
export class TokenStorage {
  getAccessToken(): string | null {
    return this.read(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.read(REFRESH_TOKEN_KEY);
  }

  setTokens(tokens: SessionTokens): void {
    this.write(ACCESS_TOKEN_KEY, tokens.accessToken);
    this.write(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  clear(): void {
    this.remove(ACCESS_TOKEN_KEY);
    this.remove(REFRESH_TOKEN_KEY);
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable: the user will simply need to sign in again next time */
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* nothing to remove */
    }
  }
}

export const tokenStorage = new TokenStorage();
