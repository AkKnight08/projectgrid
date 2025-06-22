import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import { useProjectStore } from '../store/projectStore';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './ProjectGrid.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

// Define GridBackground outside the main component so it's not recreated on every render
const GridBackground = ({ isFixed = false }) => (
  <div className={`${isFixed ? 'fixed' : 'absolute'} inset-0 bg-[#1E1E1E]`}>
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: '25px 25px',
        maskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)',
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.6) 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        maskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)',
      }}
    />
  </div>
);

// Transform API project data to match component requirements
const transformProject = (project) => ({
  id: project._id,
  name: project.name,
  status: project.status || 'active',
  deadline: project.deadline || new Date().toISOString(),
  priority: project.priority || 'medium',
  progress: project.progress || 0,
  tasks: project.tasks || [],
  hasOverdueTasks: project.hasOverdueTasks || false,
  description: project.description
});

const ProjectGrid = ({ 
  projects = [], 
  searchQuery = '', 
  viewMode = 'grid', 
  onUpdateTask
}) => {
  const navigate = useNavigate();
  const { deleteProject } = useProjectStore();
  const [layouts, setLayouts] = useState({
    lg: [], md: [], sm: [], xs: [], xxs: []
  });
  const [lockedProjects, setLockedProjects] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Transform projects when they change
  const transformedProjects = projects.map(transformProject);

  const generateLayout = () => {
    return transformedProjects.map((project, index) => {
      const y = Math.ceil(Math.random() * 4) + 1;
      return {
        x: (index * 2) % 12,
        y: Math.floor(index / 6) * y,
        w: 3,
        h: 3,
        i: project.id.toString(),
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 4,
      };
    });
  };

  // Initialize layouts from localStorage
  useEffect(() => {
    try {
      const savedLayouts = localStorage.getItem('taskgrid_layouts');
      console.log('1. Layout from localStorage on mount:', savedLayouts);
      if (savedLayouts) {
        const parsedLayouts = JSON.parse(savedLayouts);
        const validatedLayouts = {};
        Object.keys(breakpoints).forEach(bp => {
          validatedLayouts[bp] = Array.isArray(parsedLayouts[bp]) ? parsedLayouts[bp] : [];
        });
        setLayouts(validatedLayouts);
      } else {
        const newLayouts = { lg: generateLayout() };
        console.log('2. No saved layout, generated default:', newLayouts);
        setLayouts(newLayouts);
        localStorage.setItem('taskgrid_layouts', JSON.stringify(newLayouts));
      }
    } catch (error) {
      console.error('Error loading layouts:', error);
    }
    setIsInitialized(true);
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = transformedProjects
    .filter(project => {
      return project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    });

  // Handle layout changes
  const handleLayoutChange = (layout, layouts) => {
    if (!isInitialized) return;

    try {
      console.log('3. Layout changed, saving to localStorage and state:', layouts);
      localStorage.setItem('taskgrid_layouts', JSON.stringify(layouts));
      setLayouts(layouts);
    } catch (error) {
      console.error('Error updating layout:', error);
    }
  };

  // Toggle project lock
  const toggleProjectLock = (projectId) => {
    setLockedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });

    setLayouts(prevLayouts => {
      const updatedLayouts = {};
      Object.keys(prevLayouts).forEach(bp => {
        updatedLayouts[bp] = prevLayouts[bp].map(item => {
          if (item.i === projectId) {
            const willBeLocked = !lockedProjects.has(projectId);
            return {
              ...item,
              isDraggable: !willBeLocked,
              isResizable: !willBeLocked,
              static: willBeLocked
            };
          }
          return item;
        });
      });
      localStorage.setItem('taskgrid_layouts', JSON.stringify(updatedLayouts));
      return updatedLayouts;
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge-active';
      case 'on-hold': return 'badge-on-hold';
      case 'completed': return 'badge-completed';
      case 'not started': return 'badge-not-started';
      default: return '';
    }
  };

  // Get priority indicator
  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'high': return '🔴 High Priority';
      case 'medium': return '🟠 Medium Priority';
      case 'low': return '🟢 Low Priority';
      default: return '';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle project edit
  const handleEditProject = (projectId) => {
    navigate(`/projects/edit/${projectId}`);
  };

  // Handle project delete
  const handleDeleteProject = async (projectId) => {
    if (isDeleting) return;
    
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await deleteProject(projectId);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 mb-4">No projects found matching your criteria.</p>
        <Link to="/projects/new" className="text-blue-500 hover:underline">
          Create a new project
        </Link>
      </div>
    );
  }

  return (
    <div className={`project-grid-container ${isFullScreen ? 'fullscreen' : ''} relative`}>
      {isFullScreen && <GridBackground isFixed={true} />}
      <div className={`${isFullScreen ? 'fullscreen-content-wrapper' : ''} relative`}>
        {!isFullScreen && <GridBackground />}
        
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white text-gray-400 hover:text-white"
            aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullScreen ? (
              <ArrowsPointingInIcon className="h-6 w-6" />
            ) : (
              <ArrowsPointingOutIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-4 relative pt-16">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={breakpoints}
            cols={cols}
            rowHeight={100}
            margin={[16, 16]}
            containerPadding={[16, 16]}
            useCSSTransforms={true}
            compactType="vertical"
            preventCollision={false}
            isDraggable={isInitialized}
            isResizable={isInitialized}
            draggableHandle=".drag-handle"
            resizeHandles={['se']}
            onLayoutChange={handleLayoutChange}
            autoSize={true}
          >
            {filteredProjects.map(project => {
              const layout = layouts.lg?.find(l => l.i === project.id) || generateLayout().find(l => l.i === project.id);
              console.log(`4. Applying layout for project ${project.id}:`, layout);
              return (
                <div
                  key={project.id}
                  className={`project-card ${lockedProjects.has(project.id) ? 'locked' : ''}`}
                  data-grid={layout}
                >
                  <div className="h-full flex flex-col">
                    {/* Header Section */}
                    <div className="drag-handle">
                      <span className="drag-text">Drag to move</span>
                      <button
                        onClick={() => toggleProjectLock(project.id)}
                        className="lock-button"
                        aria-label={lockedProjects.has(project.id) ? 'Unlock project' : 'Lock project'}
                      >
                        {lockedProjects.has(project.id) ? (
                          <LockClosedIcon className="w-5 h-5" />
                        ) : (
                          <LockOpenIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="project-content">
                      {/* Title Row */}
                      <div className="title-row">
                        <Link to={`/projects/${project.id}`} className="project-title">
                          {project.name}
                        </Link>
                        <div className="status-group">
                          <span className={getStatusBadgeClass(project.status)}>
                            {project.status.replace(/-/g, ' ')}
                          </span>
                          {project.hasOverdueTasks && (
                            <span className="overdue-indicator" aria-label="Has overdue tasks">❗</span>
                          )}
                        </div>
                      </div>

                      {/* Info Row */}
                      <div className="info-row">
                        <span className="due-date">Due: {formatDate(project.deadline)}</span>
                        <span className="priority-indicator">{getPriorityIndicator(project.priority)}</span>
                      </div>

                      {/* Progress Section */}
                      <div className="progress-section">
                        <div className="progress-label">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Task Preview */}
                      <div className="task-preview">
                        <div className="task-list">
                          {project.tasks.map(task => (
                            <div key={`${project.id}-${task._id || task.id}`} className={`task-item ${task.status === 'completed' ? 'done' : ''}`}>
                              <label className="task-checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={task.status === 'completed'}
                                  onChange={() => {
                                    if (onUpdateTask) {
                                      const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
                                      onUpdateTask(project.id, task._id || task.id, { status: newStatus });
                                    }
                                  }}
                                  className="task-checkbox"
                                />
                                <span className="checkmark"></span>
                              </label>
                              <span className="task-text">{task.title}</span>
                            </div>
                          ))}
                          {project.tasks.length === 0 && (
                            <div className="no-tasks">No tasks added yet</div>
                          )}
                        </div>
                      </div>

                      {/* Footer Section */}
                      <div className="project-footer">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditProject(project.id)}
                            className="action-button edit-button"
                            aria-label="Edit project"
                            disabled={isDeleting}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="action-button delete-button"
                            aria-label="Delete project"
                            disabled={isDeleting}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <Link
                          to={`/projects/${project.id}`}
                          className="view-details-link"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      </div>
    </div>
  );
};

export default ProjectGrid; 