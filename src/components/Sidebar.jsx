import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, path: '/' },
  { name: 'All Projects', icon: FolderIcon, path: '/projects' },
  { name: 'My Tasks', icon: ClipboardDocumentListIcon, path: '/tasks' },
  { name: 'Calendar View', icon: CalendarIcon, path: '/calendar' },
  { name: 'Analytics', icon: ChartBarIcon, path: '/analytics' },
  { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
  { name: 'Help / Support', icon: QuestionMarkCircleIcon, path: '/help' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={`bg-white border-r border-gray-200 fixed h-full z-20 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-4 flex items-center justify-center border-b border-gray-200 hover:bg-gray-50"
      >
        <svg
          className={`h-6 w-6 text-gray-500 transform transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation Menu */}
      <nav className="mt-5 px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-6 w-6 ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className={`absolute bottom-0 w-full border-t border-gray-200 p-4 ${
        isCollapsed ? 'px-2' : 'px-4'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              AK
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Akshay Kumar</p>
              <p className="text-xs text-gray-500">akshay@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 