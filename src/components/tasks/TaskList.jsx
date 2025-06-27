import { useState } from 'react'
import { PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline'
import moment from 'moment'

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, colors, allTasksStyle }) => {
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedDueDate, setEditedDueDate] = useState('')
  const [editedStatus, setEditedStatus] = useState('')

  const defaultColors = {
    PANEL_BG: 'rgba(11, 12, 29, 1)',
    TEXT_PRIMARY: '#E0E0E0',
    TEXT_SECONDARY: '#A0A0B5',
    BORDER: '1.5px solid rgba(80,100,180,0.10)',
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
      console.log('[TaskList] handleSave: calling onUpdateTask with', { taskId, title: editedTitle, description: editedDescription, dueDate: editedDueDate, status: editedStatus });
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
      console.log('[TaskList] handleStatusChange: calling onUpdateTask with', { taskId, status: newStatus });
      await onUpdateTask(taskId, { status: newStatus })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  // Subcomponents for All Tasks card
  const TaskCircle = ({ completed, onClick }) => (
    <span
      onClick={onClick}
      className={`inline-block w-4 h-4 rounded-full border-2 mr-3 cursor-pointer transition-colors duration-200 ${completed ? 'border-green-500 bg-green-500' : 'border-gray-400'}`}
      style={{ minWidth: 16, minHeight: 16, backgroundColor: completed ? '#22d47b' : 'transparent', borderColor: completed ? '#22d47b' : '#a3a3a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      title={completed ? 'Mark as incomplete' : 'Mark as complete'}
    ></span>
  );

  const TaskInfo = ({ title, description, completed }) => (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <span className={completed ? 'line-through text-gray-500' : ''} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', color: '#fff', fontWeight: 500 }}>{title}</span>
      {description && (
        <span className="block text-xs" style={{ color: '#bdbdbd', whiteSpace: 'normal', wordBreak: 'break-word', marginTop: 2 }}>{description}</span>
      )}
    </div>
  );

  const TaskDate = ({ dueDate }) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    let extra = null;
    if (!isNaN(diff)) {
      if (diff === 0) {
        extra = <span className="ml-1 text-red-400">(Today)</span>;
      } else if (diff > 0) {
        if (diff > 3) {
          extra = <span className="ml-1 text-green-400">({diff}d left)</span>;
        } else {
          extra = <span className="ml-1 text-red-400">({diff}d left)</span>;
        }
      } else if (diff < 0) {
        extra = <span className="ml-1 text-red-400">({Math.abs(diff)}d ago)</span>;
      }
    }
    return (
      <span
        className="text-gray-400 text-xs ml-2"
        style={{ minWidth: 56, textAlign: 'right', display: 'inline-block', color: '#bdbdbd' }}
      >
        {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        {extra}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          style={{ backgroundColor: allTasksStyle ? '#000' : colors.PANEL_BG, color: allTasksStyle ? '#fff' : undefined }}
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
            <div className={`flex ${allTasksStyle ? 'flex-col h-full justify-between' : 'items-start'} justify-between`} style={allTasksStyle ? { minHeight: 60 } : {}}>
              <div className="flex-1 h-full">
                {allTasksStyle ? (
                  <div className="task-item" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.375rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                    <TaskCircle
                      completed={task.status === 'completed'}
                      onClick={() => {
                        if (onUpdateTask) {
                          const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
                          onUpdateTask(task.projectId || task.project || '', task._id, { status: newStatus });
                        }
                      }}
                    />
                    <TaskInfo title={task.title} description={task.description} completed={task.status === 'completed'} />
                    <TaskDate dueDate={task.dueDate} />
                  </div>
                ) : (
                  <div className="flex items-start gap-2 w-full">
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
                    style={{color: task.status === 'completed' ? colors.TEXT_DISABLED : colors.TEXT_PRIMARY, marginBottom: 0}}
                    >
                      {task.title}
                    </h3>
                  </div>
                )}
              </div>
              {!allTasksStyle && (
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
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default TaskList 