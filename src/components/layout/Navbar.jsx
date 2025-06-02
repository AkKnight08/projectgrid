import { Fragment, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, Cog6ToothIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useUserStore } from '../../store/userStore'
import Sidebar from './Sidebar'

const navLinks = []

const Navbar = () => {
  const { user, logout } = useUserStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications] = useState([
    { id: 1, message: 'Task overdue in Project X', read: false },
    { id: 2, message: 'New comment on Task Y', read: false },
  ])
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <nav className="w-full fixed top-0 z-50 h-[60px] bg-slateUltraDark shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-inter text-textPrimary flex items-center">
        {/* Left Section */}
        <div className="flex items-center h-full min-w-[220px]">
          <Link to="/" className="ml-6 text-[1.25rem] font-semibold text-white hover:opacity-80 transition-opacity select-none">
            ProjectPulse
          </Link>
          <div className="hidden md:flex ml-8 space-x-6">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-[0.875rem] font-medium px-1 pb-1 border-b-2 transition-colors duration-200 ${
                    isActive
                      ? 'text-white border-accentBlue'
                      : 'text-textSecondary border-transparent hover:text-[#F0F0F5]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
        {/* Center Section */}
        <div className="flex-1 flex justify-center items-center">
          <div className="w-[300px] min-w-[200px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727288] pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search projects…"
              className="w-full pl-10 pr-4 py-2 bg-slateDark border border-[#3A3A4F] rounded-md text-[0.875rem] text-textPrimary placeholder-[#727288] focus:border-accentBlue focus:ring-2 focus:ring-accentBlue/30 focus:outline-none transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>
        {/* Right Section */}
        <div className="flex items-center h-full mr-6 space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              className="relative p-2 rounded-full text-textSecondary hover:text-white transition-colors focus:outline-none"
              aria-label="Notifications"
              onClick={() => setShowNotifications(v => !v)}
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-accentRed" />
              )}
            </button>
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-slateDark border border-[#3A3A4F] rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="py-2">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-textMuted text-[0.875rem]">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className="flex items-center h-12 px-4 text-[0.875rem] text-textPrimary hover:bg-[#3A3A4F] cursor-pointer transition-colors"
                      >
                        {n.message}
                        {!n.read && <span className="ml-2 h-2 w-2 rounded-full bg-accentRed" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Settings Icon */}
          <Link
            to="/settings"
            className="p-2 rounded-full text-textSecondary hover:text-white transition-colors"
            aria-label="Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </Link>
          {/* User Avatar/Profile Menu */}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="flex items-center rounded-full border-2 border-[#3A3A4F] hover:border-accentBlue transition-colors focus:outline-none">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-accentBlue flex items-center justify-center text-white font-medium">
                  {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="ml-2 text-textSecondary text-xs">⌄</span>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-slateDark border border-[#3A3A4F] shadow-xl py-1 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={`block px-4 py-3 text-[0.875rem] ${active ? 'bg-[#3B3B4E] text-white' : 'text-textPrimary'}`}
                      role="menuitem"
                    >
                      My Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/settings"
                      className={`block px-4 py-3 text-[0.875rem] ${active ? 'bg-[#3B3B4E] text-white' : 'text-textPrimary'}`}
                      role="menuitem"
                    >
                      Settings
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`block w-full text-left px-4 py-3 text-[0.875rem] ${active ? 'bg-[#3B3B4E] text-white' : 'text-textPrimary'}`}
                      role="menuitem"
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        {/* Hamburger for mobile */}
        <button
          type="button"
          className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-textSecondary hover:text-white"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </nav>

      {/* Mobile menu */}
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <div className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slateUltraDark/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
                <Sidebar />
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition.Root>
    </>
  )
}

export default Navbar 