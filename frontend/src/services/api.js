// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password, fullName, role, enterpriseId) =>
    api.post('/auth/register', { email, password, fullName, role, enterpriseId }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getProfile: () => api.get('/profile'),
  setRole: (role, enterpriseId) => api.post('/profile/role', { role, enterpriseId }),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.patch('/profile', data),
};

// Assessment API
export const assessmentAPI = {
  getQuestions: () => api.get('/assessment/questions'),
  startAssessment: (roleContext) => api.post('/assessment/start', { roleContext }),
  answerQuestion: (sessionId, questionCode, answer) =>
    api.post(`/assessment/${sessionId}/answer`, { questionCode, answer }),
  completeAssessment: (sessionId) => api.post(`/assessment/${sessionId}/complete`),
};

// Recommendations API
export const recommendationsAPI = {
  generateRecommendations: (sessionId, filters) =>
    api.post('/recommendations/generate', {}, { params: { sessionId, ...filters } }),
  getRecommendations: (sessionId) => api.get('/recommendations', { params: { sessionId } }),
};

// Enterprises API (public)
export const enterprisesAPI = {
  getAll: (filters) => api.get('/enterprises', { params: filters }),
  getBySlug: (slug) => api.get(`/enterprises/${slug}`),
};

// Vacancies API (public)
export const vacanciesAPI = {
  getAll: (filters) => api.get('/vacancies', { params: filters }),
  getById: (id) => api.get(`/vacancies/${id}`),
};

// Tours API (public)
export const toursAPI = {
  getAll: (filters) => api.get('/tours', { params: filters }),
  getById: (id) => api.get(`/tours/${id}`),
  book: (id) => api.post(`/tours/${id}/book`),
  getMyBookings: () => api.get('/tours/me/bookings'),
  cancelBooking: (bookingId) => api.delete(`/tours/bookings/${bookingId}`),
};

// Applications API (public)
export const applicationsAPI = {
  create: (vacancyId, type, coverNote) =>
    api.post('/applications', { vacancyId, type, coverNote }),
  getMyApplications: () => api.get('/applications/me'),
};

// ===== ENTERPRISE PRIVATE API (HR) =====
export const enterpriseAPI = {
  getDashboard: () => api.get('/enterprise/dashboard'),
  getProfile: () => api.get('/enterprise/profile'),
  updateProfile: (data) => api.patch('/enterprise/profile', data),

  // Vacancies
  getVacancies: () => api.get('/enterprise/vacancies'),
  createVacancy: (data) => api.post('/enterprise/vacancies', data),
  updateVacancy: (id, data) => api.put(`/enterprise/vacancies/${id}`, data),
  deleteVacancy: (id) => api.delete(`/enterprise/vacancies/${id}`),

  // Applications
  getApplications: () => api.get('/enterprise/applications'),
  updateApplicationStatus: (id, status) =>
    api.patch(`/enterprise/applications/${id}/status`, { status }),

  // Tours
  getTours: () => api.get('/enterprise/tours'),
  createTour: (data) => api.post('/enterprise/tours', data),
  updateTour: (id, data) => api.put(`/enterprise/tours/${id}`, data),
  deleteTour: (id) => api.delete(`/enterprise/tours/${id}`),
  getTourBookings: (id) => api.get(`/enterprise/tours/${id}/bookings`),
  getTour: (id) => api.get(`/enterprise/tours/${id}`),
  updateTourBookingStatus: (tourId, bookingId, status) =>
    api.patch(`/enterprise/tours/${tourId}/bookings/${bookingId}/status`, { status }),
  getAllTourBookings: () => api.get('/enterprise/tours/bookings'),
};

// Messages API
export const messagesAPI = {
  getThreads: () => api.get('/messages/threads'),
  createThread: (enterpriseId, vacancyId) => api.post('/messages/threads', { enterpriseId, vacancyId }),
  getMessages: (threadId, page = 1, limit = 20) => api.get(`/messages/threads/${threadId}/messages`, { params: { page, limit } }),
  sendMessage: (threadId, content) => api.post(`/messages/threads/${threadId}/messages`, { content }),
  markAsRead: (threadId, msgId) => api.patch(`/messages/threads/${threadId}/messages/${msgId}/read`),
};

export default api;
