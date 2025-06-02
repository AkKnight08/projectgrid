import api from './api';

const TOKEN_KEY = 'taskgrid_token';
const USER_KEY = 'taskgrid_user';

const authAPI = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout() {
    // Clear token and user data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Redirect to auth page
    window.location.href = '/auth';
  },

  async getCurrentUser() {
    try {
      // First check if we have a token
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        console.log('No token found in localStorage');
        return null;
      }

      // Try to get user from localStorage first
      const cachedUser = localStorage.getItem(USER_KEY);
      if (cachedUser) {
        try {
          return JSON.parse(cachedUser);
        } catch (e) {
          console.error('Error parsing cached user:', e);
        }
      }

      // If no cached user or parsing failed, fetch from server
      console.log('Fetching current user from server');
      const response = await api.get('/auth/me');
      
      if (!response.data) {
        console.log('No user data in response');
        return null;
      }
      
      // Store the fetched user data
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      
      console.log('Current user fetched successfully:', {
        id: response.data.id,
        email: response.data.email
      });
      
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      // If there's an auth error, clear the stored data
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authAPI; 