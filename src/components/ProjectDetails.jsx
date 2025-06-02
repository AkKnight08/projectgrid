import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useUserStore } from '../store/userStore'

const mockMilestones = [
  { title: 'Planning Completed', date: '2025-05-22' },
  { title: 'Content Calendar Finalized', date: '2025-05-25' },
  { title: 'First 5 Reels Posted', date: '2025-05-30' },
  { title: 'Mid-Month Analytics Review', date: '2025-06-10' },
  { title: 'Goal: +1,000 Followers', date: '2025-06-20' },
]

const mockTasks = [
  {
    id: 't1',
    title: 'Upload 5 Reels',
    description: 'Create, edit, and post 5 short Reels (15–30 sec) focusing on trending challenges.',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2025-06-01',
    assignee: 'You',
    attachments: [
      { label: 'Google Drive folder', url: 'https://drive.google.com/…/ReelsDrafts' },
      { label: 'Music license', url: 'https://drive.google.com/…/MusicAssets' },
    ],
    comments: [
      'Use trending audio from #LipSyncChallenge',
      'Check Story insights after posting',
    ],
    subTasks: [
      'Write 5 short scripts / concepts',
      'Film Reel #1 (10–15 sec)',
      'Edit Reel #1 (add captions, music)',
      'Film Reel #2',
      'Schedule Reel posts in Instagram scheduler',
    ],
  },
  // ... more mock tasks as per your spec ...
]

const mockResources = [
  { label: 'Project Folder', url: 'https://drive.google.com/…/InstagramPageProject' },
  { label: 'Logo', url: '/assets/logo.png' },
  { label: 'Marketing Strategy Doc', url: 'https://docs.google.com/…/MarketingStrategy' },
  { label: 'Style Guide', url: 'https://notion.so/…/InstagramStyleGuide' },
]

const mockTeam = [
  { name: 'Your Name', email: 'you@example.com', role: 'Owner' },
  { name: 'Collaborator A', email: 'collabA@example.com', role: 'Instagram Management' },
  { name: 'Collaborator B', email: 'collabB@example.com', role: 'Content Design' },
]

const mockDependencies = [
  'Video Editor Availability: Need collaborator to finish edits by 2025-05-28.',
  'Design Software License: Canva Pro must be active.',
  'Hashtag Research Data: Requires latest Insights data from Instagram Analytics.',
]

const mockRisks = [
  'If Instagram algorithm changes suddenly, engagement predictions may fail.',
  'Collaborator unavailability might delay "Upload 5 Reels" task.',
  'Unexpected account suspension (rare but keep backups of content).',
]

const mockMitigations = [
  'Keep backup drafts of Reels on local drive.',
  'Have a backup content creator (friend/agency) in case collaborator is unavailable.',
]

const mockActivity = [
  '2025-05-20: Project created.',
  '2025-05-22: Added first three tasks; moved status to Active.',
  '2025-05-25: Completed "Draft Weekly Content Calendar."',
  '2025-05-28: Uploaded analytics report; task "Analyze Past Month\'s Engagement" marked Done.',
  '2025-05-30: Video edits for Reel #1 completed; comment: "Reel editing took longer than expected."',
]

const ProjectDetails = () => {
  const { id } = useParams()
  const { currentProject, fetchProjectById, isLoading, error } = useProjectStore()
  const { user } = useUserStore()

  useEffect(() => {
    fetchProjectById(id)
  }, [id, fetchProjectById])

  // Mock progress calculation
  const totalTasks = mockTasks.length
  const completedTasks = 1
  const inProgressTasks = 1
  const toDoTasks = totalTasks - completedTasks - inProgressTasks
  const progressPercent = Math.round((completedTasks / totalTasks) * 100)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Project not found
        </h3>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Project Overview */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{currentProject.name}</h1>
          <div className="text-gray-500 mb-4">Project ID: {currentProject._id}</div>
          <div className="mb-2">{currentProject.description}</div>
          <div className="flex flex-wrap gap-4 mb-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{currentProject.status}</span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Priority: High</span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Tags: Social Media, Content Creation</span>
          </div>
          <div className="text-sm text-gray-700 mb-1">Owner: {user?.displayName || 'You'}</div>
          <div className="text-sm text-gray-700 mb-1">Collaborators: Collaborator A, Collaborator B</div>
        </div>

        {/* Timeline & Milestones */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Timeline & Milestones</h2>
          <div className="mb-2">Start Date: 2025-05-20</div>
          <div className="mb-2">Deadline: 2025-06-20</div>
          <ul className="list-disc ml-6">
            {mockMilestones.map((m) => (
              <li key={m.title} className="mb-1">{m.title} – <span className="text-gray-500">{m.date}</span></li>
            ))}
          </ul>
        </div>

        {/* Task List */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Task List</h2>
          {mockTasks.map((task) => (
            <div key={task.id} className="mb-6 border-b pb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{task.title}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">{task.status}</span>
              </div>
              <div className="text-sm text-gray-700 mb-1">Task ID: {task.id}</div>
              <div className="text-sm text-gray-700 mb-1">Due: {task.dueDate}</div>
              <div className="text-sm text-gray-700 mb-1">Priority: {task.priority}</div>
              <div className="text-sm text-gray-700 mb-1">Assigned To: {task.assignee}</div>
              <div className="mb-1">{task.description}</div>
              <div className="mb-1">
                <span className="font-medium text-xs">Sub-tasks:</span>
                <ul className="list-disc ml-6">
                  {task.subTasks.map((st, i) => (
                    <li key={i} className="text-xs">{st}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-1">
                <span className="font-medium text-xs">Attachments:</span>
                <ul className="list-disc ml-6">
                  {task.attachments.map((a, i) => (
                    <li key={i} className="text-xs"><a href={a.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{a.label}</a></li>
                  ))}
                </ul>
              </div>
              <div className="mb-1">
                <span className="font-medium text-xs">Comments/Notes:</span>
                <ul className="list-disc ml-6">
                  {task.comments.map((c, i) => (
                    <li key={i} className="text-xs">{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Progress & Metrics */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Progress & Metrics</h2>
          <div className="mb-2">Total Tasks: {totalTasks}</div>
          <div className="mb-2">Completed: {completedTasks}</div>
          <div className="mb-2">In Progress: {inProgressTasks}</div>
          <div className="mb-2">To Do: {toDoTasks}</div>
          <div className="mb-2">Progress: {progressPercent}%</div>
        </div>

        {/* Resources & Attachments */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Resources & Attachments</h2>
          <ul className="list-disc ml-6">
            {mockResources.map((r) => (
              <li key={r.label}><a href={r.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{r.label}</a></li>
            ))}
          </ul>
        </div>

        {/* Team & Communication */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Team & Communication</h2>
          <ul className="list-disc ml-6">
            {mockTeam.map((member) => (
              <li key={member.email}>{member.name} ({member.role}) – <span className="text-gray-500">{member.email}</span></li>
            ))}
          </ul>
          <div className="mt-2 text-sm">Slack Channel: #instagram-growth</div>
          <div className="text-sm">Weekly Zoom Stand-up: Every Monday, 10 AM IST</div>
        </div>

        {/* Dependencies & Risks */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dependencies & Risks</h2>
          <div className="mb-2 font-medium">Dependencies:</div>
          <ul className="list-disc ml-6 mb-4">
            {mockDependencies.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
          <div className="mb-2 font-medium">Risks:</div>
          <ul className="list-disc ml-6 mb-4">
            {mockRisks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <div className="mb-2 font-medium">Mitigations:</div>
          <ul className="list-disc ml-6">
            {mockMitigations.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>

        {/* Comments & Activity Log */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Comments & Activity Log</h2>
          <ul className="list-disc ml-6">
            {mockActivity.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails 