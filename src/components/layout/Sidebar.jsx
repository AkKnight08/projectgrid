import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  FolderIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  UserIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Dashboard' },
  { path: '/projects', icon: FolderIcon, label: 'Projects' },
  { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  { path: '/analytics', icon: ChartBarIcon, label: 'Analytics' },
  { path: '/tasks', icon: ClipboardDocumentListIcon, label: 'Tasks' },
  // { path: '/teams', icon: UserGroupIcon, label: 'Teams' },
  { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
]

const Sidebar = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  // Dummy user info
  const user = { name: 'Akshay Kumar', role: 'Admin' }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 font-inter flex flex-col justify-between
        ${isCollapsed ? 'w-16' : 'w-[240px]'}
        bg-charcoalDeep border-r border-slateDark`}
    >
      {/* Top Section */}
      <div>
        {/* Logo/App Name */}
        <div className={`flex items-center justify-center ${isCollapsed ? 'mt-6' : 'mt-8'} mb-2`}>
          <span className={`text-white font-semibold ${isCollapsed ? 'text-xl' : 'text-[1.5rem]'}`}>TG</span>
        </div>
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mx-auto flex items-center justify-center w-8 h-8 rounded hover:bg-slateDark transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-textMuted" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-textMuted" />
          )}
        </button>
        {/* Main Navigation */}
        <nav className="mt-10 flex flex-col space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-4 h-12 px-6 text-[0.875rem] font-medium rounded-l-lg transition-colors relative
                  ${isActive || isActive
                    ? 'bg-[#3B3B5A] text-white border-l-4 border-accentBlue'
                    : 'text-textSecondary hover:bg-slateDark hover:text-white'}
                  ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                tabIndex={0}
                aria-label={item.label}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-accentBlue' : 'text-textMuted group-hover:text-white'} transition-colors`} />
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && (
                  <span className="sr-only">{item.label}</span>
                )}
              </NavLink>
            )
          })}
        </nav>
        {/* Section Divider */}
        <div className="h-px bg-slateDark my-4 mx-6" />
        {/* Quick Actions */}
        <div className={`flex flex-col space-y-2 ${isCollapsed ? 'items-center' : 'px-4'}`}>
          <button
            className={`flex items-center justify-center w-full h-10 bg-accentBlue text-white font-semibold rounded-md text-[0.875rem] hover:bg-[#2563EB] transition-colors ${isCollapsed ? 'w-10' : ''}`}
            tabIndex={0}
            aria-label="New Project"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {!isCollapsed && <span>New Project</span>}
          </button>
          <button
            className={`flex items-center justify-center w-full h-10 bg-accentEmerald text-white font-semibold rounded-md text-[0.875rem] hover:bg-[#047857] transition-colors ${isCollapsed ? 'w-10' : ''}`}
            tabIndex={0}
            aria-label="New Task"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {!isCollapsed && <span>New Task</span>}
          </button>
        </div>
      </div>
      {/* Bottom Section: User Profile */}
      <div className={`mb-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <button
          className={`w-full flex items-center h-16 rounded-md hover:bg-slateDark transition-colors px-2 ${isCollapsed ? 'justify-center' : ''}`}
          tabIndex={0}
          aria-label="User menu"
        >
          <div className="h-8 w-8 rounded-full border-2 border-[#3A3A4F] flex items-center justify-center bg-accentBlue text-white font-medium">
            {user.name[0]}
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex flex-col items-start">
              <span className="text-[0.875rem] font-medium text-white">{user.name}</span>
              <span className="text-[0.75rem] text-textMuted">{user.role}</span>
            </div>
          )}
          <span className="ml-auto text-textMuted text-xs">⌄</span>
        </button>
        {/* Dropdown (not implemented for brevity, but should match navbar style) */}
      </div>
    </aside>
  )
}

export default Sidebar