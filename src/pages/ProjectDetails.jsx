import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import TaskList from '../components/tasks/TaskList'
import ProjectSettings from '../components/projects/ProjectSettings'
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  EnvelopeIcon,
  ClockIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  UsersIcon,
  TagIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon as ClipboardListIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { DARK_MODE_COLORS, BACKGROUND_COLORS } from '../constants/colors'
import TaskForm from '../components/tasks/TaskForm'

const Card = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{ backgroundColor: DARK_MODE_COLORS.CARD_INNER_BG }}
    className={`rounded-xl shadow-lg overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

const ProjectDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentProject, fetchProjectById, deleteProject, isLoading: projectLoading } = useProjectStore()
  const { tasks, fetchProjectTasks, updateTask, deleteTask, isLoading: tasksLoading } = useTaskStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const { theme } = useTheme()

  // Get colors based on current theme
  const colors = theme === 'dark' ? DARK_MODE_COLORS : {
    PAGE_BG: BACKGROUND_COLORS.MAIN,
    PANEL_BG: '#1E1E1E', // Matching settings page
    CARD_INNER_BG: '#242424', // Matching settings page
    BORDER: '#2E2E2E',
    TEXT_PRIMARY: '#E0E0E0',
    TEXT_SECONDARY: '#A0A0A0',
    TEXT_DISABLED: '#999999',
    ACCENT_PURPLE: '#7C3AED',
    ACCENT_TEAL: '#0D9488',
    ACCENT_ORANGE: '#D97706',
    ACCENT_RED: '#DC2626',
    ACCENT_GREEN: '#059669',
    ICON_DEFAULT: '#666666',
    ICON_HOVER: '#1A1A1A'
  }

  useEffect(() => {
    fetchProjectById(id)
    fetchProjectTasks(id)
  }, [id, fetchProjectById, fetchProjectTasks])

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action is permanent and cannot be undone.')) {
      await deleteProject(id)
      navigate('/dashboard')
    }
  }

  if (projectLoading || !currentProject) {
    return <div style={{ backgroundColor: colors.PANEL_BG }} className="flex justify-center items-center h-screen text-white">Loading project...</div>
  }

  const {
    name,
    description,
    status,
    startDate,
    endDate,
    tags,
    members,
    pendingMembers,
    settings,
    owner,
    createdAt,
    updatedAt
  } = currentProject

  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getStatusChipStyle = (status) => {
    switch (status) {
      case 'not started': return 'bg-gray-500/20 text-gray-400';
      case 'on-track': return 'bg-green-500/20 text-green-400';
      case 'at-risk': return 'bg-yellow-500/20 text-yellow-400';
      case 'off-track': return 'bg-red-500/20 text-red-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ backgroundColor: colors.PANEL_BG }}
      className="min-h-screen p-4 sm:p-6 lg:p-8 text-white"
    >
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 style={{ color: colors.TEXT_PRIMARY }} className="text-4xl font-bold tracking-tight">{name}</h1>
                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusChipStyle(status)}`}>
                  {status}
                </span>
              </div>
              <p style={{ color: colors.TEXT_SECONDARY }} className="max-w-3xl">{description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm">
                <PencilIcon className="w-4 h-4" /> Edit
              </button>
              <button onClick={handleDeleteProject} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                <TrashIcon className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </header>

        {isEditing ? (
          <ProjectSettings project={currentProject} onCancel={() => setIsEditing(false)} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <main className="xl:col-span-2 space-y-8">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <ClipboardListIcon className="w-6 h-6 text-purple-400" />
                      <h2 style={{ color: colors.TEXT_PRIMARY }} className="text-xl font-semibold">Tasks</h2>
                    </div>
                    <button onClick={() => setIsAddingTask(!isAddingTask)} className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors text-sm">
                      {isAddingTask ? 'Cancel' : 'Add Task'}
                    </button>
                  </div>

                  {isAddingTask && (
                    <div className="mb-6">
                      <TaskForm projectId={id} onCancel={() => setIsAddingTask(false)} colors={colors} />
                    </div>
                  )}

                  {tasksLoading ? <p style={{color: colors.TEXT_SECONDARY}}>Loading tasks...</p> : <TaskList tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} colors={colors} />}
                </div>
              </Card>
            </main>

            {/* Sidebar with Details */}
            <aside className="space-y-8">
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ChartBarIcon className="w-6 h-6 text-purple-400"/>
                    <h2 style={{ color: colors.TEXT_PRIMARY }} className="text-xl font-semibold">Progress</h2>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{color: colors.TEXT_SECONDARY}} className="text-sm">{completedTasks} of {totalTasks} tasks complete</span>
                    <span style={{color: colors.TEXT_PRIMARY}} className="text-sm font-bold">{progressPercentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                    <div
                        style={{ width: `${progressPercentage}%`, backgroundColor: colors.ACCENT_GREEN }}
                        className="h-3 rounded-full transition-all duration-500 ease-out"
                    ></div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                      <InformationCircleIcon className="w-6 h-6 text-purple-400"/>
                      <h2 style={{ color: colors.TEXT_PRIMARY }} className="text-xl font-semibold">Details</h2>
                  </div>
                  <div className="space-y-3">
                    <DetailRow label="Owner" value={owner?.displayName || 'N/A'} colors={colors} />
                    <DetailRow label="Start Date" value={startDate ? new Date(startDate).toLocaleDateString() : 'Not set'} colors={colors} />
                    <DetailRow label="End Date" value={endDate ? new Date(endDate).toLocaleDateString() : 'Not set'} colors={colors} />
                    <DetailRow label="Visibility" value={settings?.visibility} colors={colors} />
                    <DetailRow label="Last Updated" value={new Date(updatedAt).toLocaleString()} colors={colors} />
                  </div>
                </div>
              </Card>

              {tags && tags.length > 0 && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TagIcon className="w-6 h-6 text-purple-400"/>
                      <h2 style={{ color: colors.TEXT_PRIMARY }} className="text-xl font-semibold">Tags</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <span key={tag} style={{backgroundColor: 'rgba(255,255,255,0.1)'}} className="px-3 py-1 text-sm rounded-full capitalize" >{tag}</span>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              <Card>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <UsersIcon className="w-6 h-6 text-purple-400"/>
                      <h2 style={{ color: colors.TEXT_PRIMARY }} className="text-xl font-semibold">Team</h2>
                    </div>
                    <button className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Add Member">
                      <UserPlusIcon className="w-5 h-5" style={{color: colors.TEXT_PRIMARY}} />
                    </button>
                  </div>
                  <ul className="space-y-4">
                    {members?.map(member => (
                      <li key={member.user._id} className="flex items-center gap-4 hover:bg-white/5 p-2 rounded-lg transition-colors">
                        <img src={member.user.avatar || '/images/default-avatar.svg'} alt={member.user.displayName} className="w-10 h-10 rounded-full" />
                        <div>
                          <p style={{ color: colors.TEXT_PRIMARY }} className="font-medium">{member.user.displayName}</p>
                          <p style={{ color: colors.TEXT_SECONDARY }} className="text-sm capitalize">{member.role}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {pendingMembers && pendingMembers.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h2 style={{ color: colors.TEXT_PRIMARY }} className="text-xl font-semibold mb-4">Pending Invitations</h2>
                    <ul className="space-y-4">
                      {pendingMembers.map(invite => (
                        <li key={invite.email} className="flex items-center justify-between hover:bg-white/5 p-2 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <EnvelopeIcon className="w-5 h-5" style={{color: colors.TEXT_SECONDARY}}/>
                            <div>
                              <p style={{ color: colors.TEXT_PRIMARY }} className="font-medium">{invite.email}</p>
                              <p style={{ color: colors.TEXT_SECONDARY }} className="text-sm capitalize">Role: {invite.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs" style={{color: colors.TEXT_DISABLED}}>
                            <ClockIcon className="w-4 h-4" />
                            <span>{new Date(invite.invitedAt).toLocaleDateString()}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}
            </aside>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const DetailRow = ({ label, value, colors }) => (
  <div className="flex justify-between items-center capitalize py-1">
    <p style={{ color: colors.TEXT_SECONDARY }} className="text-sm font-medium">{label}</p>
    <p style={{ color: colors.TEXT_PRIMARY }} className="text-sm">{value}</p>
  </div>
)

export default ProjectDetails 