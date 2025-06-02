import { useState, useEffect } from 'react'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import { useTheme } from '../context/ThemeContext'
import { BACKGROUND_COLORS, DARK_MODE_COLORS } from '../constants/colors'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
  ViewColumnsIcon,
  ClockIcon,
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns'

const VIEW_TYPES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  LIST: 'list'
}

const STATUS_COLORS = {
  'not started': 'bg-gray-100 text-gray-800',
  'active': 'bg-blue-100 text-blue-800',
  'on hold': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'archived': 'bg-gray-100 text-gray-600'
}

const PRIORITY_COLORS = {
  'critical': 'bg-red-100 text-red-800',
  'high': 'bg-orange-100 text-orange-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'low': 'bg-green-100 text-green-800'
}

const CalendarView = () => {
  const { projects = [], fetchProjects, isLoading: projectsLoading, error: projectsError } = useProjectStore()
  const { tasks = [], fetchTasks, isLoading: tasksLoading, error: tasksError } = useTaskStore()
  const { theme } = useTheme()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState(VIEW_TYPES.MONTH)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    tags: [],
    collaborators: [],
    dateRange: { start: null, end: null },
    showMilestonesOnly: false
  })

  // Generate years for dropdown (10 years before and after current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

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
  }

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value)
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1))
  }

  useEffect(() => {
    console.log('CalendarView: Fetching projects and tasks...');
    fetchProjects()
    fetchTasks()
  }, []) // Empty dependency array since we only want to fetch once on mount

  useEffect(() => {
    console.log('CalendarView: Projects updated:', projects);
    // Log project dates for debugging
    projects.forEach(project => {
      console.log(`Project ${project.name}:`, {
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status
      });
    });
  }, [projects]);

  const isLoading = projectsLoading || tasksLoading
  const error = projectsError || tasksError

  // Navigation handlers
  const goToPrevious = () => {
    switch (currentView) {
      case VIEW_TYPES.MONTH:
        setCurrentDate(prev => subMonths(prev, 1))
        break
      case VIEW_TYPES.WEEK:
        setCurrentDate(prev => subDays(prev, 7))
        break
      case VIEW_TYPES.DAY:
        setCurrentDate(prev => subDays(prev, 1))
        break
      default:
        break
    }
  }

  const goToNext = () => {
    switch (currentView) {
      case VIEW_TYPES.MONTH:
        setCurrentDate(prev => addMonths(prev, 1))
        break
      case VIEW_TYPES.WEEK:
        setCurrentDate(prev => addDays(prev, 7))
        break
      case VIEW_TYPES.DAY:
        setCurrentDate(prev => addDays(prev, 1))
        break
      default:
        break
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      tags: [],
      collaborators: [],
      dateRange: { start: null, end: null },
      showMilestonesOnly: false
    })
  }

  // Render header with navigation and view toggles
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <button
            onClick={goToPrevious}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md border border-gray-300 dark:border-gray-600`}
            title="Previous Month"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={goToNext}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md border-t border-r border-b border-gray-300 dark:border-gray-600`}
            title="Next Month"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h2 className={`text-xl font-semibold text-[${colors.TEXT_PRIMARY}]`}>
              {format(currentDate, 'MMMM')}
            </h2>
            <select
              value={currentDate.getFullYear()}
              onChange={handleYearChange}
              className={`text-xl font-semibold bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer text-[${colors.TEXT_PRIMARY}] hover:text-[${colors.ACCENT_PURPLE}]`}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={goToToday}
            className={`px-3 py-1 text-sm bg-[${colors.ACCENT_PURPLE}] text-white rounded-md hover:bg-opacity-90`}
          >
            Today
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentView(VIEW_TYPES.MONTH)}
          className={`p-2 rounded-md ${currentView === VIEW_TYPES.MONTH ? `bg-[${colors.ACCENT_PURPLE}] text-white` : `text-[${colors.TEXT_SECONDARY}] hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentView(VIEW_TYPES.WEEK)}
          className={`p-2 rounded-md ${currentView === VIEW_TYPES.WEEK ? `bg-[${colors.ACCENT_PURPLE}] text-white` : `text-[${colors.TEXT_SECONDARY}] hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <ViewColumnsIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentView(VIEW_TYPES.DAY)}
          className={`p-2 rounded-md ${currentView === VIEW_TYPES.DAY ? `bg-[${colors.ACCENT_PURPLE}] text-white` : `text-[${colors.TEXT_SECONDARY}] hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <ClockIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentView(VIEW_TYPES.LIST)}
          className={`p-2 rounded-md ${currentView === VIEW_TYPES.LIST ? `bg-[${colors.ACCENT_PURPLE}] text-white` : `text-[${colors.TEXT_SECONDARY}] hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <ListBulletIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-md ${showFilters ? `bg-[${colors.ACCENT_PURPLE}] text-white` : `text-[${colors.TEXT_SECONDARY}] hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <FunnelIcon className="h-5 w-5" />
        </button>
        <button
          className={`p-2 bg-[${colors.ACCENT_PURPLE}] text-white rounded-md hover:bg-opacity-90`}
          title="Add New Project"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )

  // Render filter panel
  const renderFilterPanel = () => (
    <div className={`mb-6 transition-all duration-200 ${showFilters ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
      <div className={`bg-[${colors.PANEL_BG}] rounded-lg shadow p-4 border border-[${colors.BORDER}]`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className={`block text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-1`}>Status</label>
            <select
              multiple
              value={filters.status}
              onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value))}
              className={`mt-1 block w-full rounded-md border-[${colors.BORDER}] shadow-sm focus:border-[${colors.ACCENT_PURPLE}] focus:ring-[${colors.ACCENT_PURPLE}] bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}]`}
            >
              <option value="not started">Not Started</option>
              <option value="active">Active</option>
              <option value="on hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className={`block text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-1`}>Priority</label>
            <select
              multiple
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', Array.from(e.target.selectedOptions, option => option.value))}
              className={`mt-1 block w-full rounded-md border-[${colors.BORDER}] shadow-sm focus:border-[${colors.ACCENT_PURPLE}] focus:ring-[${colors.ACCENT_PURPLE}] bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}]`}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className={`block text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-1`}>Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                className={`mt-1 block w-full rounded-md border-[${colors.BORDER}] shadow-sm focus:border-[${colors.ACCENT_PURPLE}] focus:ring-[${colors.ACCENT_PURPLE}] bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}]`}
              />
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                className={`mt-1 block w-full rounded-md border-[${colors.BORDER}] shadow-sm focus:border-[${colors.ACCENT_PURPLE}] focus:ring-[${colors.ACCENT_PURPLE}] bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}]`}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showMilestonesOnly"
              checked={filters.showMilestonesOnly}
              onChange={(e) => handleFilterChange('showMilestonesOnly', e.target.checked)}
              className={`h-4 w-4 text-[${colors.ACCENT_PURPLE}] focus:ring-[${colors.ACCENT_PURPLE}] border-[${colors.BORDER}] rounded`}
            />
            <label htmlFor="showMilestonesOnly" className={`ml-2 block text-sm text-[${colors.TEXT_PRIMARY}]`}>
              Show Milestones Only
            </label>
          </div>
          <button
            onClick={clearFilters}
            className={`text-sm text-[${colors.ACCENT_PURPLE}] hover:text-opacity-80`}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    console.log('Rendering month view with projects:', projects);
    console.log('Current month:', format(monthStart, 'MMMM yyyy'));

    return (
      <div className={`grid grid-cols-7 gap-px bg-[${colors.BORDER}] rounded-lg overflow-hidden`}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={`bg-[${colors.PANEL_BG}] p-2 text-center text-sm font-medium text-[${colors.TEXT_PRIMARY}]`}>
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)
          const dayProjects = (projects || []).filter(project => {
            // If project has no dates, show it in the current month
            if (!project?.startDate && !project?.endDate) {
              return isSameMonth(day, currentDate);
            }
            // If only one date is set, use it for both start and end
            const projectStart = new Date(project.startDate || project.endDate)
            const projectEnd = new Date(project.endDate || project.startDate)
            const isInRange = day >= projectStart && day <= projectEnd;
            if (isInRange) {
              console.log(`Project ${project.name} is in range for ${format(day, 'yyyy-MM-dd')}`);
            }
            return isInRange;
          })

          console.log(`Day ${format(day, 'yyyy-MM-dd')} projects:`, dayProjects);

          return (
            <div
              key={day.toString()}
              className={`min-h-[100px] p-2 bg-[${colors.PANEL_BG}] ${
                !isCurrentMonth ? `text-[${colors.TEXT_DISABLED}]` : ''
              } ${isCurrentDay ? `ring-2 ring-[${colors.ACCENT_PURPLE}]` : ''}`}
            >
              <div className={`text-sm font-medium mb-1 text-[${colors.TEXT_PRIMARY}]`}>{format(day, 'd')}</div>
              <div className="space-y-1">
                {dayProjects.slice(0, 3).map(project => (
                  <div
                    key={project._id}
                    className={`text-xs p-1 rounded truncate ${STATUS_COLORS[project.status] || `bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}]`}`}
                    title={`${project.name} (${project.status})`}
                  >
                    {project.name}
                  </div>
                ))}
                {dayProjects.length > 3 && (
                  <div className={`text-xs text-[${colors.ACCENT_PURPLE}] cursor-pointer`}>
                    +{dayProjects.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })

    return (
      <div className={`grid grid-cols-7 gap-px bg-[${colors.BORDER}] rounded-lg overflow-hidden`}>
        {days.map(day => {
          const isCurrentDay = isToday(day)
          const dayProjects = (projects || []).filter(project => {
            // If project has no dates, show it in the current week
            if (!project?.startDate && !project?.endDate) {
              return day >= weekStart && day <= addDays(weekStart, 6);
            }
            // If only one date is set, use it for both start and end
            const projectStart = new Date(project.startDate || project.endDate)
            const projectEnd = new Date(project.endDate || project.startDate)
            return day >= projectStart && day <= projectEnd
          })

          return (
            <div
              key={day.toString()}
              className={`min-h-[200px] p-2 bg-[${colors.PANEL_BG}] ${isCurrentDay ? `ring-2 ring-[${colors.ACCENT_PURPLE}]` : ''}`}
            >
              <div className={`text-sm font-medium mb-2 text-[${colors.TEXT_PRIMARY}]`}>
                {format(day, 'EEE d')}
              </div>
              <div className="space-y-1">
                {dayProjects.map(project => (
                  <div
                    key={project._id}
                    className={`text-xs p-1 rounded truncate ${STATUS_COLORS[project.status] || `bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}]`}`}
                    title={`${project.name} (${project.status})`}
                  >
                    {project.name}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render day view
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayProjects = (projects || []).filter(project => {
      // If project has no dates, show it in the current day
      if (!project?.startDate && !project?.endDate) {
        return isSameDay(currentDate, new Date());
      }
      // If only one date is set, use it for both start and end
      const projectStart = new Date(project.startDate || project.endDate)
      const projectEnd = new Date(project.endDate || project.startDate)
      return isSameDay(currentDate, projectStart) || isSameDay(currentDate, projectEnd)
    })

    return (
      <div className={`grid grid-cols-1 gap-px bg-[${colors.BORDER}] rounded-lg overflow-hidden`}>
        {hours.map(hour => (
          <div key={hour} className={`bg-[${colors.PANEL_BG}] p-2 min-h-[60px]`}>
            <div className={`text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
              {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
            </div>
            <div className="space-y-1">
              {dayProjects.map(project => (
                <div
                  key={project._id}
                  className={`text-xs p-1 rounded truncate ${STATUS_COLORS[project.status] || `bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}]`}`}
                  title={`${project.name} (${project.status})`}
                >
                  {project.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render list view
  const renderListView = () => {
    const sortedProjects = [...(projects || [])].sort((a, b) => {
      if (!a?.endDate || !b?.endDate) return 0;
      return new Date(a.endDate) - new Date(b.endDate)
    })

    return (
      <div className={`bg-[${colors.PANEL_BG}] rounded-lg shadow overflow-hidden border border-[${colors.BORDER}]`}>
        <table className="min-w-full divide-y divide-[${colors.BORDER}]">
          <thead className={`bg-[${colors.CARD_INNER_BG}]`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium text-[${colors.TEXT_SECONDARY}] uppercase tracking-wider`}>
                Project
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium text-[${colors.TEXT_SECONDARY}] uppercase tracking-wider`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium text-[${colors.TEXT_SECONDARY}] uppercase tracking-wider`}>
                Priority
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium text-[${colors.TEXT_SECONDARY}] uppercase tracking-wider`}>
                Deadline
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-[${colors.BORDER}]`}>
            {sortedProjects.map(project => (
              <tr key={project._id} className={`hover:bg-[${colors.CARD_INNER_BG}]`}>
                <td className={`px-6 py-4 whitespace-nowrap`}>
                  <div className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}]`}>{project.name}</div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap`}>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[project.status] || `bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}]`}`}>
                    {project.status}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap`}>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${PRIORITY_COLORS[project.priority] || `bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}]`}`}>
                    {project.priority}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-[${colors.TEXT_SECONDARY}]`}>
                  {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'No deadline'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-[${colors.ACCENT_PURPLE}]`}></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-[${colors.ACCENT_RED}] text-center p-4`}>
        {error}
        <button
          onClick={() => {
            fetchProjects()
            fetchTasks()
          }}
          className={`ml-4 text-[${colors.ACCENT_PURPLE}] hover:text-opacity-80`}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#1E1E1E] p-6 pt-16 pb-12 overflow-hidden">
      {/* Page Title */}
      <div className="w-full h-full bg-[#1E1E1E] rounded-lg">
        <h1 className={`text-[1.5rem] font-semibold text-[${colors.TEXT_PRIMARY}] mb-6 italic`}>Calendar</h1>

        {/* Breadcrumbs */}
        <div className={`text-[0.875rem] text-[${colors.TEXT_SECONDARY}] mb-8`}>
          <span className={`hover:text-[${colors.TEXT_PRIMARY}] cursor-pointer`}>Dashboard</span>
          <span className="mx-2">/</span>
          <span>Calendar</span>
        </div>

        {/* Content Area */}
        <div className={`flex gap-8 bg-[#1E1E1E] rounded-lg mt-4 h-[calc(100%-8rem)]`}>
          {/* Main Content */}
          <div className={`flex-1 bg-[#1E1E1E] overflow-y-auto rounded-lg p-8`}>
            {renderHeader()}
            {renderFilterPanel()}
            
            <div className="mt-4">
              {currentView === VIEW_TYPES.MONTH && renderMonthView()}
              {currentView === VIEW_TYPES.WEEK && renderWeekView()}
              {currentView === VIEW_TYPES.DAY && renderDayView()}
              {currentView === VIEW_TYPES.LIST && renderListView()}
            </div>
          </div>

          {/* Sidebar */}
          <div className={`w-[300px] bg-[${colors.CARD_INNER_BG}] rounded-lg p-6 sticky top-6 h-fit`}>
            <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Calendar Overview</h2>
            <div className="space-y-4">
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Month View</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  View all your projects and tasks in a monthly calendar format.
                </p>
              </div>
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Week View</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Focus on your weekly schedule and upcoming deadlines.
                </p>
              </div>
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Day View</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Get a detailed view of your daily tasks and appointments.
                </p>
              </div>
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>List View</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  See all your tasks in a chronological list format.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView 