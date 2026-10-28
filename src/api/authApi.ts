import type { AxiosInstance } from 'axios';
import type {
  Company,
  LoginPayload,
  LoginResponse,
  MessageResponse,
  RegisterPayload,
} from '../types/auth';
import { BaseApi } from './baseApi';
import { httpClient } from './httpClient';

/** Every authentication call the frontend can make. */
export class AuthApi extends BaseApi {
  constructor(client: AxiosInstance) {
    super(client);
  }

  register(payload: RegisterPayload): Promise<MessageResponse> {
    return this.request(this.client.post<MessageResponse>('/auth/register', payload));
  }

  resendVerification(email: string): Promise<MessageResponse> {
    return this.request(this.client.post<MessageResponse>('/auth/resend-verification', { email }));
  }

  login(payload: LoginPayload): Promise<LoginResponse> {
    return this.request(this.client.post<LoginResponse>('/auth/login', payload));
  }

  logout(): Promise<MessageResponse> {
    return this.request(this.client.post<MessageResponse>('/auth/logout'));
  }

  async getProfile(): Promise<Company> {
    const { company } = await this.request(this.client.get<{ company: Company }>('/auth/me'));
    return company;
  }
}

export const authApi = new AuthApi(httpClient);
