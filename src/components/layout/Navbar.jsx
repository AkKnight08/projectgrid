import { Fragment, useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  BellIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useUserStore } from '../../store/userStore'
import { projectsAPI } from '../../services/api'
import Sidebar from './Sidebar'

const Navbar = () => {
  const { user, logout } = useUserStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const unreadNotifications = 3 // example count
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search function
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearch()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await projectsAPI.search(searchQuery)
      console.log('Search results:', results)
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (projectId) => {
    setSearchQuery('')
    setShowResults(false)
    navigate(`/projects/${projectId}`)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  return (
    <>
      <nav 
        className="w-full fixed top-0 z-50 h-16 bg-gradient-to-r from-[#00D1B2] to-[#1EDD9A] shadow-[0_2px_6px_rgba(0,255,255,0.4)] font-inter text-white flex items-center px-6 transition-colors duration-300"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Mobile Hamburger */}
        <button
          type="button"
          className="lg:hidden mr-4 p-2 rounded-md bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </button>

        {/* Logo / Title */}
        <div className="flex items-center justify-center h-full w-[220px]">
          <Link
            to="/"
            className="site-title-link group relative text-2xl font-bold tracking-wider uppercase leading-tight transition-all duration-200 hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
          >
            <span className="relative">
              Project
              <span className="text-white/80">Pulse</span>
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full" />
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center items-center">
          <div className="w-[300px] min-w-[200px] relative" ref={searchRef}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#001A1A]/60 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <input
              type="text"
              placeholder="Search projects…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              className="w-full pl-10 pr-10 py-2 bg-[#001A1A]/5 border border-[#001A1A]/20 rounded-md text-sm text-[#001A1A] placeholder-[#001A1A]/60 focus:border-[#001A1A] focus:ring-2 focus:ring-[#001A1A]/30 focus:outline-none transition-all duration-200"
              aria-label="Search projects"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#001A1A]/60 hover:text-[#001A1A] transition-colors"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {showResults && (searchQuery || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-[#001A1A]/20 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-[#001A1A]/60">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((result) => (
                      <button
                        key={result._id}
                        onClick={() => handleResultClick(result._id)}
                        className="w-full px-4 py-2 text-left text-sm text-[#001A1A] hover:bg-[#001A1A]/5 transition-colors duration-200"
                      >
                        <div className="font-medium">{result.name}</div>
                        <div className="text-[#001A1A]/60 text-xs">{result.description}</div>
                        {result.tags && result.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {result.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-1.5 py-0.5 text-xs bg-[#001A1A]/5 rounded text-[#001A1A]/70"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-4 text-center text-[#001A1A]/60">
                    No projects found
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center h-full ml-auto space-x-4">
          {/* View Mode Toggle (Grid / List) */}
          <button
            type="button"
            className="toggle-btn flex items-center justify-center w-10 h-10 bg-white/20 rounded-md hover:bg-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
            title="Grid View"
            aria-label="Switch to grid view"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 3h4v4H3V3zm6 0h4v4H9V3zM3 9h4v4H3V9zm6 0h4v4H9V9zM3 15h4v2H3v-2zm6 0h4v2H9v-2z" />
            </svg>
          </button>
          <button
            type="button"
            className="toggle-btn flex items-center justify-center w-10 h-10 bg-white/20 rounded-md hover:bg-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
            title="List View"
            aria-label="Switch to list view"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Notifications */}
          <Menu as="div" className="relative">
            <Menu.Button 
              className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Notifications"
            >
              <BellIcon className="h-6 w-6 text-white" aria-hidden="true" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" aria-label={`${unreadNotifications} unread notifications`} />
              )}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white/90 backdrop-blur-sm border border-[#001A1A]/20 shadow-xl py-2 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-white/20' : ''
                      } w-full text-left px-4 py-2 text-sm text-[#001A1A] transition-colors duration-200`}
                    >
                      New comment on "Project Alpha"
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-white/20' : ''
                      } w-full text-left px-4 py-2 text-sm text-[#001A1A] transition-colors duration-200`}
                    >
                      Task "Setup CI" is due tomorrow
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-white/20' : ''
                      } w-full text-left px-4 py-2 text-sm text-[#001A1A] transition-colors duration-200`}
                    >
                      View all notifications
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-white" aria-hidden="true" />
            ) : (
              <MoonIcon className="h-6 w-6 text-white" aria-hidden="true" />
            )}
          </button>

          {/* User Profile Menu */}
          <Menu as="div" className="relative">
            <Menu.Button 
              className="flex items-center rounded-full border-2 border-white/30 hover:border-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="User menu"
            >
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
                {user?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="ml-2 text-white/70 text-xs">&darr;</span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white/90 backdrop-blur-sm border border-[#001A1A]/20 shadow-xl py-1 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={`${
                        active ? 'bg-white/20' : ''
                      } block px-4 py-2 text-sm text-[#001A1A] transition-colors duration-200`}
                    >
                      My Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? 'bg-white/20' : ''
                      } w-full text-left px-4 py-2 text-sm text-[#001A1A] transition-colors duration-200`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      </Transition.Root>
    </>
  )
}

export default Navbar 