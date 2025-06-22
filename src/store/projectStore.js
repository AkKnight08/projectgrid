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

const calculateProjectProgress = (project) => {
  if (!project.tasks || project.tasks.length === 0) {
    return 0
  }
  const completedTasks = project.tasks.filter(t => t.status === 'completed' || t.status === 'done').length
  return Math.round((completedTasks / project.tasks.length) * 100)
}

const calculateGlobalMetrics = (projects) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const currentProjects = projects;
  const previousProjects = projects.filter(p => new Date(p.createdAt) < thirtyDaysAgo);

  const calculateMetricsForPeriod = (projectList) => {
    if (!projectList || projectList.length === 0) {
      return {
        totalProjects: 0,
        totalTasks: 0,
        completedProjects: 0,
        completedTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
      };
    }

    const totalProjects = projectList.length;
    const completedProjects = projectList.filter(p => p.status === 'completed').length;
    
    const allTasks = projectList.flatMap(p => p.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'completed' || t.status === 'done').length;

    const overdueTasks = allTasks.filter(t => {
        if ((t.status !== 'completed' && t.status !== 'done') && t.dueDate) {
            return new Date(t.dueDate) < new Date();
        }
        return false;
    }).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
        totalProjects,
        totalTasks,
        completedProjects,
        completedTasks,
        overdueTasks,
        completionRate,
    };
  };

  return {
    current: calculateMetricsForPeriod(currentProjects),
    previous: calculateMetricsForPeriod(previousProjects),
  };
}

export const useProjectStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      
      fetchProjects: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await projectsAPI.getAll()
          const projects = response.data.projects || response.data || [];
          
          if (!Array.isArray(projects)) {
            console.error('Invalid response format from server: projects is not an array', response.data)
            throw new Error('Invalid response format from server.')
          }
          
          const projectsWithProgress = projects.map(p => ({
            ...p,
            progress: calculateProjectProgress(p),
          }))

          set({ 
            projects: projectsWithProgress, 
            metrics: calculateGlobalMetrics(projectsWithProgress),
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch projects',
            isLoading: false,
            projects: [] // Clear projects on error
          })
        }
      },
      
      fetchProjectById: async (id) => {
        if (!id) return
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
          set(state => {
            const newProjects = [...state.projects, response.data];
            return {
              projects: newProjects,
              metrics: calculateGlobalMetrics(newProjects),
              isLoading: false
            }
          })
          return response.data
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to create project',
            isLoading: false 
          })
          throw error
        }
      },
      
      updateProject: async (id, projectData) => {
        try {
          const response = await projectsAPI.update(id, projectData)
          const updatedProject = response.data;
          
          set(state => {
            const projects = state.projects.map(p => {
              if (p._id === id) {
                const newProjectData = { ...p, ...updatedProject }
                return {
                  ...newProjectData,
                  progress: calculateProjectProgress(newProjectData),
                }
              }
              return p
            })
            const currentProject = state.currentProject?._id === id
              ? { ...state.currentProject, ...updatedProject, progress: calculateProjectProgress({ ...state.currentProject, ...updatedProject }) }
              : state.currentProject

            return {
              projects,
              currentProject,
              metrics: calculateGlobalMetrics(projects),
              isLoading: false,
            }
          })
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
          set(state => {
            const newProjects = state.projects.filter(p => p._id !== id);
            return {
              projects: newProjects,
              currentProject: state.currentProject?._id === id ? null : state.currentProject,
              metrics: calculateGlobalMetrics(newProjects),
              isLoading: false
            }
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
          const response = await projectsAPI.addMember(projectId, { userId, role })
          const updatedProject = response.data;
          set(state => {
            const projects = state.projects.map(p => (p._id === projectId ? updatedProject : p));
            return {
              projects,
              currentProject: state.currentProject?._id === projectId ? updatedProject : state.currentProject,
              metrics: calculateGlobalMetrics(projects),
            };
          });
          return updatedProject;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to add member',
            isLoading: false,
          });
          throw error;
        }
      },
      
      removeMember: async (projectId, userId) => {
        try {
          const response = await projectsAPI.removeMember(projectId, userId)
          const updatedProject = response.data;
          set(state => {
            const projects = state.projects.map(p => (p._id === projectId ? updatedProject : p));
            return {
              projects,
              currentProject: state.currentProject?._id === projectId ? updatedProject : state.currentProject,
              metrics: calculateGlobalMetrics(projects),
            };
          });
          return updatedProject;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to remove member',
            isLoading: false,
          });
          throw error;
        }
      },
      
      addTask: (projectId, task) => {
        set(state => {
          const projects = state.projects.map(project =>
            project._id === projectId
              ? {
                  ...project,
                  tasks: [...(project.tasks || []), { ...task, _id: crypto.randomUUID() }]
                }
              : project
          );
          return { projects, metrics: calculateGlobalMetrics(projects) };
        });
      },
      
      updateTask: (projectId, taskId, updates) => {
        set(state => {
          const projects = state.projects.map(project =>
            project._id === projectId
              ? {
                  ...project,
                  tasks: (project.tasks || []).map(task =>
                    task._id === taskId ? { ...task, ...updates } : task
                  )
                }
              : project
          );
          return { projects, metrics: calculateGlobalMetrics(projects) };
        });
      },
      
      deleteTask: (projectId, taskId) => {
        set(state => {
          const projects = state.projects.map(project =>
            project._id === projectId
              ? {
                  ...project,
                  tasks: (project.tasks || []).filter(task => task._id !== taskId)
                }
              : project
          );
          return { projects, metrics: calculateGlobalMetrics(projects) };
        });
      },
      
      reorderTasks: (projectId, taskIds) => {
        set(state => {
          const projects = state.projects.map(project =>
            project._id === projectId
              ? {
                  ...project,
                  tasks: taskIds.map(id =>
                    (project.tasks || []).find(task => task._id === id)
                  )
                }
              : project
          );
          return { projects };
        });
      },
      
      searchProjects: async (query) => {
        if (!query) {
          set({ searchResults: [], isSearching: false });
          return;
        }
        try {
          set({ isSearching: true, error: null });
          const response = await projectsAPI.search(query);
          set({ searchResults: response.data, isSearching: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to search projects',
            isSearching: false,
          });
        }
      },

      clearSearch: () => {
        set({ searchResults: [], isSearching: false })
      },
      
      reset: () => set(initialState),
      
      recalculateProgress: (projectId, updatedTask) => {
        set(state => {
          const newProjects = state.projects.map(p => {
            if (p._id === projectId) {
              const projectWithUpdatedTask = { ...p };
              if (updatedTask) {
                projectWithUpdatedTask.tasks = p.tasks.map(t => (t._id === updatedTask._id ? updatedTask : t));
              }
              return { ...projectWithUpdatedTask, progress: calculateProjectProgress(projectWithUpdatedTask) };
            }
            return p
          })
          return {
            projects: newProjects,
            metrics: calculateGlobalMetrics(newProjects)
          }
        })
      },

      updateTaskStatus: (projectId, taskId, status) => {
        set(state => {
            const projects = state.projects.map(p => {
                if (p._id === projectId) {
                    const tasks = p.tasks.map(t => t._id === taskId ? { ...t, status } : t);
                    const newProjectData = { ...p, tasks };
                    return {
                        ...newProjectData,
                        progress: calculateProjectProgress(newProjectData)
                    };
                }
                return p;
            });

            return { 
                projects,
                metrics: calculateGlobalMetrics(projects)
            };
        });
      },
    }),
    {
      name: 'project-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects || [],
        currentProject: state.currentProject
      })
    }
  )
) 