import type { AxiosInstance, AxiosResponse } from 'axios';
import { ApiError } from './apiError';

/** Shared by every API class: failures always surface as an ApiError with a readable message. */
export abstract class BaseApi {
  constructor(protected readonly client: AxiosInstance) {}

  protected async request<T>(call: Promise<AxiosResponse<T>>): Promise<T> {
    try {
      return (await call).data;
    } catch (error) {
      throw ApiError.from(error);
    }
  }
}
