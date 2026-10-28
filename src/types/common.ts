export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Query options shared by every list endpoint. */
export interface PageParams {
  page: number;
  pageSize: number;
  search?: string;
}
