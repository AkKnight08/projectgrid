import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar'
import Sidebar from './Sidebar'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query) => {
    setSearchQuery(query)
    // You can add additional search logic here
  }

  return (
    <div className="min-h-screen bg-[#1E1E2D] overflow-x-hidden">
      <div className="flex h-screen relative">
        <div className="hidden lg:flex lg:flex-col lg:w-64 flex-shrink-0">
          <div className="h-16 flex items-center justify-center">
            <Link to="/" className="text-2xl font-bold tracking-wider uppercase">
              Plan<span className="text-white/80 italic font-normal">Pro</span>
            </Link>
          </div>
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <Navbar onSearch={handleSearch} />
          <main className="flex-1 overflow-y-auto p-6 bg-[#1E1E1E]">
            <Outlet context={{ searchQuery }} />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout 