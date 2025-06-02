import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authAPI from '../services/auth'

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('taskgrid_token'),
      isLoading: false,
      error: null,
      lastFetchTime: null,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null })
          const { user } = await authAPI.login(email, password)
          set({ user, isLoading: false, lastFetchTime: Date.now() })
          return true
        } catch (error) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          })
          return false
        }
      },

      register: async (email, password, displayName) => {
        try {
          set({ isLoading: true, error: null })
          
          // Validate input
          if (!email || !password || !displayName) {
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

          const { user } = await authAPI.register({ email, password, displayName })
          set({ user, isLoading: false, lastFetchTime: Date.now() })
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

      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-storage',
    }
  )
) 