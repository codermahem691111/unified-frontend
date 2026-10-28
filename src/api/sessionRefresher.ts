import type { AxiosInstance } from 'axios';
import type { SessionTokens } from '../types/auth';
import type { TokenStorage } from './tokenStorage';

/**
 * Supabase access tokens are short-lived. This swaps the refresh token for a new pair.
 * If several requests fail at once they all share one refresh call, because a refresh
 * token can only be used once.
 */
export class SessionRefresher {
  private inFlight: Promise<string | null> | null = null;

  /** `client` must be a plain axios instance (no interceptors) so a failed refresh cannot loop. */
  constructor(
    private readonly client: AxiosInstance,
    private readonly storage: TokenStorage,
  ) {}

  /** Resolves with the new access token, or null when the user has to sign in again. */
  refresh(): Promise<string | null> {
    if (!this.inFlight) {
      this.inFlight = this.requestNewTokens().finally(() => {
        this.inFlight = null;
      });
    }
    return this.inFlight;
  }

  private async requestNewTokens(): Promise<string | null> {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const { data } = await this.client.post<SessionTokens>('/auth/refresh', { refreshToken });
      this.storage.setTokens(data);
      return data.accessToken;
    } catch {
      return null;
    }
  }
}
