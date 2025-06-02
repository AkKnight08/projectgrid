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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to auth page
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/auth';
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
export const tasksAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getByProject: async (projectId) => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      throw error;
    }
  },
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