import { apiClient } from './axios';
export const api = {
  getStories: () => apiClient.get('/stories/'),
  getStory: (id: string) => apiClient.get(`/stories/${id}/`),
  login: (data: unknown) => apiClient.post('/auth/login/', data),
  register: (data: unknown) => apiClient.post('/auth/register/', data)
};
