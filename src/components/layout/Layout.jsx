import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar'
import Sidebar from './Sidebar'
import { useState } from 'react'

const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query) => {
    setSearchQuery(query)
    // You can add additional search logic here
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onSearch={handleSearch} />
      <div className="flex h-[calc(100vh-60px)]">
        <div className="hidden lg:block lg:w-64">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  )
}

export default Layout 