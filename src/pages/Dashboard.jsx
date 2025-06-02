import { useState, useEffect } from 'react';
import QuickStats from '../components/QuickStats';
import ProjectGrid from '../components/ProjectGrid';
import DashboardStats from '../components/DashboardStats';
import { useProjectStore } from '../store/projectStore';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const { projects, fetchProjects, isLoading } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[1.5rem] font-semibold text-white">Dashboard</h1>
      </div>

      {/* Quick Stats */}
      <div className="mb-6">
        <QuickStats />
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accentBlue hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accentBlue">
          Add New Project
        </button>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="block w-40 pl-3 pr-10 py-2 text-base border-[#3A3A4F] bg-[#2A2A3B] text-textPrimary focus:outline-none focus:ring-accentBlue focus:border-accentBlue sm:text-sm rounded-md"
        >
          <option value="all">All Projects</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="block w-48 pl-3 pr-10 py-2 text-base border-[#3A3A4F] bg-[#2A2A3B] text-textPrimary focus:outline-none focus:ring-accentBlue focus:border-accentBlue sm:text-sm rounded-md"
        >
          <option value="name">Name A→Z</option>
          <option value="progress">Progress %</option>
          <option value="deadline">Deadline Soonest</option>
        </select>

        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-[#3A3A4F] text-sm font-medium ${
              viewMode === 'grid' 
                ? 'bg-[#3B3B5A] text-white border-accentBlue' 
                : 'bg-[#2A2A3B] text-textSecondary hover:bg-[#3A3A4F] hover:text-white'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-[#3A3A4F] text-sm font-medium ${
              viewMode === 'list' 
                ? 'bg-[#3B3B5A] text-white border-accentBlue' 
                : 'bg-[#2A2A3B] text-textSecondary hover:bg-[#3A3A4F] hover:text-white'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Grid */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accentBlue"></div>
            </div>
          ) : (
            <ProjectGrid
              projects={projects}
              searchQuery={searchQuery}
              viewMode={viewMode}
              filter={filter}
              sortBy={sortBy}
            />
          )}
        </div>

        {/* Stats & Activity */}
        <div className="lg:col-span-1">
          <DashboardStats />
        </div>
      </div>
    </div>
  );
} 