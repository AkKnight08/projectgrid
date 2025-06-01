import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      
      addProject: (project) => set((state) => ({
        projects: [...state.projects, { ...project, id: crypto.randomUUID() }]
      })),
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? { ...project, ...updates } : project
        )
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((project) => project.id !== id)
      })),
      
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