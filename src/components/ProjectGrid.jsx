import React, { useState, useEffect, useRef } from 'react';
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
  Bars2Icon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useProjectStore } from '../store/projectStore';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './ProjectGrid.css';
import TaskList from './tasks/TaskList';

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
  const [cardStyle, setCardStyle] = useState(() => localStorage.getItem('project_card_style') || 'default'); // 'default' or 'hud'

  // Persist cardStyle to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('project_card_style', cardStyle);
  }, [cardStyle]);

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
        maxH: 8,
      };
    });
  };

  // Helper to generate default layouts for all breakpoints
  const generateDefaultLayouts = () => {
    const baseLayout = generateLayout();
    const allTasksCard = { x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2, maxW: 12, maxH: 12, i: 'all-tasks' };
    const layoutWithAllTasks = [allTasksCard, ...baseLayout];
    const layouts = {};
    Object.keys(breakpoints).forEach(bp => {
      layouts[bp] = layoutWithAllTasks.map(item => ({ ...item }));
    });
    return layouts;
  };

  // Helper to merge new projects and all-tasks into existing layouts
  const mergeLayoutsWithProjects = (layouts, projects) => {
    const updatedLayouts = { ...layouts };
    Object.keys(breakpoints).forEach(bp => {
      if (!Array.isArray(updatedLayouts[bp])) updatedLayouts[bp] = [];
      // Ensure all-tasks card exists
      if (!updatedLayouts[bp].some(item => item.i === 'all-tasks')) {
        console.log(`[mergeLayoutsWithProjects] Adding all-tasks to ${bp}`);
        updatedLayouts[bp].push({ x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2, maxW: 12, maxH: 12, i: 'all-tasks' });
      }
      // Ensure all project cards exist
      projects.forEach((project, idx) => {
        if (!updatedLayouts[bp].some(item => item.i === project._id)) {
          console.log(`[mergeLayoutsWithProjects] Adding project ${project._id} to ${bp}`);
          updatedLayouts[bp].push({
            x: ((idx + 1) * 2) % 12,
            y: Math.floor(idx / 6) * 2 + 1,
            w: 3,
            h: 3,
            minW: 2,
            minH: 2,
            maxW: 6,
            maxH: 8,
            i: project._id
          });
        }
      });
      // Log the layout for this breakpoint
      console.log(`[mergeLayoutsWithProjects] Layout for ${bp}:`, updatedLayouts[bp]);
    });
    return updatedLayouts;
  };

  // Initialize layouts from localStorage
  useEffect(() => {
    try {
      const savedLayouts = localStorage.getItem('taskgrid_layouts');
      console.log('[useEffect] Loaded from localStorage:', savedLayouts);
      if (savedLayouts) {
        const parsedLayouts = JSON.parse(savedLayouts);
        const merged = mergeLayoutsWithProjects(parsedLayouts, projects);
        setLayouts(merged);
        console.log('[useEffect] Set merged layouts:', merged);
      } else {
        const newLayouts = generateDefaultLayouts();
        setLayouts(newLayouts);
        localStorage.setItem('taskgrid_layouts', JSON.stringify(newLayouts));
        console.log('[useEffect] Set new default layouts:', newLayouts);
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
      setLayouts(layouts); // Update state so UI reflects new layout
      localStorage.setItem('taskgrid_layouts', JSON.stringify(layouts));
      console.log('[handleLayoutChange] Saving layouts:', layouts);
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

  // Aggregate all tasks from all projects, sorted by incomplete first (by due date), then completed (by due date)
  const allTasks = transformedProjects
    .flatMap(project => (project.tasks || []).map(task => ({ ...task, projectName: project.name })))
    .sort((a, b) => {
      // Completed tasks always at the bottom
      const aCompleted = a.status === 'completed';
      const bCompleted = b.status === 'completed';
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      // Within each group, sort by due date (no due date last)
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

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
        
        <div className="absolute top-2 right-2 z-10 flex gap-2">
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
          <button
            onClick={() => setCardStyle(cardStyle === 'default' ? 'hud' : 'default')}
            className={`p-2 rounded-full border border-gray-700 bg-gray-800 text-xs text-gray-300 hover:bg-blue-900 hover:text-blue-300 transition-colors duration-150 flex items-center justify-center`}
            aria-label="Toggle card style"
            title="Toggle card style"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 relative pt-16">
          {console.log('[render] ResponsiveGridLayout layouts prop:', layouts)}
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
            breakpoints={breakpoints}
            cols={cols}
            rowHeight={100}
            margin={[16, 16]}
            containerPadding={[16, 16]}
            useCSSTransforms={true}
            preventCollision={false}
            isDraggable={isInitialized}
            isResizable={isInitialized}
            resizeHandles={['se']}
            {...isCompact && { compactType: 'vertical' }}
          >
            {/* All Tasks Card */}
            <div
              key="all-tasks"
              className={`${cardStyle === 'hud' ? 'project-card-hud' : 'project-card'} group`}
              data-grid={layouts[Object.keys(layouts)[0]]?.find(l => l.i === 'all-tasks') || { x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2, maxW: 12, maxH: 12, i: 'all-tasks' }}
              style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              <div className="drag-handle opacity-0 group-hover:opacity-100"></div>
              <div className="card-tilt-inner" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="card-background-pattern"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="project-title truncate font-bold" style={{ maxWidth: '70%' }}>
                    All Tasks
                  </span>
                </div>
                {/* Progress bar and task count for All Tasks */}
                <div className="progress-section mb-2">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${allTasks.length === 0 ? 0 : Math.round((allTasks.filter(t => t.status === 'completed').length / allTasks.length) * 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{allTasks.length === 0 ? 0 : Math.round((allTasks.filter(t => t.status === 'completed').length / allTasks.length) * 100)}% Complete</span>
                    <span>{`${allTasks.filter(t => t.status === 'completed').length} of ${allTasks.length} completed`}</span>
                  </div>
                </div>
                <div className="task-list-preview mt-2" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <div className="task-list-scroll" style={{ maxHeight: '100%', overflowY: 'auto', minHeight: 0, flex: 1 }}>
                    {allTasks.length > 0 ? (
                      <TaskList tasks={allTasks} onUpdateTask={onUpdateTask} onDeleteTask={() => {}} colors={{
                        PANEL_BG: '#0B0C1D',
                        TEXT_PRIMARY: '#E0E0E0',
                        TEXT_SECONDARY: '#A0A0B5',
                        BORDER: '#2E2E2E',
                        ACCENT_PURPLE: '#7C3AED',
                        TEXT_DISABLED: '#999999',
                      }} />
                    ) : (
                      <div className="text-xs text-gray-500">No tasks</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {filteredProjects.map(project => {
              const layout = layouts.lg?.find(l => l.i === project.id) || { x: 0, y: 0, w: 3, h: 3 };
              const cardRef = useRef(null);
              const sortedTasks = [...project.tasks].sort((a, b) => {
                if (a.status === 'completed' && b.status !== 'completed') return 1;
                if (a.status !== 'completed' && b.status === 'completed') return -1;
                return 0;
              });
              return (
                <div
                  key={project.id}
                  ref={cardRef}
                  className={`${cardStyle === 'hud' ? 'project-card-hud' : 'project-card'} group`}
                  data-grid={layout}
                  style={{display: 'flex', flexDirection: 'column', minHeight: 0}}
                >
                  <div className="drag-handle opacity-0 group-hover:opacity-100"></div>
                  <div className="card-tilt-inner" style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
                    <div className="card-background-pattern"></div>
                    <div className="flex items-center justify-between mb-2">
                      <Link to={`/projects/${project.id}`} className="project-title truncate" style={{maxWidth: '70%'}}>
                        {project.name}
                      </Link>
                      <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>{project.status}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1 ml-auto w-fit">
                      <span className="align-middle">{getPriorityIndicator(project.priority)}</span>
                    </div>
                    <div className="progress-section mb-2">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{project.progress}% Complete</span>
                        {/* Number of tasks indicator, same format as All Tasks card */}
                        <span>{`${project.tasks.filter(t => t.status === 'completed').length} of ${project.tasks.length} completed`}</span>
                      </div>
                      {project.hasOverdueTasks && <span className="overdue-indicator">Overdue</span>}
                    </div>
                    <div className="task-list-preview mt-2" style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
                      <div className="task-list-scroll" style={{maxHeight: '100%', overflowY: 'auto', minHeight: 0, flex: 1}}>
                        {sortedTasks.length > 0 ? (
                          <>
                            {sortedTasks.map((task, idx) => (
                              <div
                                key={task._id || task.id || idx}
                                className="flex items-center mb-2 bg-opacity-70 relative"
                              >
                                <label className="custom-checkbox mr-2">
                                  <input
                                    type="checkbox"
                                    checked={task.status === 'completed'}
                                    onChange={() => {
                                      if (onUpdateTask) {
                                        const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
                                        onUpdateTask(project.id, task._id || task.id, { status: newStatus });
                                      }
                                    }}
                                  />
                                  <span className={`circle${task.status === 'completed' ? ' checked' : ''}`}></span>
                                </label>
                                <div style={{flex: 1, minWidth: 0}}>
                                  <span className={task.status === 'completed' ? 'line-through text-gray-500' : ''} style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block'}}>{task.title}</span>
                                  {task.description && (
                                    <span className="block text-xs text-gray-400" style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>{task.description}</span>
                                  )}
                                </div>
                                {task.dueDate && (
                                  <span className="text-gray-400 text-xs ml-2" style={{minWidth: '56px', textAlign: 'right', display: 'inline-block'}}>
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {task.status !== 'completed' && (() => {
                                      const now = new Date();
                                      const due = new Date(task.dueDate);
                                      const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                                      if (!isNaN(diff)) {
                                        if (diff === 0) {
                                          return <span className="ml-1 text-red-400">(Today)</span>;
                                        } else if (diff > 0) {
                                          return <span className="ml-1 text-red-400">({diff}d left)</span>;
                                        } else if (diff < 0) {
                                          return <span className="ml-1 text-red-400">({Math.abs(diff)}d ago)</span>;
                                        }
                                      }
                                      return null;
                                    })()}
                                  </span>
                                )}
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-xs text-gray-500">No tasks</div>
                        )}
                      </div>
                    </div>
                    <div className="action-buttons opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 flex gap-2 absolute bottom-3 right-3 z-10">
                      <button className="action-button" onClick={() => handleEditProject(project.id)} title="Edit">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button className="action-button delete-button" onClick={() => handleDeleteProject(project.id)} title="Delete">
                        <TrashIcon className="w-5 h-5" />
                      </button>
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