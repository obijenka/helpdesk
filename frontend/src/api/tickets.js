import api from './axios';

export const ticketsApi = {
  list: (params) => api.get('/tickets', { params }),
  get: (id) => api.get(`/tickets/${id}`),
  meta: () => api.get('/tickets/meta'),
  executors: () => api.get('/tickets/executors'),
  comments: (id) => api.get(`/tickets/${id}/comments`),
  addComment: (id, text) => api.post(`/tickets/${id}/comments`, { text }),
  updateStatus: (id, statusId) => api.patch(`/tickets/${id}/status`, { statusId }),
  assignExecutor: (id, assigneeId) =>
    api.patch(`/tickets/${id}/assignee`, { assigneeId }),
  create: (data) => api.post('/tickets', data),
  updatePriority: (id, priorityId) =>
    api.patch(`/tickets/${id}/priority`, { priorityId }),
};