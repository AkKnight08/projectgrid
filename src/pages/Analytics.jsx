import { useState, useEffect, useMemo } from 'react'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import { 
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { format, subDays, subMonths, isWithinInterval, parseISO } from 'date-fns'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area, ResponsiveContainer
} from 'recharts'

const STATUS_COLORS = {
  'not started': '#9CA3AF',
  'active': '#3B82F6',
  'on hold': '#F59E0B',
  'completed': '#10B981',
  'archived': '#4B5563'
}

const PRIORITY_COLORS = {
  'critical': '#EF4444',
  'high': '#F97316',
  'medium': '#F59E0B',
  'low': '#34D399'
}

const Analytics = () => {
  const { projects = [], fetchProjects, isLoading: projectsLoading, error: projectsError } = useProjectStore()
  const { tasks = [], fetchTasks, isLoading: tasksLoading, error: tasksError } = useTaskStore()
  
  // State for filters and controls
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    tags: [],
    collaborators: [],
    owner: null
  })
  const [drillDown, setDrillDown] = useState('status')

  useEffect(() => {
    fetchProjects()
    fetchTasks()
  }, []) // Empty dependency array since we only want to fetch once on mount

  // Compute analytics data
  const analyticsData = useMemo(() => {
    if (!projects?.length || !tasks?.length) return null

    // Filter data based on date range
    const filteredProjects = projects.filter(project => 
      project?.startDate && isWithinInterval(parseISO(project.startDate), {
        start: parseISO(dateRange.start),
        end: parseISO(dateRange.end)
      })
    )

    const filteredTasks = tasks.filter(task =>
      task?.dueDate && isWithinInterval(parseISO(task.dueDate), {
        start: parseISO(dateRange.start),
        end: parseISO(dateRange.end)
      })
    )

    // Calculate metrics
    const totalProjects = filteredProjects.length
    const totalTasks = filteredTasks.length
    const completedProjects = filteredProjects.filter(p => p?.status === 'completed').length
    const completedTasks = filteredTasks.filter(t => t?.status === 'completed').length
    const overdueTasks = filteredTasks.filter(t => 
      t?.status !== 'completed' && t?.dueDate && parseISO(t.dueDate) < new Date()
    ).length

    // Group data for charts
    const projectsByStatus = filteredProjects.reduce((acc, project) => {
      if (project?.status) {
        acc[project.status] = (acc[project.status] || 0) + 1
      }
      return acc
    }, {})

    const tasksByPriority = filteredTasks.reduce((acc, task) => {
      if (task?.priority) {
        acc[task.priority] = (acc[task.priority] || 0) + 1
      }
      return acc
    }, {})

    const tasksByStatus = filteredTasks.reduce((acc, task) => {
      if (task?.status) {
        acc[task.status] = (acc[task.status] || 0) + 1
      }
      return acc
    }, {})

    // Format data for charts
    const pieChartData = Object.entries(projectsByStatus).map(([name, value]) => ({
      name,
      value
    }))

    const barChartData = Object.entries(tasksByPriority).map(([name, value]) => ({
      name,
      value
    }))

    return {
      metrics: {
        totalProjects,
        totalTasks,
        completedProjects,
        completedTasks,
        overdueTasks,
        completionRate: totalProjects ? (completedProjects / totalProjects) * 100 : 0
      },
      charts: {
        pieChartData,
        barChartData
      }
    }
  }, [projects, tasks, dateRange])

  const isLoading = projectsLoading || tasksLoading
  const error = projectsError || tasksError

  // Render filter panel
  const renderFilterPanel = () => (
    <div className={`mb-6 transition-all duration-200 ${showFilters ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              multiple
              value={filters.status}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                status: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              multiple
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                priority: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setDrillDown('status')}
              className={`px-3 py-1 rounded-md text-sm ${
                drillDown === 'status' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              View by Status
            </button>
            <button
              onClick={() => setDrillDown('priority')}
              className={`px-3 py-1 rounded-md text-sm ${
                drillDown === 'priority' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              View by Priority
            </button>
          </div>
          <button
            onClick={() => {
              setFilters({
                status: [],
                priority: [],
                tags: [],
                collaborators: [],
                owner: null
              })
              setDateRange({
                start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
                end: format(new Date(), 'yyyy-MM-dd')
              })
            }}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Reset All Filters
          </button>
        </div>
      </div>
    </div>
  )

  // Render metrics cards
  const renderMetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* Total Projects */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Projects</p>
            <p className="text-2xl font-semibold text-gray-900">{analyticsData?.metrics.totalProjects || 0}</p>
          </div>
        </div>
      </div>

      {/* Total Tasks */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <CheckCircleIcon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Tasks</p>
            <p className="text-2xl font-semibold text-gray-900">{analyticsData?.metrics.totalTasks || 0}</p>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <ClockIcon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
            <p className="text-2xl font-semibold text-gray-900">
              {analyticsData?.metrics.completionRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Tasks */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
            <p className="text-2xl font-semibold text-gray-900">{analyticsData?.metrics.overdueTasks || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Render charts
  const renderCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Projects by Status Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Projects by Status</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analyticsData?.charts.pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analyticsData?.charts.pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks by Priority Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Priority</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData?.charts.barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {analyticsData?.charts.barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
        <button
          onClick={() => {
            fetchProjects()
            fetchTasks()
          }}
          className="ml-4 text-primary-600 hover:text-primary-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available for analytics.</h3>
          <p className="text-gray-500">Create or add projects and tasks to see analytics here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-md ${showFilters ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
          <button
            className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            title="Export Data"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {renderFilterPanel()}
      {renderMetricsCards()}
      {renderCharts()}
    </div>
  )
}

export default Analytics 