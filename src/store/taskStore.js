import { create } from 'zustand'
import { tasksAPI } from '../services/api'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null })
      const tasks = await tasksAPI.getAll()
      set({ tasks, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch tasks',
        isLoading: false 
      })
    }
  },

  fetchProjectTasks: async (projectId) => {
    try {
      set({ isLoading: true, error: null })
      const tasks = await tasksAPI.getByProject(projectId)
      set({ tasks, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch project tasks',
        isLoading: false 
      })
    }
  },

  createTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null })
      const task = await tasksAPI.create(taskData)
      set(state => ({
        tasks: [...state.tasks, task],
        isLoading: false
      }))
      return task
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create task',
        isLoading: false 
      })
      throw error
    }
  },

  updateTask: async (id, taskData) => {
    try {
      set({ isLoading: true, error: null })
      const task = await tasksAPI.update(id, taskData)
      set(state => ({
        tasks: state.tasks.map(t => 
          t._id === id ? task : t
        ),
        isLoading: false
      }))
      return task
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update task',
        isLoading: false 
      })
      throw error
    }
  },

  deleteTask: async (id) => {
    try {
      set({ isLoading: true, error: null })
      await tasksAPI.delete(id)
      set(state => ({
        tasks: state.tasks.filter(t => t._id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete task',
        isLoading: false 
      })
      throw error
    }
  }
})) 