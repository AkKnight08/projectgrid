import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { projectsAPI } from '../services/api'

const initialState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null
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
          if (!response || !Array.isArray(response)) {
            console.error('Invalid response format:', response)
            throw new Error('Invalid response format from server')
          }
          set({ projects: response, isLoading: false })
          console.log('Updated projects in state:', response)
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
          const response = await projectsAPI.update(id, projectData)
          const currentState = get()
          
          set({
            projects: (currentState.projects || []).map(p => {
              if (p._id === id) {
                const layoutChanged = JSON.stringify(p.layout) !== JSON.stringify(response.data.layout)
                const statusChanged = p.status !== response.data.status
                if (!layoutChanged && !statusChanged) {
                  return p
                }
                return response.data
              }
              return p
            }),
            currentProject: currentState.currentProject?._id === id ? response.data : currentState.currentProject,
            isLoading: false
          })
          return response.data
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