import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useTheme } from '../context/ThemeContext';
import { DARK_MODE_COLORS, BACKGROUND_COLORS } from '../constants/colors';
import { PlusIcon, ArrowsUpDownIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import '../styles/TaskPage.css';

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-500 text-white';
    case 'medium': return 'bg-yellow-500 text-white';
    case 'low': return 'bg-green-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
};

const TaskPage = () => {
  const { tasks, fetchTasks, loading } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const colors = theme === 'dark' ? DARK_MODE_COLORS : {
    PAGE_BG: BACKGROUND_COLORS.MAIN,
    PANEL_BG: '#FFFFFF',
    PANEL_BG_HOVER: '#F3F4F6',
    CARD_INNER_BG: '#FFFFFF',
    BORDER: '#E5E5E5',
    TEXT_PRIMARY: '#1A1A1A',
    TEXT_SECONDARY: '#666666',
    ACCENT_PURPLE: '#7C3AED',
    ACCENT_PURPLE_LIGHT: '#F5F3FF',
    ICON_DEFAULT: '#666666',
    ICON_HOVER: '#1A1A1A'
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
  };

  return (
    <div 
      className="task-page-container"
      style={{
        '--page-bg': colors.PAGE_BG,
        '--text-primary': colors.TEXT_PRIMARY,
        '--border-color': colors.BORDER,
        '--panel-bg-hover': colors.PANEL_BG_HOVER,
        '--accent-purple-light': colors.ACCENT_PURPLE_LIGHT,
        '--accent-purple': colors.ACCENT_PURPLE,
        '--text-secondary': colors.TEXT_SECONDARY,
        '--icon-default': colors.ICON_DEFAULT,
        '--icon-hover': colors.ICON_HOVER,
      }}
    >
      <div className="task-list-panel">
        <div className="task-list-header">
          <h2 className="task-list-title">All Tasks</h2>
          <div className="task-list-actions">
            <button title="New Task"><PlusIcon className="w-5 h-5" /></button>
            <button title="Sort Tasks"><ArrowsUpDownIcon className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="task-list">
          {loading ? (
            <p className="p-4">Loading tasks...</p>
          ) : (
            tasks.map(task => (
              <div 
                key={task._id} 
                className={`task-item ${selectedTask?._id === task._id ? 'selected' : ''}`}
                onClick={() => handleSelectTask(task)}
              >
                <div className="task-item-title">{task.name}</div>
                <div className="task-item-details">
                  <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'No date'}</span>
                  <span className={`priority-tag ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="task-detail-panel">
        {selectedTask ? (
          <div>
            <h1 className="text-3xl font-bold mb-2">{selectedTask.name}</h1>
            <p className="text-gray-500 mb-6">{selectedTask.description}</p>
            {/* More task details here */}
          </div>
        ) : (
          <div className="no-task-selected">
            <DocumentMagnifyingGlassIcon className="w-24 h-24 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold">Select a task</h3>
            <p>Choose a task from the list to see its details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPage; 