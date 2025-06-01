import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: localStorage.getItem('token'),
      isLoading: false,
      error: null,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null })
          const response = await authAPI.login({ email, password })
          const { token, user } = response.data
          localStorage.setItem('token', token)
          set({ user, token, isLoading: false })
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          })
          return false
        }
      },

      register: async (email, password, displayName) => {
        try {
          set({ isLoading: true, error: null })
          const response = await authAPI.register({ email, password, displayName })
          const { token, user } = response.data
          localStorage.setItem('token', token)
          set({ user, token, isLoading: false })
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          })
          return false
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
      },

      getCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await authAPI.getCurrentUser()
          set({ user: response.data, isLoading: false })
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to get user data',
            isLoading: false,
          })
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
    }),
    {
      name: 'user-storage',
    }
  )
) 