import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { projectsAPI } from '../services/api'

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,
      
      fetchProjects: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await projectsAPI.getAll()
          set({ projects: response.data, isLoading: false })
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to fetch projects',
            isLoading: false,
          })
        }
      },
      
      fetchProjectById: async (id) => {
        try {
          set({ isLoading: true, error: null })
          const response = await projectsAPI.getById(id)
          set({ currentProject: response.data, isLoading: false })
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to fetch project',
            isLoading: false,
          })
        }
      },
      
      createProject: async (projectData) => {
        try {
          set({ isLoading: true, error: null })
          const response = await projectsAPI.create(projectData)
          set((state) => ({
            projects: [...state.projects, response.data],
            isLoading: false,
          }))
          return response.data
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to create project',
            isLoading: false,
          })
          return null
        }
      },
      
      updateProject: async (id, projectData) => {
        try {
          set({ isLoading: true, error: null })
          const response = await projectsAPI.update(id, projectData)
          set((state) => ({
            projects: state.projects.map((project) =>
              project._id === id ? response.data : project
            ),
            currentProject: response.data,
            isLoading: false,
          }))
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to update project',
            isLoading: false,
          })
          return false
        }
      },
      
      deleteProject: async (id) => {
        try {
          set({ isLoading: true, error: null })
          await projectsAPI.delete(id)
          set((state) => ({
            projects: state.projects.filter((project) => project._id !== id),
            currentProject: state.currentProject?._id === id ? null : state.currentProject,
            isLoading: false,
          }))
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to delete project',
            isLoading: false,
          })
          return false
        }
      },
      
      addMember: async (projectId, userId, role) => {
        try {
          set({ isLoading: true, error: null })
          const response = await projectsAPI.addMember(projectId, { userId, role })
          set((state) => ({
            projects: state.projects.map((project) =>
              project._id === projectId ? response.data : project
            ),
            currentProject: response.data,
            isLoading: false,
          }))
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to add member',
            isLoading: false,
          })
          return false
        }
      },
      
      removeMember: async (projectId, userId) => {
        try {
          set({ isLoading: true, error: null })
          const response = await projectsAPI.removeMember(projectId, userId)
          set((state) => ({
            projects: state.projects.map((project) =>
              project._id === projectId ? response.data : project
            ),
            currentProject: response.data,
            isLoading: false,
          }))
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to remove member',
            isLoading: false,
          })
          return false
        }
      },
      
      addTask: (projectId, task) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: [...(project.tasks || []), { ...task, id: crypto.randomUUID() }]
              }
            : project
        )
      })),
      
      updateTask: (projectId, taskId, updates) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: project.tasks.map((task) =>
                  task.id === taskId ? { ...task, ...updates } : task
                )
              }
            : project
        )
      })),
      
      deleteTask: (projectId, taskId) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: project.tasks.filter((task) => task.id !== taskId)
              }
            : project
        )
      })),
      
      reorderTasks: (projectId, taskIds) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: taskIds.map((id) =>
                  project.tasks.find((task) => task.id === id)
                )
              }
            : project
        )
      })),
    }),
    {
      name: 'project-storage',
    }
  )
) 