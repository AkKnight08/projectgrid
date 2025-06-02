import { useState } from 'react'
import {
  FolderIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { BACKGROUND_COLORS, DARK_MODE_COLORS } from '../constants/colors'
import { useTheme } from '../context/ThemeContext'

const tabs = [
  { id: 'overview', name: 'Overview', icon: FolderIcon },
  { id: 'tasks', name: 'Tasks', icon: DocumentTextIcon },
  { id: 'timeline', name: 'Timeline', icon: ClockIcon },
  { id: 'team', name: 'Team', icon: UserGroupIcon },
  { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
  { id: 'tags', name: 'Tags', icon: TagIcon }
]

const Project = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const { theme, handleThemeChange } = useTheme()

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

  return (
    <div className="h-screen bg-[#1E1E1E] p-6 pt-16 pb-12 overflow-hidden">
      {/* Page Title */}
      <div className="w-full h-full bg-[#1E1E1E] rounded-lg">
        <h1 className={`text-[1.5rem] font-semibold text-[${colors.TEXT_PRIMARY}] mb-6 italic`}>Project Dashboard</h1>

        {/* Breadcrumbs */}
        <div className={`text-[0.875rem] text-[${colors.TEXT_SECONDARY}] mb-8`}>
          <span className={`hover:text-[${colors.TEXT_PRIMARY}] cursor-pointer`}>Dashboard</span>
          <span className="mx-2">/</span>
          <span>Projects</span>
          <span className="mx-2">/</span>
          <span>Current Project</span>
        </div>

        {/* Content Area */}
        <div className={`flex gap-8 bg-[#1E1E1E] rounded-lg mt-4 h-[calc(100%-8rem)]`}>
          {/* Tab Navigation */}
          <div className={`w-[240px] bg-[${colors.CARD_INNER_BG}] rounded-lg p-4 flex flex-col gap-2 sticky top-6 h-fit`}>
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-[0.875rem] font-medium rounded-md transition-colors
                    ${isActive 
                      ? `bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}] border-l-4 border-[${colors.ACCENT_PURPLE}] -ml-1 shadow-sm` 
                      : `text-[${colors.TEXT_SECONDARY}] hover:bg-[${colors.CARD_INNER_BG}] hover:text-[${colors.TEXT_PRIMARY}]`
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? `text-[${colors.ACCENT_PURPLE}]` : `text-[${colors.ICON_DEFAULT}]`}`} />
                  {tab.name}
                </button>
              )
            })}
          </div>

          {/* Tab Panels */}
          <div className={`flex-1 bg-[#1E1E1E] overflow-y-auto rounded-lg p-8`}>
            {activeTab === 'overview' && (
              <div role="tabpanel" aria-labelledby="tab-overview" className="space-y-6">
                {/* Project Stats */}
                <section>
                  <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Project Statistics</h2>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Total Tasks', value: '24', color: colors.ACCENT_PURPLE },
                      { label: 'Completed', value: '12', color: colors.ACCENT_GREEN },
                      { label: 'In Progress', value: '8', color: colors.ACCENT_ORANGE },
                      { label: 'Pending', value: '4', color: colors.ACCENT_RED }
                    ].map((stat, index) => (
                      <div key={index} className={`p-4 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                        <p className={`text-sm text-[${colors.TEXT_SECONDARY}]`}>{stat.label}</p>
                        <p className={`text-2xl font-semibold text-[${stat.color}] mt-1`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recent Activity */}
                <section>
                  <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Recent Activity</h2>
                  <div className={`space-y-4 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}] p-4`}>
                    {[
                      { action: 'Task completed', user: 'John Doe', time: '2 hours ago' },
                      { action: 'New comment added', user: 'Jane Smith', time: '4 hours ago' },
                      { action: 'Task assigned', user: 'Mike Johnson', time: '1 day ago' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <p className={`text-sm text-[${colors.TEXT_PRIMARY}]`}>{activity.action}</p>
                          <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>by {activity.user}</p>
                        </div>
                        <span className={`text-xs text-[${colors.TEXT_DISABLED}]`}>{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Team Members */}
                <section>
                  <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Team Members</h2>
                  <div className={`grid grid-cols-3 gap-4`}>
                    {[
                      { name: 'John Doe', role: 'Project Manager', avatar: 'JD' },
                      { name: 'Jane Smith', role: 'Developer', avatar: 'JS' },
                      { name: 'Mike Johnson', role: 'Designer', avatar: 'MJ' }
                    ].map((member, index) => (
                      <div key={index} className={`p-4 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}] flex items-center gap-3`}>
                        <div className={`h-10 w-10 rounded-full bg-[${colors.ACCENT_PURPLE}] flex items-center justify-center text-[${colors.PAGE_BG}] font-medium`}>
                          {member.avatar}
                        </div>
                        <div>
                          <p className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}]`}>{member.name}</p>
                          <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div role="tabpanel" aria-labelledby="tab-tasks" className="space-y-6">
                <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Tasks</h2>
                {/* Task list content will go here */}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div role="tabpanel" aria-labelledby="tab-timeline" className="space-y-6">
                <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Timeline</h2>
                {/* Timeline content will go here */}
              </div>
            )}

            {activeTab === 'team' && (
              <div role="tabpanel" aria-labelledby="tab-team" className="space-y-6">
                <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Team</h2>
                {/* Team content will go here */}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div role="tabpanel" aria-labelledby="tab-analytics" className="space-y-6">
                <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Analytics</h2>
                {/* Analytics content will go here */}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div role="tabpanel" aria-labelledby="tab-calendar" className="space-y-6">
                <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Calendar</h2>
                {/* Calendar content will go here */}
              </div>
            )}

            {activeTab === 'tags' && (
              <div role="tabpanel" aria-labelledby="tab-tags" className="space-y-6">
                <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Tags</h2>
                {/* Tags content will go here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Project 