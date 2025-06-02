import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom'
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
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Dashboard' },
  { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  { path: '/analytics', icon: ChartBarIcon, label: 'Analytics' },
  { path: '/tasks', icon: ClipboardDocumentListIcon, label: 'Tasks' },
  // { path: '/teams', icon: UserGroupIcon, label: 'Teams' },
  { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
]

const MIN_WIDTH = 200
const MAX_WIDTH = 300

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const sidebarRef = useRef(null)
  const userMenuRef = useRef(null)
  // Dummy user info
  const user = { name: 'Akshay Kumar', role: 'Admin' }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleUserMenuClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/auth')
  }

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-[50px] left-0 h-[calc(100vh-50px)] z-30 transition-all duration-300 font-inter flex flex-col overflow-x-hidden
        ${isCollapsed ? 'w-16' : 'w-[250px]'}
        bg-charcoalDeep border-r border-slateDark`}
    >
      {/* Top Section */}
      <div className={`flex-1 overflow-y-auto relative pr-0`}>
        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="absolute right-3 top-3 flex items-center justify-center w-6 h-6 rounded-md bg-slateDark/50 hover:bg-slateDark transition-colors z-10"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-3.5 w-3.5 text-white opacity-70 hover:opacity-100 transition-opacity" />
          ) : (
            <ChevronLeftIcon className="h-3.5 w-3.5 text-white opacity-70 hover:opacity-100 transition-opacity" />
          )}
        </button>
        {/* Main Navigation */}
        <nav className="mt-12 flex flex-col space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-4 h-12 text-[0.875rem] font-medium rounded-l-lg transition-colors relative
                  ${isActive
                    ? 'bg-[#3B3B5A] text-white border-l-4 border-accentBlue'
                    : 'text-textSecondary hover:bg-slateDark hover:text-white'}
                  ${isCollapsed ? 'justify-center px-0' : 'px-6'}`
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
        <div className={`flex flex-col space-y-2 ${isCollapsed ? 'items-center px-0' : 'px-4'}`}>
          <Link
            to="/projects/new"
            className={`group flex items-center justify-center w-full h-10 bg-[#2A2A3B] border border-[#3A3A4F] text-white font-medium rounded-md text-[0.875rem] hover:bg-[#3B3B5A] hover:border-accentBlue/50 transition-all duration-200 ${isCollapsed ? 'w-10 px-0' : ''}`}
            tabIndex={0}
            aria-label="New Project"
          >
            <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-2'}`}>
              <div className="h-6 w-6 rounded-md bg-accentBlue/10 flex items-center justify-center group-hover:bg-accentBlue/20 transition-colors">
                <PlusIcon className="h-4 w-4 text-accentBlue" />
              </div>
              {!isCollapsed && <span className="text-textSecondary group-hover:text-white transition-colors">New Project</span>}
            </div>
          </Link>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar