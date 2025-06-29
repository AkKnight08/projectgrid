import { useState, useEffect } from 'react';
import QuickStats from '../components/QuickStats';
import ProjectGrid from '../components/ProjectGrid';
import DashboardStats from '../components/DashboardStats';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useTheme } from '../context/ThemeContext';
import { BACKGROUND_COLORS, DARK_MODE_COLORS } from '../constants/colors';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { projects, fetchProjects, isLoading, metrics } = useProjectStore();
  const { updateTask, tasks = [], fetchTasks, isLoading: tasksLoading } = useTaskStore();
  const { theme } = useTheme();

  useEffect(() => {
    fetchProjects();
    if (tasks.length === 0) {
      fetchTasks();
    }
  }, [fetchProjects]);

  const handleUpdateTask = async (projectId, taskId, updates) => {
    await updateTask(taskId, updates);
    // The projectStore is already set up to recalculate progress when a task is updated.
    // No need to call fetchProjects() again, which would be inefficient.
  };

  // Get colors based on current theme
  const colors = theme === 'dark' ? DARK_MODE_COLORS : {
    PAGE_BG: BACKGROUND_COLORS.MAIN,
    PANEL_BG: '#FFFFFF',
    CARD_INNER_BG: '#FFFFFF',
    BORDER: '#E5E5E5',
    TEXT_PRIMARY: '#1A1A1A',
    TEXT_SECONDARY: '#666666',
    TEXT_DISABLED: '#999999',
    ACCENT_PURPLE: '#7C3AED',
    ACCENT_TEAL: '#0D9488',
    ACCENT_ORANGE: '#D97706',
    ACCENT_RED: '#DC2626',
    ACCENT_GREEN: '#059669',
    ICON_DEFAULT: '#666666',
    ICON_HOVER: '#1A1A1A'
  };

  const currentMetrics = metrics?.current || {};
  const previousMetrics = metrics?.previous || {};

  // Calculate stats for QuickStats
  const stats = {
    totalProjects: currentMetrics.totalProjects || 0,
    tasksDueToday: projects.reduce((count, project) => {
      const today = new Date().toISOString().split('T')[0];
      return count + (project.tasks?.filter(task => task.dueDate?.split('T')[0] === today).length || 0);
    }, 0),
    overdueTasks: currentMetrics.overdueTasks || 0,
    overallProgress: currentMetrics.completionRate || 0,
  };

  // Calculate percentage changes
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0; // Avoid division by zero
    }
    return ((current - previous) / previous) * 100;
  };

  const percentageChanges = {
    totalProjects: calculatePercentageChange(currentMetrics.totalProjects, previousMetrics.totalProjects),
    overdueTasks: calculatePercentageChange(currentMetrics.overdueTasks, previousMetrics.overdueTasks),
    overallProgress: calculatePercentageChange(currentMetrics.completionRate, previousMetrics.completionRate),
  };

  // Format percentage for display
  const formatPercentage = (value) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${Math.round(value)}%`;
  };

  // Calculate total tasks left (not completed) as the sum of all non-completed tasks in all projects
  const totalTasksLeft = projects.reduce((sum, project) => sum + (project.tasks ? project.tasks.filter(task => task.status !== 'completed').length : 0), 0);

  return (
    <div className="bg-[#1E1E1E] p-6 pt-16 pb-12">
      {/* Page Title */}
      <div className="w-full bg-[#1E1E1E] rounded-lg">
        <h1 className={`text-[1.5rem] font-semibold text-[${colors.TEXT_PRIMARY}] mb-6 italic`}>Dashboard</h1>

        {/* Breadcrumbs */}
        <div className={`text-[0.875rem] text-[${colors.TEXT_SECONDARY}] mb-8`}>
          <span className={`hover:text-[${colors.TEXT_PRIMARY}] cursor-pointer`}>Dashboard</span>
        </div>

        {/* Content Area */}
        <div className={`flex gap-8 bg-[#1E1E1E] rounded-lg mt-4`}>
          {/* Main Content */}
          <div className={`flex-1 bg-[#1E1E1E] rounded-lg p-8`}>
            {/* Quick Stats */}
            <div className="flex flex-row gap-5 mb-8 w-full">
              {/* Total Projects Card */}
              <div className={`flex-1 bg-[${colors.CARD_INNER_BG}] rounded-xl p-6 border border-[${colors.BORDER}] hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium text-[${colors.TEXT_SECONDARY}]`}>Total Projects</h3>
                  <span className={`p-2 rounded-lg bg-[${colors.ACCENT_PURPLE}] bg-opacity-10`}>
                    <svg className="w-5 h-5 text-[${colors.ACCENT_PURPLE}]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold text-[${colors.TEXT_PRIMARY}]`}>{stats.totalProjects}</p>
                  <span className={`text-sm font-medium ${percentageChanges.totalProjects >= 0 ? `text-[${colors.ACCENT_GREEN}]` : `text-[${colors.ACCENT_RED}]`}`}>
                    {formatPercentage(percentageChanges.totalProjects)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">vs last month</p>
              </div>

              {/* Total Tasks Card */}
              <div className={`flex-1 bg-[${colors.CARD_INNER_BG}] rounded-xl p-6 border border-[${colors.BORDER}] hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium text-[${colors.TEXT_SECONDARY}]`}>Total Tasks Left</h3>
                  <span className={`p-2 rounded-lg bg-[${colors.ACCENT_BLUE} || '#3B82F6'] bg-opacity-10`}>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold text-[${colors.TEXT_PRIMARY}]`}>{isLoading ? '...' : totalTasksLeft}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tasks left (not completed)</p>
              </div>

              {/* Tasks Due Today Card */}
              <div className={`flex-1 bg-[${colors.CARD_INNER_BG}] rounded-xl p-6 border border-[${colors.BORDER}] hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium text-[${colors.TEXT_SECONDARY}]`}>Tasks Due Today</h3>
                  <span className={`p-2 rounded-lg bg-[${colors.ACCENT_ORANGE}] bg-opacity-10`}>
                    <svg className="w-5 h-5 text-[${colors.ACCENT_ORANGE}]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold text-[${colors.TEXT_PRIMARY}]`}>{stats.tasksDueToday}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">due today</p>
              </div>

              {/* Overdue Tasks Card */}
              <div className={`flex-1 bg-[${colors.CARD_INNER_BG}] rounded-xl p-6 border border-[${colors.BORDER}] hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium text-[${colors.TEXT_SECONDARY}]`}>Overdue Tasks</h3>
                  <span className={`p-2 rounded-lg bg-[${colors.ACCENT_RED}] bg-opacity-10`}>
                    <svg className="w-5 h-5 text-[${colors.ACCENT_RED}]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold text-[${colors.TEXT_PRIMARY}]`}>{stats.overdueTasks}</p>
                  <span className={`text-sm font-medium ${percentageChanges.overdueTasks >= 0 ? `text-[${colors.ACCENT_RED}]` : `text-[${colors.ACCENT_GREEN}]`}`}>
                    {formatPercentage(percentageChanges.overdueTasks)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">vs last month</p>
              </div>

              {/* Overall Progress Card */}
              <div className={`flex-1 bg-[${colors.CARD_INNER_BG}] rounded-xl p-6 border border-[${colors.BORDER}] hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium text-[${colors.TEXT_SECONDARY}]`}>Overall Progress</h3>
                  <span className={`p-2 rounded-lg bg-[${colors.ACCENT_TEAL}] bg-opacity-10`}>
                    <svg className="w-5 h-5 text-[${colors.ACCENT_TEAL}]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold text-[${colors.TEXT_PRIMARY}]`}>{stats.overallProgress}%</p>
                  <span className={`text-sm font-medium ${percentageChanges.overallProgress >= 0 ? `text-[${colors.ACCENT_GREEN}]` : `text-[${colors.ACCENT_RED}]`}`}>
                    {formatPercentage(percentageChanges.overallProgress)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">vs last month</p>
              </div>
            </div>

            {/* Projects Grid */}
            <div className={`bg-[${colors.CARD_INNER_BG}] rounded-lg shadow-lg p-6 min-h-[400px]`}>
              {isLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${colors.ACCENT_PURPLE}]`}></div>
                </div>
              ) : (
                <ProjectGrid
                  projects={projects}
                  searchQuery={searchQuery}
                  viewMode="grid"
                  onUpdateTask={handleUpdateTask}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
