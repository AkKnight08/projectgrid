import { useState } from 'react'
import { PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline'
import moment from 'moment'

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, colors }) => {
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedDueDate, setEditedDueDate] = useState('')
  const [editedStatus, setEditedStatus] = useState('')

  const defaultColors = {
    PANEL_BG: '#0B0C1D',
    TEXT_PRIMARY: '#E0E0E0',
    TEXT_SECONDARY: '#A0A0B5',
    BORDER: '#2E2E2E',
    ACCENT_PURPLE: '#7C3AED',
    TEXT_DISABLED: '#999999',
  };
  colors = colors || defaultColors;

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
          style={{ backgroundColor: colors.PANEL_BG }}
          className="shadow rounded-lg p-4"
        >
          {editingTaskId === task._id ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                style={{color: colors.TEXT_PRIMARY, borderColor: colors.BORDER}}
                className="block w-full text-lg font-medium bg-transparent border-b focus:border-primary-500 focus:ring-0"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                style={{color: colors.TEXT_SECONDARY, borderColor: colors.BORDER}}
                className="block w-full bg-transparent border-b focus:border-primary-500 focus:ring-0"
                rows={2}
              />
              <div className="flex space-x-4">
                <input
                  type="date"
                  value={editedDueDate}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                  style={{color: colors.TEXT_SECONDARY, borderColor: colors.BORDER}}
                  className="block w-full bg-transparent border-b focus:border-primary-500 focus:ring-0"
                />
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  style={{color: colors.TEXT_SECONDARY, backgroundColor: colors.PANEL_BG, borderColor: colors.BORDER}}
                  className="block w-full bg-transparent border-b focus:border-primary-500 focus:ring-0"
                >
                  <option style={{backgroundColor: colors.PANEL_BG, color: colors.TEXT_PRIMARY}} value="todo">To Do</option>
                  <option style={{backgroundColor: colors.PANEL_BG, color: colors.TEXT_PRIMARY}} value="in-progress">In Progress</option>
                  <option style={{backgroundColor: colors.PANEL_BG, color: colors.TEXT_PRIMARY}} value="completed">Completed</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSave(task._id)}
                  style={{backgroundColor: colors.ACCENT_PURPLE, color: '#121212'}}
                  className="px-4 py-2 text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingTaskId(null)}
                  style={{color: colors.TEXT_PRIMARY, borderColor: colors.BORDER}}
                  className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
                        : 'hover:text-gray-500'
                    }`}
                    style={{color: task.status !== 'completed' && colors.TEXT_SECONDARY}}
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <h3 className={`text-lg font-medium ${
                    task.status === 'completed'
                      ? 'line-through'
                      : ''
                  }`}
                  style={{color: task.status === 'completed' ? colors.TEXT_DISABLED : colors.TEXT_PRIMARY}}
                  >
                    {task.title}
                  </h3>
                </div>
                <p className="mt-1" style={{color: colors.TEXT_SECONDARY}}>
                  {task.description}
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm" style={{color: colors.TEXT_SECONDARY}}>
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
                  style={{color: colors.TEXT_SECONDARY}}
                  className="p-2 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this task?')) {
                      onDeleteTask(task._id)
                    }
                  }}
                  style={{color: colors.TEXT_SECONDARY}}
                  className="p-2 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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