import api from './api';

export const adminAPI = {
  // LLM Config
  getLlmConfigs: () => api.get('/admin/llm-config'),
  createLlmConfig: (data) => api.post('/admin/llm-config', data),
  updateLlmConfig: (id, data) => api.put(`/admin/llm-config/${id}`, data),
  deleteLlmConfig: (id) => api.delete(`/admin/llm-config/${id}`),
  activateLlmConfig: (id) => api.patch(`/admin/llm-config/${id}/activate`),
  testLlmConfig: (id) => api.post(`/admin/llm-config/${id}/test`),

  // Assessment Questions
  getAssessmentQuestions: () => api.get('/admin/assessment-questions'),
  createAssessmentQuestion: (data) => api.post('/admin/assessment-questions', data),
  updateAssessmentQuestion: (id, data) => api.put(`/admin/assessment-questions/${id}`, data),
  deleteAssessmentQuestion: (id) => api.delete(`/admin/assessment-questions/${id}`),
  toggleAssessmentQuestion: (id) => api.patch(`/admin/assessment-questions/${id}/toggle`),
  reorderAssessmentQuestions: (items) => api.post('/admin/assessment-questions/reorder', { items }),

  // LLM Log
  getLlmLogs: (limit = 100) => api.get(`/admin/llm-log?limit=${limit}`),
  clearLlmLogs: () => api.delete('/admin/llm-log'),
};

export default adminAPI;