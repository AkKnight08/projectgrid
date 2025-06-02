import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useUserStore } from '../../store/userStore'
import { useProjectStore } from '../../store/projectStore'
import {
  HomeIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Calendar', to: '/calendar', icon: CalendarIcon },
  { name: 'Analytics', to: '/analytics', icon: ChartBarIcon },
]

const userNavigation = [
  { name: 'Profile', to: '/profile', icon: UserIcon },
]

const Sidebar = () => {
  const location = useLocation()
  const { user } = useUserStore()
  const { projects = [], fetchProjects, isLoading } = useProjectStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Filter out any null or invalid projects
  const validProjects = projects.filter(project => project && project._id && project.name)

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Dashboard' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { path: '/analytics', icon: ChartBarIcon, label: 'Analytics' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
  ]

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      <nav className="space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="px-4 mt-6">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Recent Projects
          </h3>
          <div className="mt-2 space-y-1">
            {isLoading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</div>
            ) : validProjects.length > 0 ? (
              validProjects.slice(0, 5).map((project) => (
                <NavLink
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">No projects yet</div>
            )}
          </div>
          <NavLink
            to="/projects/new"
            className="mt-2 flex items-center px-2 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 rounded-lg transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-3" />
            <span>New Project</span>
          </NavLink>
        </div>
      )}
    </div>
  )
}

export default Sidebar