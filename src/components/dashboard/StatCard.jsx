import React from 'react'

const StatCard = ({ title, value, icon: Icon, iconColor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</div>
        <Icon className={`h-6 w-6 ${iconColor ? iconColor : 'text-gray-400 dark:text-gray-500'}`} aria-hidden="true" />
      </div>
      <div className="px-4 pb-5 sm:px-6 sm:pb-6 mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  )
}

export default StatCard 