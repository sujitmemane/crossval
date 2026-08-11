import type { PaginationMeta } from './pagination';

export type ItemStatus = 'AVAILABLE' | 'UNAVAILABLE';

export interface Item {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ItemsResponse {
  items: Item[];
  pagination: PaginationMeta;
}

export interface CreateItemPayload {
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  status?: ItemStatus;
}
