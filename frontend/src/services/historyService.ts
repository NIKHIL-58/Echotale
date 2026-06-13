import { apiClient } from '@/lib/axios';

export const service = {
  list: (url: string) => apiClient.get(url),
  create: (url: string, data: unknown) => apiClient.post(url, data),
  update: (url: string, data: unknown) => apiClient.put(url, data),
  remove: (url: string) => apiClient.delete(url)
};
