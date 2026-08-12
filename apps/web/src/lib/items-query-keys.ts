import type { ItemStatus, ListItemsParams } from '../types/item';

export const itemsQueryKeys = {
  all: ['items'] as const,
  catalog: () => [...itemsQueryKeys.all, 'catalog'] as const,
  list: (params: ListItemsParams) => [...itemsQueryKeys.all, 'list', params] as const,
  count: (status?: ItemStatus | 'ALL') => [...itemsQueryKeys.all, 'count', status ?? 'ALL'] as const,
};

export const ITEMS_CATALOG_LIMIT = 100;
