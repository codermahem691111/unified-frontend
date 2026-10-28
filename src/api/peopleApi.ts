import type { AxiosInstance } from 'axios';
import type { PageParams, Paginated } from '../types/common';
import type { Person, PersonPayload, PersonType } from '../types/people';
import { BaseApi } from './baseApi';
import { httpClient } from './httpClient';

export type PeopleListParams = PageParams & { type?: PersonType };

export class PeopleApi extends BaseApi {
  constructor(client: AxiosInstance) {
    super(client);
  }

  list(params: PeopleListParams): Promise<Paginated<Person>> {
    return this.request(
      this.client.get<Paginated<Person>>('/people', { params: { ...params, search: params.search || undefined } }),
    );
  }

  create(payload: PersonPayload): Promise<Person> {
    return this.request(this.client.post<Person>('/people', payload));
  }

  update(id: string, payload: PersonPayload): Promise<Person> {
    return this.request(this.client.patch<Person>(`/people/${id}`, payload));
  }

  remove(id: string): Promise<void> {
    return this.request(this.client.delete<void>(`/people/${id}`));
  }
}

export const peopleApi = new PeopleApi(httpClient);
