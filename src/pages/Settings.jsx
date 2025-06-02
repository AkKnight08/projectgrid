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
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="h-full bg-[#F5F5F5] p-6 pt-16 pb-12">
      {/* Page Title */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-[1.5rem] font-semibold text-gray-900 mb-6">Settings</h1>

        {/* Breadcrumbs */}
        <div className="text-[0.875rem] text-gray-500 mb-8">
          <span className="hover:text-gray-900 cursor-pointer">Dashboard</span>
          <span className="mx-2">/</span>
          <span>Settings</span>
        </div>

        {/* Content Area */}
        <div className="flex gap-8 bg-[#F5F5F5] rounded-lg mt-4">
          {/* Tab Navigation */}
          <div className="w-[240px] bg-white rounded-lg p-4 flex flex-col gap-2 sticky top-6 h-fit">
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
                      ? 'bg-white text-gray-900 border-l-4 border-blue-500 -ml-1 shadow-sm' 
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  {tab.name}
                </button>
              )
            })}
          </div>

          {/* Tab Panels */}
          <div className="flex-1 bg-white rounded-lg p-8">
            {activeTab === 'general' && (
              <div role="tabpanel" aria-labelledby="tab-general" className="space-y-6">
                {/* Workspace Information */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Workspace Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-600 mb-1">
                        Workspace Name
                      </label>
                      <input
                        type="text"
                        id="workspaceName"
                        placeholder="Enter workspace name"
                        className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-900 px-4 py-2 text-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="workspaceUrl" className="block text-sm font-medium text-gray-600 mb-1">
                        Workspace URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="workspaceUrl"
                          value="https://projectpulse.com/my-team"
                          readOnly
                          className="flex-1 bg-gray-100 border border-gray-300 rounded-md text-gray-500 px-4 py-2 text-sm cursor-not-allowed"
                        />
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Language & Locale */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Language & Locale</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-600 mb-1">
                        Primary Language
                      </label>
                      <select
                        id="language"
                        className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-900 px-4 py-2 text-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-600 mb-1">
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-900 px-4 py-2 text-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
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
                  <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div role="tabpanel" aria-labelledby="tab-account" className="space-y-6">
                {/* Profile Information */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-600 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        placeholder="Enter your full name"
                        className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-900 px-4 py-2 text-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-600 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        placeholder="Enter your display name"
                        className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-900 px-4 py-2 text-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                        Email Address
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          id="email"
                          value="user@example.com"
                          readOnly
                          className="flex-1 bg-gray-100 border border-gray-300 rounded-md text-gray-500 px-4 py-2 text-sm cursor-not-allowed"
                        />
                        <button className="px-4 py-2 text-blue-500 hover:text-blue-600 transition-colors text-sm">
                          Change Email
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-900 px-4 py-2 text-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full border-2 border-gray-300 bg-blue-500 flex items-center justify-center text-white text-xl font-medium">
                          U
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
                            Upload Photo
                          </button>
                          <button className="px-4 py-2 text-red-500 hover:text-red-600 transition-colors text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Password Change */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-600 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        placeholder="••••••••"
                        className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-900 px-4 py-2 text-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="newPassword"
                          placeholder="••••••••"
                          className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-900 px-4 py-2 text-sm
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900">
                          👁️
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      <div className="mt-2">
                        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-red-500"></div>
                        </div>
                        <span className="text-xs text-red-500 mt-1">Weak</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        placeholder="••••••••"
                        className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-900 px-4 py-2 text-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div role="tabpanel" aria-labelledby="tab-appearance" className="space-y-6">
                {/* Theme Selection */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Theme Selection</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', name: 'Light Mode', icon: '☀️' },
                      { id: 'dark', name: 'Dark Mode', icon: '🌙' },
                      { id: 'system', name: 'System Default', icon: '🖥️' }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        className={`flex items-center gap-2 p-4 rounded-md border transition-colors
                          ${theme.id === 'dark'
                            ? 'bg-gray-200 border-blue-500 text-gray-900'
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                      >
                        <span className="text-xl">{theme.icon}</span>
                        <span className="text-sm font-medium">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Font Size */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Font Size</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">12pt</span>
                      <span className="text-sm text-gray-600">18pt</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="18"
                      defaultValue="14"
                      className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-blue-500
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                    <div className="text-center">
                      <span className="text-sm text-gray-600">Current: 14pt</span>
                    </div>
                  </div>
                </section>

                {/* Sidebar Position */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Sidebar Position</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'left', name: 'Left', icon: '◀️' },
                      { id: 'right', name: 'Right', icon: '▶️' }
                    ].map(position => (
                      <button
                        key={position.id}
                        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-md border transition-colors
                          ${position.id === 'left'
                            ? 'bg-gray-200 border-blue-500 text-gray-900'
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
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
                  <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div role="tabpanel" aria-labelledby="tab-notifications" className="space-y-6">
                {/* Email Notifications */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h2>
                  <div className="space-y-4">
                    {[
                      'New Task Assigned',
                      'Task Deadline Approaching',
                      'Project Status Changed',
                      'Weekly Summary'
                    ].map((notification, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{notification}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

                {/* In-App Notifications */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">In-App Notifications</h2>
                  <div className="space-y-4">
                    {[
                      'Show banner for new comments',
                      'Show toast for task updates',
                      'Mute sounds'
                    ].map((notification, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{notification}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Push Notifications */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Enable push notifications on mobile app.
                    </p>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
                      Send Test Notification
                    </button>
                  </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div role="tabpanel" aria-labelledby="tab-integrations" className="space-y-6">
                {/* Connected Apps */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Apps</h2>
                  <div className="space-y-3">
                    {[
                      { name: 'Google Calendar', status: 'connected' },
                      { name: 'Slack', status: 'not-connected' },
                      { name: 'GitHub', status: 'connected' }
                    ].map((app, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-200 border border-gray-300 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-gray-300 flex items-center justify-center">
                            {app.name[0]}
                          </div>
                          <span className="text-sm text-gray-600">{app.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              app.status === 'connected'
                                ? 'bg-green-500 text-green-900'
                                : 'bg-red-500 text-red-900'
                            }`}
                          >
                            {app.status === 'connected' ? 'Connected' : 'Not Connected'}
                          </span>
                          <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              app.status === 'connected'
                                ? 'bg-red-500 text-red-900 hover:bg-red-600'
                                : 'bg-blue-500 text-blue-900 hover:bg-blue-600'
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">API Key Management</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-200 border border-gray-300 rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Your API Key:</span>
                        <span className="text-sm text-gray-900">••••-••••-ABCD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                          📋
                        </button>
                        <button className="px-4 py-2 bg-amber-500 text-amber-900 rounded-md hover:bg-amber-600 transition-colors text-sm">
                          Regenerate Key
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Current Plan: <span className="text-gray-900 font-medium">Pro</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Next Billing Date: <span className="text-gray-900">Jul 15, 2025</span>
                    </p>
                  </div>
                </section>

                {/* Plan Options */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
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
                        className="flex flex-col p-6 bg-gray-200 border border-gray-300 rounded-lg"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                        <p className={`text-2xl font-bold mb-4 ${plan.current ? 'text-blue-500' : 'text-gray-600'}`}>
                          {plan.price}<span className="text-sm font-normal text-gray-600">/month</span>
                        </p>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="text-green-500">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <button
                          className={`mt-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            plan.current
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="flex items-center justify-between p-4 bg-gray-200 border border-gray-300 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 rounded bg-gray-300 flex items-center justify-center">
                        💳
                      </div>
                      <span className="text-sm text-gray-600">Card ending in 1234</span>
                    </div>
                    <button className="px-4 py-2 bg-accentAmber text-[#0F172A] rounded-md hover:bg-[#D97706] transition-colors text-sm">
                      Update Card
                    </button>
                  </div>
                </section>

                {/* Billing History */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">Billing History</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#3A3A4F]">
                          <th className="text-left py-3 px-4 text-sm font-medium text-textSecondary">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-textSecondary">Description</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-textSecondary">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-textSecondary">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { date: 'Jul 15, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
                          { date: 'Jun 15, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
                          { date: 'May 15, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' }
                        ].map((item, index) => (
                          <tr key={index} className="border-b border-[#3A3A4F] hover:bg-[#3A3A4F]">
                            <td className="py-3 px-4 text-sm text-textSecondary">{item.date}</td>
                            <td className="py-3 px-4 text-sm text-textSecondary">{item.description}</td>
                            <td className="py-3 px-4 text-sm text-textSecondary">{item.amount}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-accentGreen text-[#0F172A]">
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
                  <h2 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-textSecondary">Enable two-factor authentication for additional security</p>
                        <p className="text-xs text-textMuted mt-1">Requires an authenticator app like Google Authenticator</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked="true"
                        className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#3A3A4F] transition-colors"
                      >
                        <span className="sr-only">Enable 2FA</span>
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-4" />
                      </button>
                    </div>
                    <div className="p-4 bg-[#2A2A3B] border border-[#3A3A4F] rounded-md">
                      <p className="text-sm text-textSecondary mb-4">Scan this QR code with your authenticator app</p>
                      <div className="w-48 h-48 bg-white rounded-md flex items-center justify-center mb-4">
                        {/* QR Code placeholder */}
                        <span className="text-4xl">📱</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">Backup Codes</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456'].map((code, index) => (
                            <div
                              key={index}
                              className="p-2 bg-[#3A3A4F] text-textSecondary text-sm text-center rounded-md"
                            >
                              {code}
                            </div>
                          ))}
                        </div>
                        <button className="px-4 py-2 bg-accentAmber text-[#0F172A] rounded-md hover:bg-[#D97706] transition-colors text-sm">
                          Regenerate Codes
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Session Management */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">Active Sessions</h2>
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
                        className="flex items-center justify-between p-4 bg-[#2A2A3B] border border-[#3A3A4F] rounded-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-md bg-[#3A3A4F] flex items-center justify-center">
                            {session.device.includes('Mac') ? '💻' : '📱'}
                          </div>
                          <div>
                            <p className="text-sm text-white">{session.device}</p>
                            <p className="text-xs text-textSecondary">
                              {session.location} • {session.browser} • {session.lastActive}
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-accentRed text-white rounded-md hover:bg-[#991B1B] transition-colors text-sm">
                          Sign Out
                        </button>
                      </div>
                    ))}
                    <button className="w-full px-4 py-2 bg-accentRed text-white rounded-md hover:bg-[#991B1B] transition-colors text-sm">
                      Sign out of all sessions
                    </button>
                  </div>
                </section>

                {/* Delete Account */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">Delete Account</h2>
                  <div className="p-4 bg-[#2C1515] border border-[#491111] rounded-md">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🛑</span>
                      <div className="space-y-4">
                        <p className="text-sm text-textSecondary">
                          Deleting your account is permanent and cannot be undone. All your data will be permanently removed.
                        </p>
                        <div>
                          <label htmlFor="deleteConfirm" className="block text-sm font-medium text-textSecondary mb-2">
                            Type DELETE to confirm
                          </label>
                          <input
                            type="text"
                            id="deleteConfirm"
                            placeholder="Type DELETE"
                            className="w-full bg-[#2A2A3B] border border-[#3A3A4F] rounded-md text-textPrimary px-4 py-2 text-sm
                              focus:border-accentRed focus:ring-2 focus:ring-accentRed/30 focus:outline-none"
                          />
                        </div>
                        <button
                          disabled
                          className="px-6 py-3 bg-accentRed text-white rounded-md hover:bg-[#991B1B] transition-colors text-sm
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