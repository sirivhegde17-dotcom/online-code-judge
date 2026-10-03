import api from './api';

export const submissionService = {
  async runCode(problem_id, language, source_code) {
    const response = await api.post('/code/run', {
      problem_id: parseInt(problem_id, 10),
      language,
      source_code,
    });
    return response.data;
  },

  async submitSolution(problem_id, language, source_code) {
    const response = await api.post('/submissions', {
      problem_id: parseInt(problem_id, 10),
      language,
      source_code,
    });
    return response.data;
  },

  async getSubmissions(params = {}) {
    const response = await api.get('/submissions', { params });
    return response.data;
  },

  async getSubmissionById(id) {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },
};
