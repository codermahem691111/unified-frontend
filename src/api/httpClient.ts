import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env';
import { SessionRefresher } from './sessionRefresher';
import { tokenStorage } from './tokenStorage';

/** Calls where a 401 means "wrong details", not "your session expired". */
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/resend-verification',
  '/auth/refresh',
  '/auth/logout',
];

type RetriableRequest = InternalAxiosRequestConfig & { _hasRetried?: boolean };
type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Lets the auth context find out when the session could not be restored. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

const clientOptions = { baseURL: API_BASE_URL, timeout: 15_000 };

export const httpClient: AxiosInstance = axios.create({
  ...clientOptions,
  headers: { 'Content-Type': 'application/json' },
});

const sessionRefresher = new SessionRefresher(axios.create(clientOptions), tokenStorage);

httpClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    const request: RetriableRequest = error.config;

    if (NO_REFRESH_PATHS.includes(request.url ?? '')) {
      return Promise.reject(error);
    }

    // First 401: try to get a fresh access token and repeat the request once.
    if (!request._hasRetried) {
      request._hasRetried = true;
      const accessToken = await sessionRefresher.refresh();

      if (accessToken) {
        request.headers.Authorization = `Bearer ${accessToken}`;
        return httpClient(request);
      }
    }

    // The session cannot be renewed: sign the user out.
    tokenStorage.clear();
    unauthorizedHandler?.();
    return Promise.reject(error);
  },
);
