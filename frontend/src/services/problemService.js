import api from './api';

export const problemService = {
  async getProblems(params = {}) {
    const response = await api.get('/problems', { params });
    return response.data;
  },

  async getProblemById(id) {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  async createProblem(problemData) {
    const response = await api.post('/problems', problemData);
    return response.data;
  },

  async updateProblem(id, problemData) {
    const response = await api.put(`/problems/${id}`, problemData);
    return response.data;
  },

  async deleteProblem(id) {
    const response = await api.delete(`/problems/${id}`);
    return response.data;
  },

  async addTestCase(problemId, testCaseData) {
    const response = await api.post(`/problems/${problemId}/test-cases`, testCaseData);
    return response.data;
  },

  async deleteTestCase(problemId, testCaseId) {
    const response = await api.delete(`/problems/${problemId}/test-cases/${testCaseId}`);
    return response.data;
  },
};
