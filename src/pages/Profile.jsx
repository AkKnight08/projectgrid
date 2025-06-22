import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '../store/userStore'
import {
  UserCircleIcon,
  ShieldCheckIcon,
  BellIcon,
  TrashIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { DARK_MODE_COLORS } from '../constants/colors'
import { debounce } from 'lodash'
import authAPI from '../services/auth'
import React from 'react'
import defaultAvatar from '/images/default-avatar.svg'

const tabs = [
  { id: 'profile', name: 'Edit Profile', icon: UserCircleIcon },
  { id: 'security', name: 'Password & Security', icon: ShieldCheckIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
  { id: 'account', name: 'Account Actions', icon: TrashIcon },
]

// --- Avatar URL Helper ---
const backendUrl = (import.meta.env.VITE_API_URL || '').replace('/api', '');

const getAvatarUrl = (avatarPath) => {
  if (avatarPath && avatarPath.startsWith('/uploads')) {
    // It's a custom uploaded avatar from the backend
    return `${backendUrl}${avatarPath}`;
  }
  // It's the default avatar served from the frontend's public directory
  return defaultAvatar;
};

const Profile = () => {
  const { user, updateUserInfo, changePassword, deleteAccount, updateAvatar } = useUserStore()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({ fullName: '', displayName: '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Use the same color scheme as Settings
  const colors = DARK_MODE_COLORS

  useEffect(() => {
    if (user) {
      // Helper to generate display name from name
      const generateDisplayName = (fullName) => {
        if (!fullName) return '';
        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length === 1) {
          return nameParts[0];
        } else if (nameParts.length === 2) {
          return `${nameParts[0][0]}${nameParts[1]}`;
        } else {
          return `${nameParts[0][0]}${nameParts[nameParts.length - 1]}`;
        }
      };
      
      // Debug logging
      console.log('User object from store:', user);
      console.log('User.displayName from database:', user.displayName);
      console.log('User.name from database:', user.name);
      console.log('Generated displayName:', generateDisplayName(user.name || ''));
      
      setFormData({
        fullName: user.name || '',
        displayName: user.displayName || generateDisplayName(user.name || ''),
      })
    }
  }, [user])

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    
    console.log('=== PROFILE SUBMIT ===');
    console.log('Form data being sent:', formData);
    
    try {
      await updateUserInfo(formData)
      setSuccessMessage('Profile updated successfully!')
      console.log('Profile update successful');
    } catch (error) {
      console.error('Profile update failed:', error);
      console.error('Error response:', error.response?.data);
      setErrorMessage(error.response?.data?.message || 'Failed to update profile.')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New passwords don't match.")
      return
    }
    try {
      await changePassword(passwordData)
      setSuccessMessage('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to change password.')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.email) {
      setErrorMessage('Email confirmation does not match.')
      return
    }
    try {
      await deleteAccount()
      // The user will be logged out automatically by the store
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete account.')
      setShowDeleteModal(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <EditProfileForm {...{ formData, setFormData, handleFormChange, handleProfileSubmit, userEmail: user?.email, colors }} />
      case 'security':
        return <SecuritySettings {...{ passwordData, handlePasswordChange, handlePasswordSubmit, colors }} />
      case 'notifications':
        return <NotificationSettings colors={colors} />
      case 'account':
        return <AccountActions {...{ setShowDeleteModal, colors }} />
      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-[#1E1E1E] p-6 pt-16 pb-12 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-[1.5rem] font-semibold text-[${colors.TEXT_PRIMARY}] italic`}>Account Settings</h1>
        <button 
          onClick={() => {
            // Clear cached user data and force refresh
            localStorage.removeItem('taskgrid_user');
            window.location.reload();
          }}
          className={`px-4 py-2 bg-[${colors.ACCENT_TEAL}] text-[${colors.PAGE_BG}] text-sm font-medium rounded-md hover:bg-[${colors.ACCENT_TEAL}]/90 transition-colors`}
        >
          Refresh Data
        </button>
      </div>
      {successMessage && <div className={`bg-[${colors.ACCENT_GREEN}]/20 border border-[${colors.ACCENT_GREEN}] text-[${colors.ACCENT_GREEN}] px-4 py-3 rounded relative mb-4`} role="alert">{successMessage}</div>}
      {errorMessage && <div className={`bg-[${colors.ACCENT_RED}]/20 border border-[${colors.ACCENT_RED}] text-[${colors.ACCENT_RED}] px-4 py-3 rounded relative mb-4`} role="alert">{errorMessage}</div>}
      <div className="flex gap-8 mt-4 h-[calc(100%-8rem)]">
        <aside className="w-1/4">
          <nav className={`flex flex-col gap-2 bg-[${colors.CARD_INNER_BG}] rounded-lg p-4`}>
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-[0.875rem] font-medium rounded-md transition-colors ${
                    isActive
                      ? `bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}] border-l-4 border-[${colors.ACCENT_PURPLE}] -ml-1 shadow-sm`
                      : `text-[${colors.TEXT_SECONDARY}] hover:bg-[${colors.CARD_INNER_BG}] hover:text-[${colors.TEXT_PRIMARY}]`
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? `text-[${colors.ACCENT_PURPLE}]` : `text-[${colors.ICON_DEFAULT}]`}`} />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </aside>
        <main className={`flex-1 bg-[${colors.PANEL_BG}] rounded-lg shadow p-8 overflow-y-auto`}>
          {renderTabContent()}
        </main>
      </div>
      {showDeleteModal && <DeleteAccountModal {...{ setShowDeleteModal, handleDeleteAccount, setDeleteConfirmation, deleteConfirmation, userEmail: user.email, colors }} />}
    </div>
  )
}

const EditProfileForm = ({ formData, setFormData, handleFormChange, handleProfileSubmit, userEmail, colors }) => {
  const { user, updateAvatar } = useUserStore();
  const fileInputRef = React.useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(getAvatarUrl(user?.avatar));
  const [avatarError, setAvatarError] = useState(null);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    setAvatarError(null); // Clear previous errors
    const file = e.target.files[0];
    if (file) {
      // Client-side validation for file size
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setAvatarError('File is too large. Please select an image under 5MB.');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      const { success, error } = await updateAvatar(file);
      if (!success) {
        setAvatarPreview(getAvatarUrl(user?.avatar));
        setAvatarError(error || 'Avatar upload failed.');
      }
    }
  };

  useEffect(() => {
    setAvatarPreview(getAvatarUrl(user?.avatar));
  }, [user?.avatar]);

  const [displayNameStatus, setDisplayNameStatus] = useState({
    loading: false,
    available: true,
    message: '',
  });

  const checkDisplayNameAvailability = useCallback(
    debounce(async (name) => {
      if (!name || name.length < 3) {
        setDisplayNameStatus({ loading: false, available: true, message: '' });
        return;
      }
      setDisplayNameStatus({ loading: true, available: false, message: 'Checking...' });
      const { isAvailable, message } = await authAPI.checkDisplayName(name);
      setDisplayNameStatus({ loading: false, available: isAvailable, message });
    }, 500),
    []
  );

  const onDisplayNameChange = (e) => {
    const { value } = e.target;
    handleFormChange(e);
    checkDisplayNameAvailability(value);
  };

  // Function to generate display name from full name
  const generateDisplayName = (fullName) => {
    if (!fullName) return '';
    
    // Remove extra spaces and split by space
    const nameParts = fullName.trim().split(/\s+/);
    
    if (nameParts.length === 1) {
      // Single name - use as is
      return nameParts[0];
    } else if (nameParts.length === 2) {
      // First and last name - use first letter of first name + last name
      return `${nameParts[0][0]}${nameParts[1]}`;
    } else {
      // Multiple names - use first letter of first name + last name
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1]}`;
    }
  };

  // Enhanced form change handler
  const handleFormChangeEnhanced = (e) => {
    const { name, value } = e.target;
    
    if (name === 'fullName') {
      // Auto-generate display name when full name changes
      const newDisplayName = generateDisplayName(value);
      setFormData(prev => ({
        ...prev,
        fullName: value,
        displayName: prev.displayName || newDisplayName // Only update if displayName is empty
      }));
    } else {
      handleFormChange(e);
    }
  };

  return (
    <form onSubmit={handleProfileSubmit} className="space-y-6">
      <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}]`}>Public Profile</h2>
      
      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        <img 
          src={avatarPreview} 
          alt="Avatar" 
          className="h-20 w-20 rounded-full object-cover"
          onError={(e) => {
            if (e.target.src !== defaultAvatar) {
              e.target.onerror = null; // Prevent infinite loop if default avatar also fails
              e.target.src = defaultAvatar;
            }
          }}
        />
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/png, image/jpeg, image/gif"
          />
          <button 
            type="button" 
            onClick={handleAvatarClick}
            className={`flex items-center gap-2 px-4 py-2 bg-[${colors.CARD_INNER_BG}] rounded-md text-sm text-[${colors.TEXT_PRIMARY}] hover:bg-[${colors.BORDER}] transition-colors`}>
            <CameraIcon className="h-5 w-5" /> Change Avatar
          </button>
          {avatarError && (
            <p className="text-xs text-red-400 mt-2">{avatarError}</p>
          )}
        </div>
      </div>

      {/* Full Name Field */}
      <div>
        <label htmlFor="fullName" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
          Full Name <span className="text-[#CF6679]">*</span>
        </label>
        <input 
          type="text" 
          name="fullName" 
          id="fullName" 
          value={formData.fullName} 
          onChange={handleFormChangeEnhanced} 
          className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
            focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
            placeholder:text-[${colors.TEXT_DISABLED}]`}
          placeholder="Enter your full name"
          required
        />
        <p className={`text-xs text-[${colors.TEXT_SECONDARY}] mt-1`}>
          This is your legal name and will be used for account verification.
        </p>
      </div>

      {/* Display Name Field - More Prominent */}
      <div className={`p-4 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}]`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 bg-[${colors.ACCENT_PURPLE}] rounded-full`}></div>
          <label htmlFor="displayName" className={`block text-sm font-medium text-[${colors.TEXT_PRIMARY}]`}>
            Display Name
          </label>
        </div>
        <input 
          type="text" 
          name="displayName" 
          id="displayName" 
          value={formData.displayName} 
          onChange={onDisplayNameChange} 
          className={`w-full bg-[${colors.PANEL_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
            focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
            placeholder:text-[${colors.TEXT_DISABLED}]`}
          placeholder="Enter your display name"
        />
        <div className="mt-2 space-y-2">
          {displayNameStatus.loading && (
            <div className="flex items-center text-xs text-yellow-400">
              <ClockIcon className="h-4 w-4 mr-1" />
              {displayNameStatus.message}
            </div>
          )}
          {!displayNameStatus.loading && displayNameStatus.message && (
            <div className={`flex items-center text-xs ${displayNameStatus.available ? 'text-green-400' : 'text-red-400'}`}>
              {displayNameStatus.available ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}
              {displayNameStatus.message}
            </div>
          )}
          <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
            This is your public username that others will see in projects and collaborations.
          </p>
          <div className={`text-xs text-[${colors.ACCENT_PURPLE}] bg-[${colors.ACCENT_PURPLE}]/10 p-2 rounded`}>
            <strong>💡 Tip:</strong> Your display name will appear as "@{formData.displayName || 'yourname'}" in project activities.
          </div>
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>Email</label>
        <input 
          type="email" 
          name="email" 
          id="email" 
          value={userEmail} 
          disabled 
          className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_DISABLED}] px-4 py-2 text-sm cursor-not-allowed`} 
        />
        <p className={`text-xs text-[${colors.TEXT_SECONDARY}] mt-1`}>
          Email address cannot be changed. Contact support if needed.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={!displayNameStatus.available || displayNameStatus.loading}
          className={`px-6 py-3 bg-[${colors.ACCENT_PURPLE}] text-[${colors.PAGE_BG}] font-semibold rounded-md hover:bg-[${colors.ACCENT_PURPLE}]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

const SecuritySettings = ({ passwordData, handlePasswordChange, handlePasswordSubmit, colors }) => (
  <form onSubmit={handlePasswordSubmit} className="space-y-6">
    <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}]`}>Password</h2>
    <div>
      <label htmlFor="currentPassword" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>Current Password</label>
      <input 
        type="password" 
        name="currentPassword" 
        id="currentPassword" 
        value={passwordData.currentPassword} 
        onChange={handlePasswordChange} 
        className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
          focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
          placeholder:text-[${colors.TEXT_DISABLED}]`}
        placeholder="Enter current password"
        required 
      />
    </div>
    <div>
      <label htmlFor="newPassword" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>New Password</label>
      <input 
        type="password" 
        name="newPassword" 
        id="newPassword" 
        value={passwordData.newPassword} 
        onChange={handlePasswordChange} 
        className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
          focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
          placeholder:text-[${colors.TEXT_DISABLED}]`}
        placeholder="Enter new password"
        required 
      />
    </div>
    <div>
      <label htmlFor="confirmPassword" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>Confirm New Password</label>
      <input 
        type="password" 
        name="confirmPassword" 
        id="confirmPassword" 
        value={passwordData.confirmPassword} 
        onChange={handlePasswordChange} 
        className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
          focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
          placeholder:text-[${colors.TEXT_DISABLED}]`}
        placeholder="Confirm new password"
        required 
      />
    </div>
    <div className="flex justify-end">
      <button type="submit" className={`px-6 py-3 bg-[${colors.ACCENT_PURPLE}] text-[${colors.PAGE_BG}] font-semibold rounded-md hover:bg-[${colors.ACCENT_PURPLE}]/90 transition-colors`}>Update Password</button>
    </div>
  </form>
)

const NotificationSettings = ({ colors }) => (
  <div>
    <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Notifications</h2>
    <p className={`text-[${colors.TEXT_SECONDARY}]`}>Notification settings will be available in a future update.</p>
  </div>
)

const AccountActions = ({ setShowDeleteModal, colors }) => (
  <div className="space-y-6">
    <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}]`}>Account Actions</h2>
    <div className={`p-4 bg-[${colors.CARD_INNER_BG}] rounded-lg border border-[${colors.BORDER}]`}>
      <div className="flex items-center gap-3 mb-3">
        <ExclamationTriangleIcon className={`h-6 w-6 text-[${colors.ACCENT_ORANGE}]`} />
        <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}]`}>Delete Account</h3>
      </div>
      <p className={`text-sm text-[${colors.TEXT_SECONDARY}] mb-4`}>
        Once you delete your account, there is no going back. Please be certain.
      </p>
      <button
        onClick={() => setShowDeleteModal(true)}
        className={`px-4 py-2 bg-[${colors.ACCENT_RED}] text-[${colors.PAGE_BG}] text-sm font-medium rounded-md hover:bg-[${colors.ACCENT_RED}]/90 transition-colors`}
      >
        Delete Account
      </button>
    </div>
  </div>
)

const DeleteAccountModal = ({ setShowDeleteModal, handleDeleteAccount, setDeleteConfirmation, deleteConfirmation, userEmail, colors }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className={`bg-[${colors.PANEL_BG}] rounded-lg p-6 max-w-md w-full mx-4`}>
      <h3 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Delete Account</h3>
      <p className={`text-sm text-[${colors.TEXT_SECONDARY}] mb-4`}>
        This action cannot be undone. This will permanently delete your account and remove all your data.
      </p>
      <div className="mb-4">
        <label htmlFor="deleteConfirmation" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
          Type your email to confirm: <span className={`text-[${colors.TEXT_PRIMARY}]`}>{userEmail}</span>
        </label>
        <input
          type="email"
          id="deleteConfirmation"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
            focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
            placeholder:text-[${colors.TEXT_DISABLED}]`}
          placeholder="Enter your email to confirm"
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setShowDeleteModal(false)}
          className={`px-4 py-2 bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}] text-sm font-medium rounded-md hover:bg-[${colors.BORDER}] transition-colors`}
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteAccount}
          className={`px-4 py-2 bg-[${colors.ACCENT_RED}] text-[${colors.PAGE_BG}] text-sm font-medium rounded-md hover:bg-[${colors.ACCENT_RED}]/90 transition-colors`}
        >
          Delete Account
        </button>
      </div>
    </div>
  </div>
)

export default Profile 