import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** Skip the refresh-and-retry-on-401 flow (e.g. sign-in/sign-up, where a 401 is a real credential error). */
    skipAuth?: boolean;
    _retry?: boolean;
  }
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<null>>) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;

    if (error.response?.status === 401 && config && !config.skipAuth && !config._retry) {
      config._retry = true;
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiClient(config);
      }
    }

    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong';
    const errors = error.response?.data?.errors;
    return Promise.reject(new ApiError(message, error.response?.status ?? 0, errors));
  },
);

export async function apiFetch<T>(
  path: string,
  config: AxiosRequestConfig & { skipAuth?: boolean } = {},
): Promise<ApiEnvelope<T>> {
  const response = await apiClient.request<ApiEnvelope<T>>({ url: path, ...config });
  return response.data;
}
