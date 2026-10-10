import api from './axios';

export const usersApi = {
  list: (params) => api.get('/users', { params }),
  meta: () => api.get('/users/meta'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  resetPassword: (id, newPassword) =>
    api.patch(`/users/${id}/password`, { newPassword }),
  executorsWithLoad: () => api.get('/users/executors-with-load'),
};