import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './ProjectGrid.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function ProjectGrid({ searchQuery, viewMode, filter, sortBy }) {
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

  // Grid Layout Configuration
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
  const defaultW = 3;
  const defaultH = 2;
  const minW = 2;
  const minH = 2;
  const maxW = 6;
  const maxH = 4;

  // State for layouts and locked projects
  const [layouts, setLayouts] = useState(() => {
    const defaultLayouts = {};
    Object.keys(breakpoints).forEach(bp => {
      defaultLayouts[bp] = [];
    });
    return defaultLayouts;
  });
  const [lockedProjects, setLockedProjects] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Initialize layouts
  useEffect(() => {
    if (!isInitialized) {
      const savedLayouts = localStorage.getItem('taskgrid_layouts');
      const savedLocked = localStorage.getItem('taskgrid_locked');

      if (savedLayouts && savedLocked) {
        try {
          const parsedLayouts = JSON.parse(savedLayouts);
          const parsedLocked = JSON.parse(savedLocked);
          
          // Validate layouts structure
          const isValidLayouts = Object.keys(breakpoints).every(bp => 
            Array.isArray(parsedLayouts[bp])
          );

          if (isValidLayouts) {
            setLayouts(parsedLayouts);
            setLockedProjects(new Set(parsedLocked));
          } else {
            generateDefaultLayouts();
          }
        } catch (e) {
          console.error('Error loading saved layouts:', e);
          generateDefaultLayouts();
        }
      } else {
        generateDefaultLayouts();
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const generateDefaultLayouts = () => {
    const defaultLayouts = {};
    Object.keys(breakpoints).forEach(bp => {
      defaultLayouts[bp] = projects.map((proj, idx) => ({
        i: proj.id.toString(),
        x: (idx * defaultW) % cols[bp],
        y: Math.floor((idx * defaultW) / cols[bp]) * defaultH,
        w: defaultW,
        h: defaultH,
        minW,
        minH,
        maxW,
        maxH,
        isDraggable: true,
        isResizable: true,
        static: false,
        resizeHandles: ['se', 'sw', 'ne', 'nw']
      }));
    });
    setLayouts(defaultLayouts);
  };

  // Handle layout changes
  const handleLayoutChange = (currentLayout, allLayouts) => {
    if (!allLayouts) return;

    try {
      const updatedLayouts = {};
      Object.keys(breakpoints).forEach(bp => {
        if (Array.isArray(allLayouts[bp])) {
          updatedLayouts[bp] = allLayouts[bp].map(item => ({
            ...item,
            isDraggable: !lockedProjects.has(item.i),
            isResizable: !lockedProjects.has(item.i),
            static: lockedProjects.has(item.i),
            resizeHandles: ['se', 'sw', 'ne', 'nw']
          }));
        }
      });
      setLayouts(updatedLayouts);
      localStorage.setItem('taskgrid_layouts', JSON.stringify(updatedLayouts));
    } catch (error) {
      console.error('Error updating layouts:', error);
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
      localStorage.setItem('taskgrid_locked', JSON.stringify([...newSet]));
      return newSet;
    });

    setLayouts(prevLayouts => {
      const updatedLayouts = {};
      Object.keys(prevLayouts).forEach(bp => {
        if (Array.isArray(prevLayouts[bp])) {
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
        }
      });
      return updatedLayouts;
    });
  };

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
    <div className={`layout ${showGrid ? 'show-grid' : ''}`}>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        isDraggable={true}
        isResizable={true}
        onLayoutChange={handleLayoutChange}
        useCSSTransforms={true}
        compactType="vertical"
        preventCollision={false}
        autoSize={true}
      >
        {filteredProjects.map(project => (
          <div key={project.id} className={`project-card ${lockedProjects.has(project.id.toString()) ? 'locked' : ''}`}>
            <div className="drag-handle">
              <span className="text-sm font-medium text-gray-500">Drag to move</span>
              <button
                onClick={() => toggleProjectLock(project.id.toString())}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                {lockedProjects.has(project.id.toString()) ? (
                  <LockClosedIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <LockOpenIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            <div className="p-4">
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
      </ResponsiveGridLayout>
    </div>
  );
} 