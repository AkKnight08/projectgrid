import { useState, useEffect, useMemo } from 'react'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import { useTheme } from '../context/ThemeContext'
import { BACKGROUND_COLORS, DARK_MODE_COLORS } from '../constants/colors'
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
  'not_started': '#9CA3AF',
  'in_progress': '#3B82F6',
  'completed': '#10B981',
  'on_hold': '#F59E0B',
  'archived': '#4B5563'
}

const PROGRESS_COLORS = {
  background: '#1F2937',
  text: {
    primary: '#F3F4F6',
    secondary: '#9CA3AF',
    accent: '#60A5FA'
  },
  progress: {
    background: '#374151',
    bar: {
      low: '#EF4444',    // red
      medium: '#F59E0B', // yellow
      high: '#10B981',   // green
      complete: '#3B82F6' // blue
    }
  },
  border: '#2E2E2E'
}

const PRIORITY_COLORS = {
  'critical': '#EF4444',
  'high': '#F97316',
  'medium': '#F59E0B',
  'low': '#34D399'
}

const Analytics = () => {
  const { theme } = useTheme()
  const { projects = [], fetchProjects, isLoading: projectsLoading, error: projectsError, metrics } = useProjectStore()
  const { tasks = [], fetchTasks, isLoading: tasksLoading, error: tasksError } = useTaskStore()
  
  // Fetch data on component mount
  useEffect(() => {
    console.log('Fetching projects and tasks...')
    fetchProjects()
    fetchTasks()
  }, [fetchProjects, fetchTasks])

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

  // Overview cards data
  const overviewCards = [
    {
      title: 'Total Projects',
      value: metrics.totalProjects || 0,
      icon: DocumentTextIcon,
      iconBg: colors.ACCENT_PURPLE + '20',
      iconColor: colors.ACCENT_PURPLE,
      trend: 'up',
      change: '12'
    },
    {
      title: 'Total Tasks',
      value: metrics.totalTasks || 0,
      icon: CheckCircleIcon,
      iconBg: colors.ACCENT_GREEN + '20',
      iconColor: colors.ACCENT_GREEN,
      trend: 'up',
      change: '8'
    },
    {
      title: 'Completion Rate',
      value: `${metrics.completionRate?.toFixed(1) || 0}%`,
      icon: ClockIcon,
      iconBg: colors.ACCENT_TEAL + '20',
      iconColor: colors.ACCENT_TEAL,
      trend: 'up',
      change: '5'
    },
    {
      title: 'Overdue Tasks',
      value: metrics.overdueTasks || 0,
      icon: ExclamationTriangleIcon,
      iconBg: colors.ACCENT_RED + '20',
      iconColor: colors.ACCENT_RED,
      trend: 'down',
      change: '3'
    }
  ]

  // Process data for charts
  const analyticsData = useMemo(() => {
    console.log('Processing analytics data with tasks:', tasks)
    console.log('Sample task:', tasks[0]) // Log first task to see structure
    
    // Project Completion Data with detailed metrics
    const projectCompletionData = projects.map(project => {
      const projectTasks = tasks.filter(task => task.project === project._id)
      const completedTasks = projectTasks.filter(task => task.status === 'completed')
      const inProgressTasks = projectTasks.filter(task => task.status === 'in_progress')
      const overdueTasks = projectTasks.filter(task => {
        if (task.status !== 'completed' && task.dueDate) {
          return new Date(task.dueDate) < new Date()
        }
        return false
      })

      const completionRate = projectTasks.length > 0 
        ? (completedTasks.length / projectTasks.length) * 100 
        : 0

      return {
        name: project.name,
        completionRate: Math.round(completionRate),
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        overdueTasks: overdueTasks.length,
        startDate: project.startDate,
        endDate: project.endDate
      }
    }).sort((a, b) => b.completionRate - a.completionRate)

    // Task Distribution Data with priority and assignee information
    const taskDistributionData = {
      byStatus: [
        { 
          name: 'Not Started', 
          value: tasks.filter(t => t.status === 'not_started' || t.status === 'not started').length,
          status: 'not_started'
        },
        { 
          name: 'In Progress', 
          value: tasks.filter(t => t.status === 'in_progress' || t.status === 'in progress').length,
          status: 'in_progress'
        },
        { 
          name: 'Completed', 
          value: tasks.filter(t => t.status === 'completed').length,
          status: 'completed'
        },
        { 
          name: 'On Hold', 
          value: tasks.filter(t => t.status === 'on_hold' || t.status === 'on hold').length,
          status: 'on_hold'
        }
      ].filter(item => item.value > 0), // Only show segments with values
      byPriority: [
        { name: 'Critical', value: tasks.filter(t => t.priority === 'critical').length },
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length }
      ].filter(item => item.value > 0),
      byAssignee: Object.entries(
        tasks.reduce((acc, task) => {
          if (task.assignee) {
            acc[task.assignee] = (acc[task.assignee] || 0) + 1
          }
          return acc
        }, {})
      ).map(([assignee, count]) => ({
        name: assignee,
        value: count
      }))
    }

    // Debug logs for Task Distribution
    console.log('Task Distribution Data:', {
      totalTasks: tasks.length,
      byStatus: taskDistributionData.byStatus,
      byPriority: taskDistributionData.byPriority,
      byAssignee: taskDistributionData.byAssignee
    })

    console.log('Status Colors:', STATUS_COLORS)
    console.log('Task Status Counts:', {
      notStarted: tasks.filter(t => t.status === 'not_started' || t.status === 'not started').length,
      inProgress: tasks.filter(t => t.status === 'in_progress' || t.status === 'in progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      onHold: tasks.filter(t => t.status === 'on_hold' || t.status === 'on hold').length
    })

    // Log all unique status values in tasks
    console.log('All unique task statuses:', [...new Set(tasks.map(t => t.status))])

    // Team Performance Data with detailed metrics
    const teamPerformanceData = projects.map(project => {
      const projectTasks = tasks.filter(task => task.project === project._id)
      const completedTasks = projectTasks.filter(task => task.status === 'completed')
      const onTimeTasks = completedTasks.filter(task => {
        const dueDate = parseISO(task.dueDate)
        const completionDate = parseISO(task.completedAt)
        return completionDate <= dueDate
      })

      const avgCompletionTime = completedTasks.length > 0
        ? completedTasks.reduce((acc, task) => {
            const start = new Date(task.createdAt)
            const end = new Date(task.completedAt)
            return acc + (end - start)
          }, 0) / completedTasks.length
        : 0

      return {
        name: project.name,
        completionRate: projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0,
        onTimeRate: completedTasks.length > 0 ? (onTimeTasks.length / completedTasks.length) * 100 : 0,
        avgCompletionTime: Math.round(avgCompletionTime / (1000 * 60 * 60 * 24)), // Convert to days
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length
      }
    })

    // Activity Tracking Data with detailed timeline
    const activityData = tasks
      .filter(task => task.status === 'completed')
      .map(task => ({
        date: format(parseISO(task.completedAt), 'MMM dd'),
        completed: 1,
        overdue: task.completedAt > task.dueDate ? 1 : 0,
        project: task.project,
        assignee: task.assignee,
        priority: task.priority
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    // Calculate daily activity metrics
    const dailyActivity = activityData.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = {
          completed: 0,
          overdue: 0,
          byPriority: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          }
        }
      }
      acc[curr.date].completed += curr.completed
      acc[curr.date].overdue += curr.overdue
      acc[curr.date].byPriority[curr.priority]++
      return acc
    }, {})

    const activityTimeline = Object.entries(dailyActivity).map(([date, metrics]) => ({
      date,
      ...metrics
    }))

    return {
      projectCompletionData,
      taskDistributionData,
      teamPerformanceData,
      activityData: activityTimeline
    }
  }, [projects, tasks])

  const isLoading = projectsLoading || tasksLoading
  const error = projectsError || tasksError

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

  return (
    <div className="h-screen bg-[#1E1E1E] p-6 pt-16 pb-12 overflow-hidden">
      {/* Page Title */}
      <div className="w-full h-full bg-[#1E1E1E] rounded-lg">
        <h1 className={`text-[1.5rem] font-semibold text-[${colors.TEXT_PRIMARY}] mb-6 italic`}>Analytics</h1>

        {/* Breadcrumbs */}
        <div className={`text-[0.875rem] text-[${colors.TEXT_SECONDARY}] mb-8`}>
          <span className={`hover:text-[${colors.TEXT_PRIMARY}] cursor-pointer`}>Dashboard</span>
          <span className="mx-2">/</span>
          <span>Analytics</span>
        </div>

        {/* Content Area */}
        <div className={`flex gap-8 bg-[#1E1E1E] rounded-lg mt-4 h-[calc(100%-8rem)]`}>
          {/* Main Content */}
          <div className={`flex-1 bg-[#1E1E1E] overflow-y-auto rounded-lg p-8`}>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {overviewCards.map((card, index) => (
                <div
                  key={index}
                  className={`p-6 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}]`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-medium text-[${colors.TEXT_SECONDARY}]`}>{card.title}</h3>
                    <div className={`p-2 rounded-lg bg-[${card.iconBg}]`}>
                      <card.icon className={`h-5 w-5 text-[${card.iconColor}]`} />
                    </div>
                  </div>
                  <p className={`text-2xl font-semibold text-[${colors.TEXT_PRIMARY}]`}>{card.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm ${card.trend === 'up' ? `text-[${colors.ACCENT_GREEN}]` : `text-[${colors.ACCENT_RED}]`}`}>
                      {card.trend === 'up' ? '↑' : '↓'} {card.change}%
                    </span>
                    <span className={`text-sm text-[${colors.TEXT_SECONDARY}] ml-2`}>vs last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Completion */}
              <div className={`p-6 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Project Completion</h3>
                <p className={`text-sm text-[${colors.TEXT_SECONDARY}] mb-4`}>
                  Track the progress of all your projects and identify areas that need attention.
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.projectCompletionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className={`p-3 bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-lg`}>
                                <p className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}]`}>{label}</p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Completion Rate: {data.completionRate}%
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Total Tasks: {data.totalTasks}
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Completed: {data.completedTasks}
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  In Progress: {data.inProgressTasks}
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Overdue: {data.overdueTasks}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Bar dataKey="completionRate" name="Completion Rate (%)" fill={colors.ACCENT_PURPLE} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Task Distribution */}
              <div className={`p-6 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Task Distribution</h3>
                <p className={`text-sm text-[${colors.TEXT_SECONDARY}] mb-4`}>
                  Monitor how tasks are distributed across different categories and team members.
                </p>
                <div className="h-64">
                  {console.log('Rendering Task Distribution Chart with data:', analyticsData.taskDistributionData.byStatus)}
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.taskDistributionData.byStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ name, percent }) => {
                          console.log('Rendering label for:', name, 'with percent:', percent)
                          return `${name} (${(percent * 100).toFixed(0)}%)`
                        }}
                      >
                        {analyticsData.taskDistributionData.byStatus.map((entry, index) => {
                          const color = STATUS_COLORS[entry.status] || '#9CA3AF'
                          console.log('Rendering segment for:', entry.name, 'with color:', color, 'status:', entry.status)
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={color}
                            />
                          )
                        })}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            console.log('Tooltip data:', data)
                            return (
                              <div className={`p-3 bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-lg`}>
                                <p className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}]`}>{data.name}</p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Tasks: {data.value}
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Percentage: {(data.percent * 100).toFixed(1)}%
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend 
                        layout="vertical" 
                        align="right"
                        verticalAlign="middle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Team Performance */}
              <div className={`p-6 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Team Performance</h3>
                <p className={`text-sm text-[${colors.TEXT_SECONDARY}] mb-4`}>
                  Analyze team productivity and identify opportunities for improvement.
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.teamPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className={`p-3 bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-lg`}>
                                <p className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}]`}>{label}</p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Completion Rate: {data.completionRate.toFixed(1)}%
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  On-Time Rate: {data.onTimeRate.toFixed(1)}%
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Avg. Completion Time: {data.avgCompletionTime} days
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="completionRate" name="Completion Rate (%)" stroke={colors.ACCENT_GREEN} />
                      <Line type="monotone" dataKey="onTimeRate" name="On-Time Rate (%)" stroke={colors.ACCENT_ORANGE} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Tracking */}
              <div className={`p-6 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Activity Tracking</h3>
                <p className={`text-sm text-[${colors.TEXT_SECONDARY}] mb-4`}>
                  Keep track of all project-related activities and updates in real-time.
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className={`p-3 bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-lg`}>
                                <p className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}]`}>{label}</p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Completed Tasks: {data.completed}
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Overdue Tasks: {data.overdue}
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Critical: {data.byPriority.critical}
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  High: {data.byPriority.high}
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Medium: {data.byPriority.medium}
                                </p>
                                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                                  Low: {data.byPriority.low}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="completed" name="Completed Tasks" stackId="1" stroke={colors.ACCENT_GREEN} fill={colors.ACCENT_GREEN + '40'} />
                      <Area type="monotone" dataKey="overdue" name="Overdue Tasks" stackId="1" stroke={colors.ACCENT_RED} fill={colors.ACCENT_RED + '40'} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={`w-[300px] bg-[${colors.CARD_INNER_BG}] rounded-lg p-6 sticky top-6 h-fit`}>
            <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Analytics Overview</h2>
            <div className="space-y-4">
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Project Completion</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Track the progress of all your projects and identify areas that need attention.
                </p>
              </div>
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Task Distribution</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Monitor how tasks are distributed across different categories and team members.
                </p>
              </div>
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Team Performance</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Analyze team productivity and identify opportunities for improvement.
                </p>
              </div>
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Activity Tracking</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Keep track of all project-related activities and updates in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics