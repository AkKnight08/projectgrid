import axios from 'axios';
import authAPI from './auth';

const TOKEN_KEY = 'taskgrid_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
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
  getAll: async () => {
    try {
      const response = await api.get('/projects');
      console.log('API response for getAll:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error.response?.data || error.message);
      throw error;
    }
  },

  search: async (query) => {
    try {
      const response = await api.get(`/projects/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching projects:', error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error.response?.data || error.message);
      throw error;
    }
  },

  create: async (projectData) => {
    try {
      console.log('Creating project with data:', projectData);
      const response = await api.post('/projects', projectData);
      console.log('Project creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error.response?.data || error.message);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  update: async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error('Error deleting project:', error.response?.data || error.message);
      throw error;
    }
  },
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
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, data) => api.patch(`/users/${id}/role`, data),
};

export { authAPI };
export default api; 