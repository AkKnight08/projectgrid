import { useState, useEffect, useCallback } from 'react';
import { WidthProvider, Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './Dashboard.css';
import { useStore } from '../store'; // Assuming you have a Zustand store

const ResponsiveGridLayout = WidthProvider(Responsive);

// Constants
const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const defaultW = 3;
const defaultH = 2;
const minW = 2;
const minH = 2;
const maxW = 6;
const maxH = 4;

export default function Dashboard() {
  const { projects, updateTask } = useStore();
  const [layouts, setLayouts] = useState({});
  const [lockedProjects, setLockedProjects] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const [showGridLines, setShowGridLines] = useState(false);

  // Initialize or load layouts
  useEffect(() => {
    if (!projects?.length) return;

    const blankLayouts = {};
    Object.keys(breakpoints).forEach(bp => {
      blankLayouts[bp] = [];
    });

    const savedLayouts = localStorage.getItem('taskgrid_layouts');
    if (savedLayouts) {
      try {
        const parsed = JSON.parse(savedLayouts);
        if (Object.keys(breakpoints).every(bp => Array.isArray(parsed[bp]))) {
          setLayouts(parsed);
          setIsInitialized(true);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved layouts:', e);
      }
    }

    // Create default layouts
    const defaultLayouts = {};
    Object.keys(breakpoints).forEach(bp => {
      defaultLayouts[bp] = projects.map((proj, idx) => ({
        i: proj._id,
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
    setIsInitialized(true);
  }, [projects]);

  const handleLayoutChange = useCallback((currentLayout, allLayouts) => {
    if (!isInitialized) return;

    const updatedLayouts = {};
    Object.keys(breakpoints).forEach(bp => {
      const arr = Array.isArray(allLayouts[bp]) ? allLayouts[bp] : [];
      updatedLayouts[bp] = arr.map(item => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW,
        minH,
        maxW,
        maxH,
        isDraggable: !lockedProjects.has(item.i),
        isResizable: !lockedProjects.has(item.i),
        static: lockedProjects.has(item.i),
        resizeHandles: ['se', 'sw', 'ne', 'nw']
      }));
    });

    setLayouts(updatedLayouts);
    localStorage.setItem('taskgrid_layouts', JSON.stringify(updatedLayouts));
  }, [lockedProjects, isInitialized]);

  const toggleProjectLock = useCallback((projectId) => {
    setLockedProjects(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(projectId)) newSet.delete(projectId);
      else newSet.add(projectId);
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
  }, [lockedProjects]);

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setShowGridLines(prev => !prev)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {showGridLines ? 'Hide Gridlines' : 'Show Gridlines'}
        </button>
        <button
          onClick={() => setIsCompact(prev => !prev)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isCompact ? 'Disable Compact' : 'Enable Compact'}
        </button>
      </div>

      <ResponsiveGridLayout
        className={`layout ${showGridLines ? 'show-grid' : ''}`}
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        useCSSTransforms={true}
        compactType={isCompact ? 'vertical' : null}
        preventCollision={!isCompact}
        isDraggable={!isCompact && isInitialized}
        isResizable={!isCompact && isInitialized}
        draggableHandle=".drag-handle"
        resizeHandles={['se', 'sw', 'ne', 'nw']}
        onDragStop={handleLayoutChange}
        onResizeStop={handleLayoutChange}
        autoSize={true}
      >
        {projects?.map(project => {
          const progress = project.tasks?.length
            ? Math.round((project.tasks.filter(t => t.done).length / project.tasks.length) * 100)
            : 0;

          return (
            <div
              key={project._id}
              className={`react-grid-item ${lockedProjects.has(project._id) ? 'locked' : ''}`}
            >
              <div className="react-draggable flex flex-col h-full">
                {/* Drag Handle / Header */}
                <div className="drag-handle flex items-center justify-between">
                  <h3 className="title text-lg font-medium">{project.name}</h3>
                  <button
                    onClick={() => toggleProjectLock(project._id)}
                    className="lock-icon text-gray-500 hover:text-gray-700"
                  >
                    {lockedProjects.has(project._id) ? '🔒' : '🔓'}
                  </button>
                </div>

                {/* Card Body */}
                <div className="card-content flex-1 flex flex-col">
                  {/* Task Preview */}
                  <div className="task-preview flex-1">
                    {project.tasks?.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className={`task-item flex items-center ${task.done ? 'done' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => updateTask(project._id, task.id, { done: !task.done })}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="task-text ml-2 text-sm">{task.title}</span>
                      </div>
                    ))}
                    {project.tasks?.length > 3 && (
                      <p className="text-sm text-gray-500 mt-2">
                        +{project.tasks.length - 3} more tasks
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-container mt-auto">
                    <div className="progress-label flex justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-900">{progress}%</span>
                    </div>
                    <div className="progress-bar mt-1 w-full">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
} 