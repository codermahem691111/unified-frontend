import type { AxiosInstance } from 'axios';
import type { PageParams, Paginated } from '../types/common';
import type { Product, ProductPayload } from '../types/products';
import { BaseApi } from './baseApi';
import { httpClient } from './httpClient';

export class ProductsApi extends BaseApi {
  constructor(client: AxiosInstance) {
    super(client);
  }

  list(params: PageParams): Promise<Paginated<Product>> {
    return this.request(
      this.client.get<Paginated<Product>>('/products', { params: { ...params, search: params.search || undefined } }),
    );
  }

  create(payload: ProductPayload): Promise<Product> {
    return this.request(this.client.post<Product>('/products', payload));
  }

  update(id: string, payload: ProductPayload): Promise<Product> {
    return this.request(this.client.patch<Product>(`/products/${id}`, payload));
  }

  remove(id: string): Promise<void> {
    return this.request(this.client.delete<void>(`/products/${id}`));
  }

  uploadImage(id: string, file: File): Promise<Product> {
    const form = new FormData();
    form.append('image', file);

    return this.request(
      this.client.post<Product>(`/products/${id}/image`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
    );
  }

  removeImage(id: string): Promise<Product> {
    return this.request(this.client.delete<Product>(`/products/${id}/image`));
  }
}

export const productsApi = new ProductsApi(httpClient);
