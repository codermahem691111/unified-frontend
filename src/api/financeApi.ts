import type { AxiosInstance } from 'axios';
import type { PageParams, Paginated } from '../types/common';
import type { FinanceCategory, FinanceEntry, FinanceEntryPayload, FinanceSummary } from '../types/finance';
import { BaseApi } from './baseApi';
import { httpClient } from './httpClient';

export type FinanceListParams = PageParams & { category?: FinanceCategory };

export class FinanceApi extends BaseApi {
  constructor(client: AxiosInstance) {
    super(client);
  }

  list(params: FinanceListParams): Promise<Paginated<FinanceEntry>> {
    return this.request(
      this.client.get<Paginated<FinanceEntry>>('/finance', { params: { ...params, search: params.search || undefined } }),
    );
  }

  summary(months: number): Promise<FinanceSummary> {
    return this.request(this.client.get<FinanceSummary>('/finance/summary', { params: { months } }));
  }

  create(payload: FinanceEntryPayload): Promise<FinanceEntry> {
    return this.request(this.client.post<FinanceEntry>('/finance', payload));
  }

  update(id: string, payload: FinanceEntryPayload): Promise<FinanceEntry> {
    return this.request(this.client.patch<FinanceEntry>(`/finance/${id}`, payload));
  }

  remove(id: string): Promise<void> {
    return this.request(this.client.delete<void>(`/finance/${id}`));
  }
}

export const financeApi = new FinanceApi(httpClient);
