import axios from 'axios';
import authAPI from './auth';

const TOKEN_KEY = 'taskgrid_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 === API REQUEST START ===');
    console.log('📡 Making API request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ === API RESPONSE SUCCESS ===');
    console.log('📥 API response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('❌ === API RESPONSE ERROR ===');
    console.error('❌ API response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      headers: error.response?.headers
    });
    if (error.response?.status === 401) {
      // Clear token and redirect to login page
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, memberData) => api.post(`/projects/${id}/members`, memberData),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  search: (query) => api.get(`/projects/search?q=${query}`),
};

// Tasks API
const TASKS_URL = '/tasks'

export const tasksAPI = {
  _request: async (method, url, data, params) => {
    try {
      const response = await api({
        method,
        url,
        data,
        params,
      })
      return response.data
    } catch (err) {
      // The interceptor will log the details
      throw err
    }
  },

  getAll: () => tasksAPI._request('get', TASKS_URL),

  getByProject: projectId =>
    tasksAPI._request('get', `${TASKS_URL}/project/${projectId}`),

  getById: id => tasksAPI._request('get', `${TASKS_URL}/${id}`),

  create: taskData => tasksAPI._request('post', TASKS_URL, taskData),

  update: (id, taskData) => {
    return tasksAPI._request('put', `${TASKS_URL}/${id}`, taskData)
  },

  delete: id => tasksAPI._request('delete', `${TASKS_URL}/${id}`),

  addComment: (id, commentData) =>
    tasksAPI._request('post', `${TASKS_URL}/${id}/comments`, commentData)
};

// Users API
export const usersAPI = {
  getAll: (token) => api.get('/users', { headers: { Authorization: `Bearer ${token}` } }),
  getCount: (token) => api.get('/users/count', { headers: { Authorization: `Bearer ${token}` } }),
  getById: (id, token) => api.get(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  update: (id, data, token) => api.patch(`/users/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  delete: (id, token) => api.delete(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  updateRole: (id, data, token) => api.patch(`/users/${id}/role`, data, { headers: { Authorization: `Bearer ${token}` } }),
};

export { authAPI };
export default api;