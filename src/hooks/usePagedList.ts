import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/apiError';
import type { PageParams, Paginated } from '../types/common';
import { useDebouncedValue } from './useDebouncedValue';

const PAGE_SIZE = 10;
const SEARCH_DELAY_MS = 300;

interface Options<T, F extends object> {
  fetcher: (params: PageParams & F) => Promise<Paginated<T>>;
  /** Extra filters (for example `{ type: 'staff' }`). Changing them goes back to page 1. */
  filters: F;
}

/**
 * Loads one page of a list and keeps paging, search and filters in sync.
 * Call `reload()` after adding, editing or deleting something.
 */
export function usePagedList<T, F extends object = object>({ fetcher, filters }: Options<T, F>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const search = useDebouncedValue(searchText.trim(), SEARCH_DELAY_MS);
  const filtersKey = JSON.stringify(filters);

  // Always call the latest fetcher/filters without making them effect dependencies.
  const latest = useRef({ fetcher, filters });
  latest.current = { fetcher, filters };

  // A new search or filter always starts again from the first page.
  useEffect(() => {
    setPage(1);
  }, [search, filtersKey]);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    latest.current
      .fetcher({ ...latest.current.filters, page, pageSize: PAGE_SIZE, search })
      .then((result) => {
        if (isCancelled) return;
        // The last row of the last page was removed: step back one page.
        if (result.items.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setItems(result.items);
        setTotal(result.total);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!isCancelled) setError(ApiError.from(caught).message);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [page, search, filtersKey, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    searchText,
    isSearching: searchText.trim() !== '',
    isLoading,
    error,
    setPage,
    setSearchText,
    reload,
  };
}
