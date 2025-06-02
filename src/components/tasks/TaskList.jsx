import { useState } from 'react'
import { PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline'
import moment from 'moment'

const TaskList = ({ tasks, onUpdateTask, onDeleteTask }) => {
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedDueDate, setEditedDueDate] = useState('')
  const [editedStatus, setEditedStatus] = useState('')

  const handleEdit = (task) => {
    setEditingTaskId(task._id)
    setEditedTitle(task.title)
    setEditedDescription(task.description)
    setEditedDueDate(task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : '')
    setEditedStatus(task.status)
  }

  const handleSave = async (taskId) => {
    try {
      await onUpdateTask(taskId, {
        title: editedTitle,
        description: editedDescription,
        dueDate: editedDueDate,
        status: editedStatus
      })
      setEditingTaskId(null)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await onUpdateTask(taskId, { status: newStatus })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-4"
        >
          {editingTaskId === task._id ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="block w-full text-lg font-medium text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-0"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="block w-full text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-0"
                rows={2}
              />
              <div className="flex space-x-4">
                <input
                  type="date"
                  value={editedDueDate}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                  className="block w-full text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-0"
                />
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  className="block w-full text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-0"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSave(task._id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingTaskId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStatusChange(task._id, task.status === 'completed' ? 'todo' : 'completed')}
                    className={`p-1 rounded-full ${
                      task.status === 'completed'
                        ? 'text-green-500 hover:text-green-600'
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <h3 className={`text-lg font-medium ${
                    task.status === 'completed'
                      ? 'text-gray-400 line-through'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {task.title}
                  </h3>
                </div>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  {task.description}
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Due: {moment(task.dueDate).format('MMM D, YYYY')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteTask(task._id)}
                  className="p-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default TaskList 