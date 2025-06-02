import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import { useUserStore } from '../store/userStore'
import TaskList from '../components/tasks/TaskList'
import TaskForm from '../components/tasks/TaskForm'
import { 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  UserGroupIcon,
  TagIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { Tab } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHotkeys } from 'react-hotkeys-hook'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const ProjectDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentProject, fetchProjectById, updateProject, deleteProject, isLoading: projectLoading } = useProjectStore()
  const { tasks, fetchProjectTasks, createTask, updateTask, deleteTask, isLoading: tasksLoading } = useTaskStore()
  const { user } = useUserStore()
  
  // State management
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' | 'board' | 'timeline'
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    dateRange: 'all'
  })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchProjectById(id),
        fetchProjectTasks(id)
      ])
    }
    loadData()
  }, [id, fetchProjectById, fetchProjectTasks])

  // Set initial form values
  useEffect(() => {
    if (currentProject) {
      setEditedName(currentProject.name)
      setEditedDescription(currentProject.description)
    }
  }, [currentProject])

  // Keyboard shortcuts
  useHotkeys('t', () => setShowQuickAdd(true))
  useHotkeys('esc', () => {
    setShowQuickAdd(false)
    setIsEditing(false)
  })

  // Handlers
  const handleUpdateProject = async () => {
    try {
      await updateProject(id, {
        name: editedName,
        description: editedDescription
      })
      setIsEditing(false)
      toast.success('Project updated successfully')
    } catch (error) {
      console.error('Failed to update project:', error)
      toast.error('Failed to update project')
    }
  }

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id)
        navigate('/')
        toast.success('Project deleted successfully')
      } catch (error) {
        console.error('Failed to delete project:', error)
        toast.error('Failed to delete project')
      }
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Calculate task statistics
  const taskStats = useCallback(() => {
    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'completed').length
    const inProgress = tasks.filter(task => task.status === 'in-progress').length
    const todo = tasks.filter(task => task.status === 'todo').length

    return {
      total,
      completed,
      inProgress,
      todo,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    }
  }, [tasks])

  // Prepare chart data
  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'To Do'],
    datasets: [
      {
        data: [
          taskStats().completed,
          taskStats().inProgress,
          taskStats().todo
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(59, 130, 246, 0.8)',  // blue
          'rgba(234, 179, 8, 0.8)',   // yellow
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const taskPriorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [
          tasks.filter(task => task.priority === 'high').length,
          tasks.filter(task => task.priority === 'medium').length,
          tasks.filter(task => task.priority === 'low').length,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // red
          'rgba(234, 179, 8, 0.8)',    // yellow
          'rgba(34, 197, 94, 0.8)',    // green
        ],
      },
    ],
  }

  // Loading state
  if (projectLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Error state
  if (!currentProject) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Project not found
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="block w-full text-2xl font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-0"
                />
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="block w-full text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-0"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateProject}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {currentProject.name}
                  </h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    currentProject.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : currentProject.status === 'completed'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {currentProject.status}
                  </span>
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {currentProject.description}
                </p>
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteProject}
                className="p-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Project Meta */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Started {format(new Date(currentProject.startDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>Due {format(new Date(currentProject.endDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <UserGroupIcon className="w-4 h-4" />
              <span>{currentProject.members?.length || 0} members</span>
            </div>
            <div className="flex items-center gap-1">
              <ChartBarIcon className="w-4 h-4" />
              <span>{currentProject.tasks?.length || 0} tasks</span>
            </div>
          </div>

          {/* Tags */}
          {currentProject.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {currentProject.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Project Stats */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Completion Rate
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                          {taskStats().completionRate.toFixed(1)}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Tasks
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                          {taskStats().total}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        In Progress
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                          {taskStats().inProgress}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TagIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Completed
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                          {taskStats().completed}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Task Status</h3>
              <div className="h-64">
                <Pie data={taskStatusData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Task Priority</h3>
              <div className="h-64">
                <Bar data={taskPriorityData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left Panel - Project Info & Settings */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Project Details</h2>
              
              {/* Project Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user?.displayName || 'You'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</h3>
                  <div className="mt-2 space-y-2">
                    {currentProject.members?.map((member) => (
                      <div key={member._id} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {member.displayName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{member.displayName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Task Board */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Task Board Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-center justify-between">
                <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                  <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected
                          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-800 dark:hover:text-gray-200'
                        }`
                      }
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ListBulletIcon className="w-4 h-4" />
                        <span>List</span>
                      </div>
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected
                          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-800 dark:hover:text-gray-200'
                        }`
                      }
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Squares2X2Icon className="w-4 h-4" />
                        <span>Board</span>
                      </div>
                    </Tab>
                  </Tab.List>

                  {/* Task Board Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <Tab.Panels>
                      <Tab.Panel>
                        <TaskList
                          tasks={tasks}
                          onUpdateTask={updateTask}
                          onDeleteTask={deleteTask}
                        />
                      </Tab.Panel>
                      <Tab.Panel>
                        {/* Board view will be implemented here */}
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                          Board view coming soon
                        </div>
                      </Tab.Panel>
                    </Tab.Panels>
                  </div>
                </Tab.Group>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQuickAdd(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Task
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 flex flex-wrap gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-600 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-600 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filters.assignee}
                  onChange={(e) => handleFilterChange('assignee', e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-600 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Assignees</option>
                  <option value="me">Assigned to Me</option>
                  <option value="others">Assigned to Others</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Task Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Quick Add Task
                </h3>
                <TaskForm
                  projectId={id}
                  onSubmit={async (data) => {
                    await createTask(data)
                    setShowQuickAdd(false)
                  }}
                  onCancel={() => setShowQuickAdd(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectDetails 