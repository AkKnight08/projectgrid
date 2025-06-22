import api from './api';

const TOKEN_KEY = 'taskgrid_token';
const USER_KEY = 'taskgrid_user';

const authAPI = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async resendVerification(email) {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async verifyEmail(verificationToken) {
    try {
      const response = await api.get(`/auth/verify-email/${verificationToken}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    console.log('--- AUTH SERVICE: LOGOUT ---');
    console.log('🚀 Initiating logout...');
    // Clear token and user data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('✅ Token and user removed from localStorage.');
    
    // Redirect to login page
    console.log('Redirecting to /login page.');
    window.location.href = '/login';
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
          const parsedUser = JSON.parse(cachedUser);
          console.log('Using cached user data:', parsedUser);
          return parsedUser;
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
      
      console.log('User data from server:', response.data);
      
      // Store the fetched user data
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      
      console.log('Current user fetched successfully:', {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        displayName: response.data.displayName
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
  },

  async checkDisplayName(displayName) {
    try {
      const response = await api.post('/auth/check-displayname', { displayName });
      return response.data;
    } catch (error) {
      // Don't throw for expected check failures, just return data
      return error.response?.data || { isAvailable: false, message: "Error checking name." };
    }
  },

  async updateUserInfo(userData) {
    const response = await api.patch('/auth/me', userData);
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.patch('/password/change', passwordData);
    return response.data;
  },

  async updateAvatar(formData) {
    try {
      const response = await api.patch('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Update the cached user data
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteAccount() {
    try {
      const response = await api.delete('/auth/account');
      // Clear local storage after successful deletion
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authAPI; 