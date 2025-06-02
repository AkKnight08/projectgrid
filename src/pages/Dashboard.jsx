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
    <div className="h-full overflow-y-auto">
      {/* Page Header */}
      <div className="page-header pb-2 border-b border-[#3A3A4F] flex items-center">
        <h1 className="header-title text-[1.5rem] font-semibold text-[#E0E0E0] m-0 font-['Inter']">Dashboard</h1>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <QuickStats />
      </div>

      {/* Action Bar */}
      <div className="action-bar flex flex-wrap items-center gap-4 py-2 border-b border-[#3A3A4F] mt-4">
        <button className="btn-primary bg-[#3B82F6] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-lg hover:bg-[#2563EB] transition-colors duration-200">
          ＋ Add New Project
        </button>

        <div className="dropdown-group flex flex-wrap gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="dropdown-filter bg-[#2A2A3B] text-[#E0E0E0] border border-[#3A3A4F] px-4 py-2 rounded-md text-sm cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] focus:border-[#6366F1] focus:shadow-[0_0_0_2px_rgba(99,102,241,0.3)] outline-none"
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="dropdown-sort bg-[#2A2A3B] text-[#E0E0E0] border border-[#3A3A4F] px-4 py-2 rounded-md text-sm cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] focus:border-[#6366F1] focus:shadow-[0_0_0_2px_rgba(99,102,241,0.3)] outline-none"
          >
            <option value="name">Name A→Z</option>
            <option value="progress">Progress %</option>
            <option value="deadline">Deadline Soonest</option>
          </select>
        </div>

        <div className="view-toggle flex ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`toggle-btn w-10 h-10 flex items-center justify-center text-xl border border-[#3A3A4F] rounded-md transition-colors duration-200 ${
              viewMode === 'grid' 
                ? 'bg-[#6366F1] text-white' 
                : 'bg-[#2A2A3B] text-[#A0A0B5] hover:bg-[#3A3A4F] hover:text-white'
            }`}
            title="Grid View"
          >
            🔳
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`toggle-btn w-10 h-10 flex items-center justify-center text-xl border border-[#3A3A4F] rounded-md transition-colors duration-200 ${
              viewMode === 'list' 
                ? 'bg-[#6366F1] text-white' 
                : 'bg-[#2A2A3B] text-[#A0A0B5] hover:bg-[#3A3A4F] hover:text-white'
            }`}
            title="List View"
          >
            📋
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Projects Grid */}
        <div className="projects-section lg:col-span-2">
          <div className="projects-grid-container bg-[#2A2A3B] rounded-lg shadow-[0_6px_18px_rgba(0,0,0,0.6)] p-4 min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
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
        </div>

        {/* Stats & Activity */}
        <div className="stats-section lg:col-span-1">
          <div className="stats-activity-container bg-[#2A2A3B] rounded-lg shadow-[0_6px_18px_rgba(0,0,0,0.6)] p-4">
            <DashboardStats />
          </div>
        </div>
      </div>
    </div>
  );
} 