import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'

const ProjectCard = ({ project }) => {
  const { deleteProject } = useProjectStore()
  const [isDeleting, setIsDeleting] = useState(false)

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
        <div className="flex space-x-2">
          <Link
            to={`/projects/${project._id}`}
            className="text-primary-600 hover:text-primary-700"
          >
            View
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <span className="font-medium">Status:</span>{' '}
          <span className="capitalize">{project.status}</span>
        </div>
        <div>
          <span className="font-medium">Priority:</span>{' '}
          <span className="capitalize">{project.priority}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-500">
          <div>
            <span className="font-medium">Start:</span>{' '}
            {new Date(project.startDate).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">End:</span>{' '}
            {new Date(project.endDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard 