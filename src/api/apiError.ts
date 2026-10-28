import axios from 'axios';

/** Error codes sent by the backend that the UI reacts to. */
export const ApiErrorCode = {
  EmailNotVerified: 'EMAIL_NOT_VERIFIED',
} as const;

interface ApiErrorBody {
  message?: string | string[];
  code?: string;
}

/** A single, predictable error type for everything that goes wrong when calling the API. */
export class ApiError extends Error {
  constructor(
    public readonly messages: string[],
    public readonly status: number | null,
    public readonly code: string | null,
  ) {
    super(messages[0] ?? 'Something went wrong. Please try again.');
    this.name = 'ApiError';
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (axios.isAxiosError<ApiErrorBody>(error)) {
      if (!error.response) {
        return new ApiError(['Cannot reach the server. Check your connection and try again.'], null, null);
      }

      const body: ApiErrorBody = error.response.data ?? {};
      const { message } = body;
      const messages = Array.isArray(message)
        ? message
        : message
          ? [message]
          : ['Something went wrong. Please try again.'];

      return new ApiError(messages, error.response.status, body.code ?? null);
    }

    return new ApiError(['Something went wrong. Please try again.'], null, null);
  }
}
