import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authAPI from '../services/auth'
import { usersAPI } from '../services/api'

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('taskgrid_token'),
      isLoading: false,
      error: null,
      lastFetchTime: null,
      userCount: 0,

      fetchUserCount: async (isManual = false) => {
        if (isManual) {
          console.log('Manual fetch triggered for user count.');
        }
        try {
          console.log('Attempting to fetch user count...');
          const token = localStorage.getItem('taskgrid_token');
          if (!token) {
            console.warn('No token found for user count fetch.');
            return;
          }
          const response = await usersAPI.getCount(token);
          if (response && response.data) {
            console.log('Successfully fetched user count:', response.data.count);
            set({ userCount: response.data.count });
          } else {
            console.warn('User count response was empty.');
          }
        } catch (error) {
          console.error('Failed to fetch user count:', error);
        }
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null })
          const { token, user } = await authAPI.login(email, password)
          set({ user, token, isLoading: false, lastFetchTime: Date.now() })
          return true
        } catch (error) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          })
          return false
        }
      },

      register: async (email, password, name) => {
        try {
          set({ isLoading: true, error: null })
          
          // Validate input
          if (!email || !password || !name) {
            set({
              error: 'All fields are required',
              isLoading: false,
            })
            return false
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            set({
              error: 'Invalid email format',
              isLoading: false,
            })
            return false
          }

          // Validate password length
          if (password.length < 6) {
            set({
              error: 'Password must be at least 6 characters long',
              isLoading: false,
            })
            return false
          }

          const { token, user } = await authAPI.register({ email, password, name })
          set({ user, token, isLoading: false, lastFetchTime: Date.now() })
          return true
        } catch (error) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
          })
          return false
        }
      },

      logout: () => {
        authAPI.logout()
        set({ user: null, token: null, lastFetchTime: null })
      },

      getCurrentUser: async () => {
        const now = Date.now()
        const lastFetch = get().lastFetchTime
        if (lastFetch && now - lastFetch < 5 * 60 * 1000) {
          return get().user
        }

        set({ isLoading: true, error: null })
        try {
          const user = await authAPI.getCurrentUser()
          set({ user, isLoading: false, lastFetchTime: now })
          return user
        } catch (error) {
          set({
            error: error.message || 'Failed to get user data',
            isLoading: false,
          })
          throw error
        }
      },

      updateSettings: async (settings) => {
        try {
          set({ isLoading: true, error: null })
          const response = await authAPI.updateSettings(settings)
          set({ user: response.data, isLoading: false })
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to update settings',
            isLoading: false,
          })
          return false
        }
      },

      updateUserInfo: async (userData) => {
        try {
          set({ isLoading: true, error: null })
          const updatedUser = await authAPI.updateUserInfo(userData)
          set({ user: updatedUser, isLoading: false })
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to update profile',
            isLoading: false,
          })
          return false
        }
      },

      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true, error: null })
          await authAPI.changePassword(passwordData)
          set({ isLoading: false })
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to change password',
            isLoading: false,
          })
          return false
        }
      },

      updateAvatar: async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = async () => {
            try {
              const base64String = reader.result.split(',')[1];

              const { data: blob } = await api.post('/upload/avatar', {
                contents: base64String,
              });

              set((state) => ({
                user: { ...state.user, avatar: blob.url },
              }));

              // Update localStorage
              const localUser = JSON.parse(localStorage.getItem('taskgrid_user'));
              if (localUser) {
                localUser.avatar = blob.url;
                localStorage.setItem('taskgrid_user', JSON.stringify(localUser));
              }

              resolve({ success: true, url: blob.url });
            } catch (error) {
              console.error('Avatar upload failed:', error);
              const errorMessage = error.response?.data?.message || 'Upload failed.';
              resolve({ success: false, error: errorMessage });
            }
          };
          reader.onerror = (error) => {
            console.error('File reading error:', error);
            resolve({ success: false, error: 'Failed to read file.' });
          };
        });
      },

      deleteAccount: async () => {
        try {
          set({ isLoading: true, error: null })
          await authAPI.deleteAccount()
          set({ user: null, token: null, isLoading: false })
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to delete account',
            isLoading: false,
          })
          return false
        }
      },

      clearError: () => set({ error: null }),
      
      setUser: (user) => set({ user }),
      
      setToken: (token) => set({ token }),
    }),
    {
      name: 'user-storage',
    }
  )
) 