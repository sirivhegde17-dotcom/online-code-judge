import api from './api';

export const leaderboardService = {
  async getLeaderboard(params = {}) {
    const response = await api.get('/leaderboard', { params });
    return response.data;
  },

  async getMyStats() {
    const response = await api.get('/leaderboard/me');
    return response.data;
  },
};
