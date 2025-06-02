import { useState, useEffect, useMemo } from 'react'
import { useUserStore } from '../store/userStore'
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  KeyIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  LinkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'

const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
]

const itemsPerPageOptions = [
  { value: 10, label: '10 items' },
  { value: 25, label: '25 items' },
  { value: 50, label: '50 items' },
  { value: 100, label: '100 items' },
]

const Profile = () => {
  const { 
    user, 
    updateUserInfo, 
    changePassword, 
    enable2FA, 
    disable2FA, 
    updateNotificationPrefs, 
    deleteAccount,
    updateSettings,
    isLoading,
    error 
  } = useUserStore()
  
  // State management
  const [editMode, setEditMode] = useState(false)
  const [formValues, setFormValues] = useState({
    fullName: '',
    displayName: '',
    username: '',
    phone: '',
    timezone: '',
    language: 'en'
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: {
      newTask: true,
      deadlineApproaching: true,
      projectStatus: true,
      weeklySummary: true
    },
    inApp: {
      comments: true,
      taskUpdates: true
    },
    sms: {
      overdueAlert: false,
      twoFactor: false
    }
  })
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    allowInvites: true
  })
  const [settings, setSettings] = useState({
    theme: user?.settings?.theme || localStorage.getItem('theme') || 'system',
    language: user?.settings?.language || 'en',
    notifications: user?.settings?.notifications ?? true,
    itemsPerPage: user?.settings?.itemsPerPage || 10,
    emailNotifications: user?.settings?.emailNotifications ?? true,
    soundEnabled: user?.settings?.soundEnabled ?? true,
    autoSave: user?.settings?.autoSave ?? true,
  })
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Add default avatar URL
  const defaultAvatarUrl = '/images/default-avatar.svg'

  // Initialize form values when user data is loaded
  useEffect(() => {
    if (user) {
      setFormValues({
        fullName: user.fullName || '',
        displayName: user.displayName || '',
        username: user.username || '',
        phone: user.phone || '',
        timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: user.language || 'en'
      })
      setSettings({
        theme: user.settings?.theme || localStorage.getItem('theme') || 'system',
        language: user.settings?.language || 'en',
        notifications: user.settings?.notifications ?? true,
        itemsPerPage: user.settings?.itemsPerPage || 10,
        emailNotifications: user.settings?.emailNotifications ?? true,
        soundEnabled: user.settings?.soundEnabled ?? true,
        autoSave: user.settings?.autoSave ?? true,
      })
    }
  }, [user])

  // Apply theme on mount and when changed
  useEffect(() => {
    const applyTheme = (theme) => {
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    applyTheme(settings.theme)
    localStorage.setItem('theme', settings.theme)
    
    // Listen for system theme changes if 'system' is selected
    let mediaQuery
    if (settings.theme === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [settings.theme])

  // Handle settings changes
  const handleSettingsChange = async (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Auto-save when a setting changes
    const settingsToSave = {
      [`settings.${name}`]: type === 'checkbox' ? checked : (name === 'itemsPerPage' ? parseInt(newValue, 10) : newValue)
    }
    
    try {
      const success = await updateSettings(settingsToSave)
      if (success) {
        setSuccessMessage('Settings updated!')
        setTimeout(() => setSuccessMessage(''), 2000)
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Image must be under 2MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    if (!formValues.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }
    if (!formValues.displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (formValues.displayName.length > 50) {
      errors.displayName = 'Display name must be 50 characters or less'
    }
    if (formValues.phone && !/^\+?[\d\s-]{10,}$/.test(formValues.phone)) {
      errors.phone = 'Invalid phone number format'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await updateUserInfo(formValues)
      setEditMode(false)
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setValidationErrors({ ...validationErrors, confirmPassword: 'Passwords do not match' })
      return
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccessMessage('Password updated successfully!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('Failed to change password:', error)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return
    try {
      await deleteAccount()
      // Redirect to landing page
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  // Render user info section
  const renderUserInfo = () => (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Avatar & Basic Info */}
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={avatarPreview || user?.avatarURL || defaultAvatarUrl}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = defaultAvatarUrl
                  }}
                />
                {editMode && (
                  <div className="absolute bottom-0 right-0">
                    <label className="cursor-pointer bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700">
                      <PencilIcon className="h-5 w-5" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
              {editMode && avatarPreview && (
                <button
                  onClick={() => setAvatarPreview(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove Photo
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="displayName"
                    value={formValues.displayName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-gray-900">{user?.displayName}</p>
                )}
                {validationErrors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.displayName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                {editMode ? (
                  <input
                    type="text"
                    name="username"
                    value={formValues.username}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                ) : (
                  <p className="mt-1 text-lg text-gray-900">@{user?.username}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Additional Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="fullName"
                  value={formValues.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              ) : (
                <p className="mt-1 text-lg text-gray-900">{user?.fullName}</p>
              )}
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
              {user?.emailVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Verified
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              {editMode ? (
                <input
                  type="tel"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              ) : (
                <p className="mt-1 text-lg text-gray-900">{user?.phone || 'Not set'}</p>
              )}
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date Joined</label>
              <p className="mt-1 text-lg text-gray-900">
                {user?.dateJoined ? format(parseISO(user.dateJoined), 'MMMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render security section
  const renderSecurity = () => (
    <div className="bg-white shadow sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Security & Preferences</h3>
        
        {/* Password Change */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Change Password</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2">Enable 2FA</span>
            </label>
          </div>
        </div>

        {/* Account Deletion */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900">Delete Account</h4>
          <p className="mt-1 text-sm text-gray-500">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )

  // Render activity section
  const renderActivity = () => (
    <div className="bg-white shadow sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {/* Activity items would be mapped here */}
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  )

  // Render settings section
  const renderSettings = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Display Preferences</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
          <select
            name="theme"
            value={settings.theme}
            onChange={handleSettingsChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            {themeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
          <select
            name="language"
            value={settings.language}
            onChange={handleSettingsChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Items Per Page</label>
          <select
            name="itemsPerPage"
            value={settings.itemsPerPage}
            onChange={handleSettingsChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            {itemsPerPageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="notifications"
              name="notifications"
              type="checkbox"
              checked={settings.notifications}
              onChange={handleSettingsChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable in-app notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="emailNotifications"
              name="emailNotifications"
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={handleSettingsChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable email notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="soundEnabled"
              name="soundEnabled"
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={handleSettingsChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="soundEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable sound effects
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="autoSave"
              name="autoSave"
              type="checkbox"
              checked={settings.autoSave}
              onChange={handleSettingsChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="autoSave" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable auto-save
            </label>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {typeof error === 'string' ? error : (error.message || 'Server error. Please check your input.')}
          </div>
        )}
        {successMessage && (
          <div className="text-green-600 text-sm">{successMessage}</div>
        )}
      </div>
    </div>
  )

  // Delete Account Confirmation Modal
  const renderDeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          This action cannot be undone. This will permanently delete your account and remove all data from our servers.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Type DELETE to confirm
          </label>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirmation !== 'DELETE'}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account information, preferences, and security
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {editMode ? (
            <>
              <XMarkIcon className="h-5 w-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - User Info & Avatar */}
        <div className="space-y-6">
          {renderUserInfo()}
          {renderSecurity()}
        </div>

        {/* Right Column - Settings & Activity */}
        <div className="space-y-6">
          {renderSettings()}
          {renderActivity()}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && renderDeleteConfirmModal()}
    </div>
  )
}

export default Profile 