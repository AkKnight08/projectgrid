import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { projectsAPI } from '../services/api'

const initialState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  metrics: {
    totalProjects: 0,
    totalTasks: 0,
    completedProjects: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  }
}

export const useProjectStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      
      fetchProjects: async () => {
        try {
          set({ isLoading: true, error: null, projects: [] })
          console.log('Fetching projects...')
          const response = await projectsAPI.getAll()
          console.log('Fetched projects:', response)
          if (!response || !response.projects || !Array.isArray(response.projects)) {
            console.error('Invalid response format:', response)
            throw new Error('Invalid response format from server')
          }
          set({ 
            projects: response.projects, 
            metrics: response.metrics,
            isLoading: false 
          })
          console.log('Updated projects in state:', response.projects)
        } catch (error) {
          console.error('Error fetching projects:', error)
          set({ 
            error: error.response?.data?.message || 'Failed to fetch projects',
            isLoading: false,
            projects: [] // Clear projects on error
          })
        }
      },
      
      fetchProjectById: async (id) => {
        try {
          set({ isLoading: true, error: null })
          const response = await projectsAPI.getById(id)
          set({ currentProject: response, isLoading: false })
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
          console.log('Creating project with data:', projectData)
          const response = await projectsAPI.create(projectData)
          console.log('Project created successfully:', response)
          const currentState = get()
          console.log('Current projects in state:', currentState.projects)
          const updatedProjects = [...(currentState.projects || []), response]
          set({
            projects: updatedProjects,
            isLoading: false
          })
          console.log('Updated projects in state:', updatedProjects)
          return response
        } catch (error) {
          console.error('Error creating project:', error)
          set({ 
            error: error.response?.data?.message || 'Failed to create project',
            isLoading: false 
          })
          throw error
        }
      },
      
      updateProject: async (id, projectData) => {
        try {
          set({ isLoading: true, error: null })
          const updatedProject = await projectsAPI.update(id, projectData)
          
          set(state => ({
            projects: state.projects.map(p => 
              p._id === id ? { ...p, ...updatedProject } : p
            ),
            currentProject: state.currentProject?._id === id ? { ...state.currentProject, ...updatedProject } : state.currentProject,
            isLoading: false
          }))
          return updatedProject
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to update project',
            isLoading: false 
          })
          throw error
        }
      },
      
      deleteProject: async (id) => {
        try {
          set({ isLoading: true, error: null })
          await projectsAPI.delete(id)
          const currentState = get()
          set({
            projects: (currentState.projects || []).filter(p => p._id !== id),
            currentProject: currentState.currentProject?._id === id ? null : currentState.currentProject,
            isLoading: false
          })
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to delete project',
            isLoading: false 
          })
          throw error
        }
      },
      
      addMember: async (projectId, userId, role) => {
        try {
          set({ isLoading: true, error: null })
          const response = await projectsAPI.addMember(projectId, { userId, role })
          const currentState = get()
          set({
            projects: (currentState.projects || []).map(project =>
              project._id === projectId ? response.data : project
            ),
            currentProject: response.data,
            isLoading: false,
          })
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
          const currentState = get()
          set({
            projects: (currentState.projects || []).map(project =>
              project._id === projectId ? response.data : project
            ),
            currentProject: response.data,
            isLoading: false,
          })
          return true
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to remove member',
            isLoading: false,
          })
          return false
        }
      },
      
      addTask: (projectId, task) => {
        const currentState = get()
        set({
          projects: (currentState.projects || []).map(project =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: [...(project.tasks || []), { ...task, id: crypto.randomUUID() }]
                }
              : project
          )
        })
      },
      
      updateTask: (projectId, taskId, updates) => {
        const currentState = get()
        set({
          projects: (currentState.projects || []).map(project =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: (project.tasks || []).map(task =>
                    task.id === taskId ? { ...task, ...updates } : task
                  )
                }
              : project
          )
        })
      },
      
      deleteTask: (projectId, taskId) => {
        const currentState = get()
        set({
          projects: (currentState.projects || []).map(project =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: (project.tasks || []).filter(task => task.id !== taskId)
                }
              : project
          )
        })
      },
      
      reorderTasks: (projectId, taskIds) => {
        const currentState = get()
        set({
          projects: (currentState.projects || []).map(project =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: taskIds.map(id =>
                    (project.tasks || []).find(task => task.id === id)
                  )
                }
              : project
          )
        })
      },
      
      searchProjects: async (query) => {
        try {
          set({ isSearching: true, error: null })
          const results = await projectsAPI.search(query)
          set({ searchResults: results, isSearching: false })
          return results
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to search projects',
            isSearching: false,
            searchResults: []
          })
          throw error
        }
      },

      clearSearch: () => {
        set({ searchResults: [], isSearching: false })
      },
      
      reset: () => set(initialState)
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects || [],
        currentProject: state.currentProject
      })
    }
  )
) 