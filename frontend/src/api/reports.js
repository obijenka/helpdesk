import api from './axios';

export const reportsApi = {
  summary: (period = 'all') =>
    api.get('/reports/summary', { params: { period } }),
};