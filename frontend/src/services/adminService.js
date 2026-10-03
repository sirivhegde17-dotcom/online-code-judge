import api from './api';

export const adminService = {
  async getSystemStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async toggleUserStatus(userId, isActive) {
    const response = await api.put(`/admin/users/${userId}/status`, null, {
      params: { is_active: isActive },
    });
    return response.data;
  },

  async getAllSubmissions(params = {}) {
    const response = await api.get('/admin/submissions', { params });
    return response.data;
  },
};
