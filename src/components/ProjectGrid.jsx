import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

export default function ProjectGrid({ searchQuery, viewMode, filter, sortBy }) {
  // Sample project data - replace with actual data from your store
  const [projects] = useState([
    {
      id: 1,
      name: 'Instagram Page Growth',
      status: 'active',
      deadline: '2025-06-20',
      priority: 'high',
      progress: 60,
      tasks: [
        { id: 1, title: 'Upload 5 Reels', done: true },
        { id: 2, title: 'Draft Content Calendar', done: false },
        { id: 3, title: 'Analyze Engagement', done: false },
        { id: 4, title: 'Research Competitors', done: false },
      ],
      hasOverdueTasks: true,
    },
    // Add more sample projects here
  ]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || project.status === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return b.progress - a.progress;
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new project.
        </p>
        <div className="mt-6">
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Create First Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2' : 'space-y-4'}>
      {filteredProjects.map(project => (
        <div
          key={project.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">
                  <Link to={`/projects/${project.id}`} className="hover:text-blue-600">
                    {project.name}
                  </Link>
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              {project.hasOverdueTasks && (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              )}
            </div>

            {/* Subheader */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div>Due: {new Date(project.deadline).toLocaleDateString()}</div>
              <div className={getPriorityColor(project.priority)}>
                {project.priority === 'high' ? '🔴' : project.priority === 'medium' ? '🟠' : '🟢'} {project.priority}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Task Preview */}
            <div className="space-y-2 mb-4">
              {project.tasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`ml-2 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
              {project.tasks.length > 3 && (
                <p className="text-sm text-gray-500">
                  +{project.tasks.length - 3} more tasks
                </p>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-500">
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-500">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              <Link
                to={`/projects/${project.id}`}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View Details
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 