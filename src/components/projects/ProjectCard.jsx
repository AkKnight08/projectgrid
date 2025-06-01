import { Link } from 'react-router-dom'
import { useProjectStore } from '../../store/projectStore'

const ProjectCard = ({ project }) => {
  const { updateTask } = useProjectStore()
  
  const progress = project.tasks?.length
    ? Math.round(
        (project.tasks.filter((task) => task.done).length / project.tasks.length) * 100
      )
    : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {project.name}
        </h3>
        <Link
          to={`/projects/${project.id}`}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          View Details
        </Link>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          {project.tasks?.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() =>
                  updateTask(project.id, task.id, { done: !task.done })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span
                className={`ml-2 text-sm ${
                  task.done
                    ? 'text-gray-500 line-through'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {task.title}
              </span>
            </div>
          ))}
          {project.tasks?.length > 3 && (
            <p className="text-sm text-gray-500">
              +{project.tasks.length - 3} more tasks
            </p>
          )}
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {progress}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-primary-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard 