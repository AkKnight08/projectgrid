import { useState } from 'react'
import {
  Cog6ToothIcon,
  UserIcon,
  PaintBrushIcon,
  BellIcon,
  LinkIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { BACKGROUND_COLORS, DARK_MODE_COLORS } from '../constants/colors'
import { useTheme } from '../context/ThemeContext'
import { useUserStore } from '../store/userStore'
// import { useToast } from '../hooks/useToast'

const tabs = [
  { id: 'general', name: 'General', icon: Cog6ToothIcon },
  { id: 'account', name: 'Account', icon: UserIcon },
  { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
  { id: 'integrations', name: 'Integrations', icon: LinkIcon },
  { id: 'billing', name: 'Billing', icon: CreditCardIcon },
  { id: 'security', name: 'Security', icon: ShieldCheckIcon }
]

const Settings = () => {
  const { user, updateUser, changePassword } = useUserStore()
  const { theme, handleThemeChange } = useTheme()
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // const { addToast } = useToast()

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateUser(formData)
      // addToast('Profile updated successfully', { appearance: 'success' })
    } catch (error) {
      // addToast('Failed to update profile', { appearance: 'error' })
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.')
      return
    }
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordSuccess('Password changed successfully.')
      setPasswordError('')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password.')
      setPasswordSuccess('')
    }
  }

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

  const onFileChange = (e) => {
    // ... existing code ...
  }

  return (
    <div className="h-screen bg-[#1E1E1E] p-6 pt-16 pb-12 overflow-hidden">
      {/* Page Title */}
      <div className="w-full h-full bg-[#1E1E1E] rounded-lg">
        <h1 className={`text-[1.5rem] font-semibold text-[${colors.TEXT_PRIMARY}] mb-6 italic`}>Settings</h1>

        {/* Breadcrumbs */}
        <div className={`text-[0.875rem] text-[${colors.TEXT_SECONDARY}] mb-8`}>
          <span className={`hover:text-[${colors.TEXT_PRIMARY}] cursor-pointer`}>Dashboard</span>
          <span className="mx-2">/</span>
          <span>Settings</span>
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
            {activeTab === 'general' && (
              <div role="tabpanel" aria-labelledby="tab-general" className="space-y-6">
                {/* Workspace Information */}
                <section>
                  <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Workspace Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="workspaceName" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                        Workspace Name
                      </label>
                      <input
                        type="text"
                        id="workspaceName"
                        placeholder="Enter workspace name"
                        className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                          focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
                          placeholder:text-[${colors.TEXT_DISABLED}]`}
                      />
                    </div>
                    <div>
                      <label htmlFor="workspaceUrl" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                        Workspace URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="workspaceUrl"
                          value="https://projectpulse.com/my-team"
                          readOnly
                          className={`flex-1 bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_DISABLED}] px-4 py-2 text-sm cursor-not-allowed`}
                        />
                        <button className={`px-4 py-2 bg-[${colors.ACCENT_PURPLE}] text-[${colors.PAGE_BG}] rounded-md hover:bg-[${colors.ACCENT_PURPLE}]/90 transition-colors`}>
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Language & Locale */}
                <section>
                  <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Language & Locale</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="language" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                        Primary Language
                      </label>
                      <select
                        id="language"
                        className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                          focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="timezone" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                          focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="utc">UTC</option>
                        <option value="est">Eastern Time</option>
                        <option value="pst">Pacific Time</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button onClick={handleFormSubmit} className={`px-6 py-3 bg-[${colors.ACCENT_PURPLE}] text-[${colors.PAGE_BG}] font-semibold rounded-md hover:bg-[${colors.ACCENT_PURPLE}]/90 transition-colors`}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div role="tabpanel" aria-labelledby="tab-account" className="space-y-6">
                {/* Profile Information */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        placeholder="Enter your full name"
                        className="w-full bg-[#242424] border border-[#2E2E2E] rounded-md text-[#E0E0E0] px-4 py-2 text-sm
                          focus:border-[#BB86FC] focus:ring-2 focus:ring-[#BB86FC]/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        placeholder="Enter your display name"
                        className="w-full bg-[#242424] border border-[#2E2E2E] rounded-md text-[#E0E0E0] px-4 py-2 text-sm
                          focus:border-[#BB86FC] focus:ring-2 focus:ring-[#BB86FC]/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                        Email Address
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          id="email"
                          value="user@example.com"
                          readOnly
                          className="flex-1 bg-[#242424] border border-[#2E2E2E] rounded-md text-[#6B6B6B] px-4 py-2 text-sm cursor-not-allowed"
                        />
                        <button className="px-4 py-2 text-[#BB86FC] hover:text-[#BB86FC]/90 transition-colors text-sm">
                          Change Email
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        className="w-full bg-[#242424] border border-[#2E2E2E] rounded-md text-[#E0E0E0] px-4 py-2 text-sm
                          focus:border-[#BB86FC] focus:ring-2 focus:ring-[#BB86FC]/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full border-2 border-[#2E2E2E] bg-[#BB86FC] flex items-center justify-center text-[#E0E0E0] text-xl font-medium">
                          U
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-[#BB86FC] text-[#121212] rounded-md hover:bg-[#BB86FC]/90 transition-colors text-sm">
                            Upload Photo
                          </button>
                          <button className="px-4 py-2 text-[#CF6679] hover:text-[#CF6679]/90 transition-colors text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Password Change */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="••••••••"
                        className="w-full bg-[#242424] border border-[#2E2E2E] rounded-md text-[#E0E0E0] px-4 py-2 text-sm
                          focus:border-[#BB86FC] focus:ring-2 focus:ring-[#BB86FC]/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="••••••••"
                          className="w-full bg-[#242424] border border-[#2E2E2E] rounded-md text-[#E0E0E0] px-4 py-2 text-sm
                            focus:border-[#BB86FC] focus:ring-2 focus:ring-[#BB86FC]/30 focus:outline-none"
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#E0E0E0]">
                          👁️
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      <div className="mt-2">
                        <div className="h-2 bg-[#2E2E2E] rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-[#CF6679]"></div>
                        </div>
                        <span className="text-xs text-[#CF6679] mt-1">Weak</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="••••••••"
                        className="w-full bg-[#242424] border border-[#2E2E2E] rounded-md text-[#E0E0E0] px-4 py-2 text-sm
                          focus:border-[#BB86FC] focus:ring-2 focus:ring-[#BB86FC]/30 focus:outline-none"
                      />
                    </div>
                    {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    {passwordSuccess && <p className="text-sm text-green-500">{passwordSuccess}</p>}
                    <div className="flex justify-end">
                      <button type="submit" className="px-6 py-3 bg-[#BB86FC] text-[#121212] font-semibold rounded-md hover:bg-[#BB86FC]/90 transition-colors">
                        Change Password
                      </button>
                    </div>
                  </form>
                </section>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button onClick={handleFormSubmit} className="px-6 py-3 bg-[#BB86FC] text-[#121212] font-semibold rounded-md hover:bg-[#BB86FC]/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div role="tabpanel" aria-labelledby="tab-appearance" className="space-y-6">
                {/* Theme Selection */}
                <section>
                  <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Theme Selection</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', name: 'Light Mode', icon: '☀️' },
                      { id: 'dark', name: 'Dark Mode', icon: '🌙' },
                      { id: 'system', name: 'System Default', icon: '🖥️' }
                    ].map(themeOption => (
                      <button
                        key={themeOption.id}
                        onClick={() => handleThemeChange(themeOption.id)}
                        className={`flex items-center gap-2 p-4 rounded-md border transition-colors
                          ${themeOption.id === theme
                            ? `bg-[${colors.CARD_INNER_BG}] border-[${colors.ACCENT_PURPLE}] text-[${colors.TEXT_PRIMARY}]`
                            : `bg-[${colors.CARD_INNER_BG}] border-[${colors.BORDER}] text-[${colors.TEXT_SECONDARY}] hover:bg-[${colors.CARD_INNER_BG}] hover:text-[${colors.TEXT_PRIMARY}]`
                          }`}
                      >
                        <span className="text-xl">{themeOption.icon}</span>
                        <span className="text-sm font-medium">{themeOption.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Font Size */}
                <section>
                  <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Font Size</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm text-[${colors.TEXT_SECONDARY}]`}>12pt</span>
                      <span className={`text-sm text-[${colors.TEXT_SECONDARY}]`}>18pt</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="18"
                      defaultValue="14"
                      className={`w-full h-2 bg-[${colors.BORDER}] rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-[${colors.ACCENT_PURPLE}]
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110`}
                    />
                    <div className="text-center">
                      <span className={`text-sm text-[${colors.TEXT_SECONDARY}]`}>Current: 14pt</span>
                    </div>
                  </div>
                </section>

                {/* Sidebar Position */}
                <section>
                  <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Sidebar Position</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'left', name: 'Left', icon: '◀️' },
                      { id: 'right', name: 'Right', icon: '▶️' }
                    ].map(position => (
                      <button
                        key={position.id}
                        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-md border transition-colors
                          ${position.id === 'left'
                            ? `bg-[${colors.CARD_INNER_BG}] border-[${colors.ACCENT_PURPLE}] text-[${colors.TEXT_PRIMARY}]`
                            : `bg-[${colors.CARD_INNER_BG}] border-[${colors.BORDER}] text-[${colors.TEXT_SECONDARY}] hover:bg-[${colors.CARD_INNER_BG}] hover:text-[${colors.TEXT_PRIMARY}]`
                          }`}
                      >
                        <span className="text-2xl">{position.icon}</span>
                        <span className="text-sm font-medium">{position.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button className={`px-6 py-3 bg-[${colors.ACCENT_PURPLE}] text-[${colors.PAGE_BG}] font-semibold rounded-md hover:bg-[${colors.ACCENT_PURPLE}]/90 transition-colors`}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div role="tabpanel" aria-labelledby="tab-notifications" className="space-y-6">
                {/* Email Notifications */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Email Notifications</h2>
                  <div className="space-y-4">
                    {[
                      'New Task Assigned',
                      'Task Deadline Approaching',
                      'Project Status Changed',
                      'Weekly Summary'
                    ].map((notification, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-[#A0A0A0]">{notification}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#2E2E2E] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BB86FC]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#2E2E2E] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BB86FC]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

                {/* In-App Notifications */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">In-App Notifications</h2>
                  <div className="space-y-4">
                    {[
                      'Show banner for new comments',
                      'Show toast for task updates',
                      'Mute sounds'
                    ].map((notification, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-[#A0A0A0]">{notification}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#2E2E2E] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BB86FC]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#2E2E2E] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BB86FC]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Push Notifications */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Push Notifications</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-[#A0A0A0]">
                      Enable push notifications on mobile app.
                    </p>
                    <button className="px-4 py-2 bg-[#BB86FC] text-[#121212] rounded-md hover:bg-[#BB86FC]/90 transition-colors text-sm">
                      Send Test Notification
                    </button>
                  </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button className="px-6 py-3 bg-[#BB86FC] text-[#121212] font-semibold rounded-md hover:bg-[#BB86FC]/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div role="tabpanel" aria-labelledby="tab-integrations" className="space-y-6">
                {/* Connected Apps */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Connected Apps</h2>
                  <div className="space-y-3">
                    {[
                      { name: 'Google Calendar', status: 'connected' },
                      { name: 'Slack', status: 'not-connected' },
                      { name: 'GitHub', status: 'connected' }
                    ].map((app, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-[#242424] border border-[#2E2E2E] rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-[#242424] flex items-center justify-center">
                            {app.name[0]}
                          </div>
                          <span className="text-sm text-[#A0A0A0]">{app.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              app.status === 'connected'
                                ? 'bg-[#69FFA5] text-[#121212]'
                                : 'bg-[#CF6679] text-[#E0E0E0]'
                            }`}
                          >
                            {app.status === 'connected' ? 'Connected' : 'Not Connected'}
                          </span>
                          <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              app.status === 'connected'
                                ? 'bg-[#CF6679] text-[#E0E0E0] hover:bg-[#CF6679]/90'
                                : 'bg-[#BB86FC] text-[#121212] hover:bg-[#BB86FC]/90'
                            }`}
                          >
                            {app.status === 'connected' ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* API Key Management */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">API Key Management</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#242424] border border-[#2E2E2E] rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#A0A0A0]">Your API Key:</span>
                        <span className="text-sm text-[#E0E0E0]">••••-••••-ABCD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-[#6B6B6B] hover:text-[#E0E0E0] transition-colors">
                          📋
                        </button>
                        <button className="px-4 py-2 bg-[#D97706] text-[#121212] rounded-md hover:bg-[#D97706]/90 transition-colors text-sm">
                          Regenerate Key
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[#A0A0A0]">
                      Keep your API key secure. If you suspect it has been compromised, regenerate it immediately.
                    </p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'billing' && (
              <div role="tabpanel" aria-labelledby="tab-billing" className="space-y-6">
                {/* Current Plan */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Current Plan</h2>
                  <div className="space-y-2">
                    <p className="text-sm text-[#A0A0A0]">
                      Current Plan: <span className="text-[#BB86FC] font-medium">Pro</span>
                    </p>
                    <p className="text-sm text-[#A0A0A0]">
                      Next Billing Date: <span className="text-[#BB86FC]">Jul 15, 2025</span>
                    </p>
                  </div>
                </section>

                {/* Plan Options */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Available Plans</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        name: 'Free',
                        price: '$0',
                        features: ['Up to 5 projects', 'Basic features', 'Community support'],
                        current: false
                      },
                      {
                        name: 'Pro',
                        price: '$29',
                        features: ['Unlimited projects', 'Advanced features', 'Priority support', 'Custom integrations'],
                        current: true
                      },
                      {
                        name: 'Enterprise',
                        price: '$99',
                        features: ['Everything in Pro', 'Dedicated support', 'Custom development', 'SLA guarantee'],
                        current: false
                      }
                    ].map((plan, index) => (
                      <div
                        key={index}
                        className="flex flex-col p-6 bg-[#242424] border border-[#2E2E2E] rounded-lg"
                      >
                        <h3 className="text-lg font-semibold text-[#E0E0E0] mb-2">{plan.name}</h3>
                        <p className={`text-2xl font-bold mb-4 ${plan.current ? 'text-[#BB86FC]' : 'text-[#A0A0A0]'}`}>
                          {plan.price}<span className="text-sm font-normal text-[#A0A0A0]">/month</span>
                        </p>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                              <span className="text-[#69FFA5]">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <button
                          className={`mt-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            plan.current
                              ? 'bg-[#2E2E2E] text-[#A0A0A0] cursor-not-allowed'
                              : 'bg-[#BB86FC] text-[#121212] hover:bg-[#BB86FC]/90'
                          }`}
                        >
                          {plan.current ? 'Current Plan' : 'Select Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Payment Method */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Payment Method</h2>
                  <div className="flex items-center justify-between p-4 bg-[#242424] border border-[#2E2E2E] rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 rounded bg-[#242424] flex items-center justify-center">
                        💳
                      </div>
                      <span className="text-sm text-[#A0A0A0]">Card ending in 1234</span>
                    </div>
                    <button className="px-4 py-2 bg-[#D97706] text-[#121212] rounded-md hover:bg-[#D97706]/90 transition-colors text-sm">
                      Update Card
                    </button>
                  </div>
                </section>

                {/* Billing History */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Billing History</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#2E2E2E]">
                          <th className="text-left py-3 px-4 text-sm font-medium text-[#A0A0A0]">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[#A0A0A0]">Description</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[#A0A0A0]">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[#A0A0A0]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { date: 'Jul 15, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
                          { date: 'Jun 15, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
                          { date: 'May 15, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' }
                        ].map((item, index) => (
                          <tr key={index} className="border-b border-[#2E2E2E] hover:bg-[#2E2E2E]">
                            <td className="py-3 px-4 text-sm text-[#A0A0A0]">{item.date}</td>
                            <td className="py-3 px-4 text-sm text-[#A0A0A0]">{item.description}</td>
                            <td className="py-3 px-4 text-sm text-[#A0A0A0]">{item.amount}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-[#69FFA5] text-[#121212]">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'security' && (
              <div role="tabpanel" aria-labelledby="tab-security" className="space-y-6">
                {/* Two-Factor Authentication */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Two-Factor Authentication</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#A0A0A0]">Enable two-factor authentication for additional security</p>
                        <p className="text-xs text-[#6B6B6B] mt-1">Requires an authenticator app like Google Authenticator</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked="true"
                        className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#2E2E2E] transition-colors"
                      >
                        <span className="sr-only">Enable 2FA</span>
                        <span className="inline-block h-4 w-4 transform rounded-full bg-[#BB86FC] transition-transform translate-x-4" />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Session Management */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Active Sessions</h2>
                  <div className="space-y-3">
                    {[
                      {
                        device: 'MacBook Pro',
                        location: 'San Francisco, US',
                        browser: 'Chrome',
                        lastActive: 'Active now'
                      },
                      {
                        device: 'iPhone 13',
                        location: 'San Francisco, US',
                        browser: 'Safari',
                        lastActive: '2 hours ago'
                      }
                    ].map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-[#242424] border border-[#2E2E2E] rounded-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-md bg-[#242424] flex items-center justify-center">
                            {session.device.includes('Mac') ? '💻' : '📱'}
                          </div>
                          <div>
                            <p className="text-sm text-[#E0E0E0]">{session.device}</p>
                            <p className="text-xs text-[#A0A0A0]">
                              {session.location} • {session.browser} • {session.lastActive}
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-[#CF6679] text-[#E0E0E0] rounded-md hover:bg-[#CF6679]/90 transition-colors text-sm">
                          Sign Out
                        </button>
                      </div>
                    ))}
                    <button className="w-full px-4 py-2 bg-[#CF6679] text-[#E0E0E0] rounded-md hover:bg-[#CF6679]/90 transition-colors text-sm">
                      Sign out of all sessions
                    </button>
                  </div>
                </section>

                {/* Delete Account */}
                <section>
                  <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">Delete Account</h2>
                  <div className="p-4 bg-[#242424] border border-[#2E2E2E] rounded-md">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🛑</span>
                      <div className="space-y-4">
                        <p className="text-sm text-[#A0A0A0]">
                          Deleting your account is permanent and cannot be undone. All your data will be permanently removed.
                        </p>
                        <div>
                          <label htmlFor="deleteConfirm" className="block text-sm font-medium text-[#A0A0A0] mb-2">
                            Type DELETE to confirm
                          </label>
                          <input
                            type="text"
                            id="deleteConfirm"
                            placeholder="Type DELETE"
                            className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-md text-[#E0E0E0] px-4 py-2 text-sm
                              focus:border-[#CF6679] focus:ring-2 focus:ring-[#CF6679]/30 focus:outline-none
                              placeholder:text-[#6B6B6B]"
                          />
                        </div>
                        <button
                          disabled
                          className="px-6 py-3 bg-[#CF6679] text-[#E0E0E0] rounded-md hover:bg-[#CF6679]/90 transition-colors text-sm
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 