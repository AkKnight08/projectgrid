import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '../../store/projectStore'
import {
  CalendarIcon,
  UserGroupIcon,
  TagIcon,
  ChartBarIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline'

const getDaysLeft = (endDate) => {
  if (!endDate) return null;
  const today = new Date();
  const end = new Date(endDate);
  // Zero out time for accurate day diff
  today.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
}

const ProjectCard = ({ project }) => {
  const { deleteProject, updateProject } = useProjectStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setIsDeleting(true)
      try {
        await deleteProject(project._id)
      } catch (error) {
        console.error('Error deleting project:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await updateProject(project._id, { status: newStatus })
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const progress = project.tasks?.length
    ? Math.round(
        (project.tasks.filter((task) => task.status === 'completed').length / project.tasks.length) * 100
      )
    : 0

  const daysLeft = getDaysLeft(project.endDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      {/* Header with Title and Options */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {project.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
            {/* Days Left Indicator */}
            {project.endDate && !['completed','archived'].includes(project.status) && (
              daysLeft < 0 ? (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Overdue</span>
              ) : (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{daysLeft} days left</span>
              )
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {project.description}
          </p>
        </div>
        <div className="relative ml-4 flex-shrink-0">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <Link
                  to={`/projects/${project._id}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Project
                </Link>
                <button
                  onClick={() => handleStatusChange('archived')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                  Archive Project
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="space-y-4 flex-grow">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-gray-900 dark:text-white font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Project Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString()
                : 'No start date'}
            </span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{project.members?.length || 0} members</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <ChartBarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{project.tasks?.length || 0} tasks</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <TagIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{project.tags?.length || 0} tags</span>
          </div>
        </div>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          to={`/projects/${project._id}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View Details
        </Link>
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusChange(project.status === 'active' ? 'completed' : 'active')}
            className={`text-sm px-3 py-1 rounded-md transition-colors duration-200 ${
              project.status === 'active'
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {project.status === 'active' ? 'Mark Complete' : 'Mark Active'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard 