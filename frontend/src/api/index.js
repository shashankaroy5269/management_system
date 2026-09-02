import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  verifyEmail: (token) => axiosClient.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => axiosClient.post('/auth/resend-verification', { email }),
  getMe: () => axiosClient.get('/auth/me'),
  logout: () => axiosClient.post('/auth/logout'),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email })
};

export const userApi = {
  getUsers: (params) => axiosClient.get('/users', { params }),
  getActiveEmployees: () => axiosClient.get('/users/employees'),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  createUser: (userData) => axiosClient.post('/users', userData),
  updateUser: (id, userData) => axiosClient.put(`/users/${id}`, userData),
  toggleUserStatus: (id) => axiosClient.patch(`/users/status/${id}`),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`)
};

export const taskApi = {
  getTasks: (params) => axiosClient.get('/tasks', { params }),
  getTaskById: (id) => axiosClient.get(`/tasks/${id}`),
  createTask: (taskData) => axiosClient.post('/tasks', taskData),
  updateTask: (id, taskData) => axiosClient.put(`/tasks/${id}`, taskData),
  changeStatus: (id, statusData) => axiosClient.patch(`/tasks/status/${id}`, statusData),
  assignTask: (id, assignData) => axiosClient.patch(`/tasks/assign/${id}`, assignData),
  addComment: (id, text) => axiosClient.post(`/tasks/${id}/comments`, { text }),
  uploadAttachment: (id, formData) =>
    axiosClient.post(`/tasks/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteTask: (id) => axiosClient.delete(`/tasks/${id}`)
};

export const analyticsApi = {
  getDashboardAnalytics: () => axiosClient.get('/analytics/dashboard')
};
