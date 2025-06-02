import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useUserStore } from '../store/userStore'
import { Switch } from '@headlessui/react'
import { 
  DocumentDuplicateIcon, 
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import authAPI from '../services/auth'
import apiInstance from '../services/api'

const statusOptions = [
  { label: 'Not Started', value: 'not started' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on hold' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
]

const priorityOptions = [
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const projectTemplates = {
  'social-media': {
    name: 'Social Media Campaign',
    description: 'Plan and execute a social media campaign across multiple platforms.',
    tags: ['Social Media', 'Marketing', 'Content'],
    status: 'not started',
    priority: 'medium',
    milestones: [
      { title: 'Content Calendar Created', date: '' },
      { title: 'First Post Live', date: '' }
    ]
  },
  'dev-project': {
    name: 'Development Project',
    description: 'Software development project with clear milestones and deliverables.',
    tags: ['Development', 'Technical'],
    status: 'not started',
    priority: 'high',
    milestones: [
      { title: 'Requirements Gathering', date: '' },
      { title: 'MVP Development', date: '' },
      { title: 'Testing & QA', date: '' }
    ]
  },
  'event-planning': {
    name: 'Event Planning',
    description: 'Plan and execute a successful event with multiple stakeholders.',
    tags: ['Event', 'Planning', 'Coordination'],
    status: 'not started',
    priority: 'high',
    milestones: [
      { title: 'Venue Booked', date: '' },
      { title: 'Invitations Sent', date: '' },
      { title: 'Vendors Confirmed', date: '' }
    ]
  }
}

const sampleJson = {
  name: "Instagram Page Growth",
  description: "Grow social reach by posting 5 reels per week.",
  tags: ["Social Media", "Marketing"],
  status: "active",
  priority: "high",
  startDate: "2025-05-20",
  endDate: "2025-06-20",
  milestones: [
    { title: "Plan Content Calendar", date: "2025-05-22" },
    { title: "First 5 Reels Posted", date: "2025-05-30" }
  ],
  collaborators: ["alice@example.com", "bob@example.com"]
}

const jsonTemplates = {
  'website-redesign': {
    name: "Website Redesign Project",
    description: "Complete overhaul of company website with modern design, improved UX, and mobile responsiveness. Includes content updates and SEO optimization.",
    tags: ["Web Development", "Design", "SEO", "UX"],
    status: "active",
    priority: "high",
    startDate: "2024-03-20",
    endDate: "2024-05-15",
    milestones: [
      {
        title: "Design Approval",
        date: "2024-03-25"
      },
      {
        title: "Homepage Development",
        date: "2024-04-05"
      },
      {
        title: "Content Migration",
        date: "2024-04-20"
      },
      {
        title: "Testing & QA",
        date: "2024-05-01"
      },
      {
        title: "Launch",
        date: "2024-05-15"
      }
    ],
    collaborators: [
      "john.doe@company.com",
      "jane.smith@company.com",
      "mike.wilson@company.com"
    ]
  },
  'quick-project': {
    name: "Quick Task",
    tags: ["Urgent"],
    startDate: "2024-03-20",
    endDate: "2024-03-25"
  },
  'marketing-campaign': {
    name: "Q2 Marketing Campaign",
    description: "Launch new product line with social media campaign and email marketing",
    tags: ["Marketing", "Social Media", "Email"],
    status: "not started",
    priority: "high",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    milestones: [
      {
        title: "Campaign Planning",
        date: "2024-04-01"
      },
      {
        title: "Content Creation",
        date: "2024-04-15"
      },
      {
        title: "Launch",
        date: "2024-05-01"
      }
    ],
    collaborators: [
      "marketing@company.com",
      "content@company.com"
    ]
  },
  'api-integration': {
    name: "API Integration",
    description: "Integrate third-party payment API with existing system",
    tags: ["Development", "API", "Backend"],
    status: "active",
    priority: "critical",
    startDate: "2024-03-20",
    endDate: "2024-04-10",
    milestones: [
      {
        title: "API Documentation Review",
        date: "2024-03-22"
      },
      {
        title: "Development",
        date: "2024-03-29"
      },
      {
        title: "Testing",
        date: "2024-04-05"
      },
      {
        title: "Deployment",
        date: "2024-04-10"
      }
    ],
    collaborators: [
      "dev@company.com",
      "qa@company.com"
    ]
  }
}

const NewProject = () => {
  const { createProject, isLoading, error } = useProjectStore()
  const { user } = useUserStore()
  const [isQuickAdd, setIsQuickAdd] = useState(false)
  const [showJsonImport, setShowJsonImport] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: statusOptions[0].value,
    priority: priorityOptions[2].value,
    tags: '',
    startDate: '',
    endDate: '',
  })
  const [milestones, setMilestones] = useState([{ title: '', date: '' }])
  const [collaborators, setCollaborators] = useState([''])
  const [success, setSuccess] = useState('')
  const [formError, setFormError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const navigate = useNavigate()

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`taskgrid_draft_${user?.id}`)
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setForm(draft.form)
        setMilestones(draft.milestones)
        setCollaborators(draft.collaborators)
      } catch (e) {
        console.error('Error loading draft:', e)
      }
    }
  }, [user?.id])

  const handleChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value }
    setForm(newForm)
    // Save draft
    saveDraft(newForm, milestones, collaborators)
  }

  const handleMilestoneChange = (i, e) => {
    const newMilestones = [...milestones]
    newMilestones[i][e.target.name] = e.target.value
    setMilestones(newMilestones)
    // Save draft
    saveDraft(form, newMilestones, collaborators)
  }

  const addMilestone = () => {
    const newMilestones = [...milestones, { title: '', date: '' }]
    setMilestones(newMilestones)
    saveDraft(form, newMilestones, collaborators)
  }

  const removeMilestone = (i) => {
    const newMilestones = milestones.filter((_, idx) => idx !== i)
    setMilestones(newMilestones)
    saveDraft(form, newMilestones, collaborators)
  }

  const handleCollaboratorChange = (i, e) => {
    const newCollabs = [...collaborators]
    newCollabs[i] = e.target.value
    setCollaborators(newCollabs)
    saveDraft(form, milestones, newCollabs)
  }

  const addCollaborator = () => {
    const newCollabs = [...collaborators, '']
    setCollaborators(newCollabs)
    saveDraft(form, milestones, newCollabs)
  }

  const removeCollaborator = (i) => {
    const newCollabs = collaborators.filter((_, idx) => idx !== i)
    setCollaborators(newCollabs)
    saveDraft(form, milestones, newCollabs)
  }

  const saveDraft = (formData, milestonesData, collaboratorsData) => {
    if (user?.id) {
      const draft = {
        form: formData,
        milestones: milestonesData,
        collaborators: collaboratorsData
      }
      localStorage.setItem(`taskgrid_draft_${user.id}`, JSON.stringify(draft))
    }
  }

  const handleTemplateSelect = (templateKey) => {
    if (templateKey === '') {
      setSelectedTemplate('')
      return
    }

    const template = projectTemplates[templateKey]
    if (template) {
      const newForm = {
        ...form,
        name: template.name,
        description: template.description,
        tags: template.tags.join(', '),
        status: template.status,
        priority: template.priority
      }
      setForm(newForm)
      setMilestones(template.milestones)
      saveDraft(newForm, template.milestones, collaborators)
    }
  }

  const handleJsonTemplateSelect = (templateKey) => {
    if (templateKey === '') {
      setJsonInput('')
      return
    }
    setJsonInput(JSON.stringify(jsonTemplates[templateKey], null, 2))
  }

  const handleJsonImport = () => {
    try {
      const importedData = JSON.parse(jsonInput)
      setJsonError('')
      
      // Validate required fields
      if (!importedData.name) {
        throw new Error('Project name is required')
      }

      // Update form with imported data
      const newForm = {
        ...form,
        name: importedData.name,
        description: importedData.description || '',
        status: importedData.status || 'not started',
        priority: importedData.priority || 'medium',
        tags: Array.isArray(importedData.tags) ? importedData.tags.join(', ') : '',
        startDate: importedData.startDate || '',
        endDate: importedData.endDate || ''
      }
      setForm(newForm)

      // Update milestones if provided
      if (Array.isArray(importedData.milestones)) {
        setMilestones(importedData.milestones)
      }

      // Update collaborators if provided
      if (Array.isArray(importedData.collaborators)) {
        setCollaborators(importedData.collaborators)
      }

      setShowJsonImport(false)
      setJsonInput('')
    } catch (e) {
      setJsonError(e.message || 'Invalid JSON format')
    }
  }

  const handleExportJson = () => {
    const exportData = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      milestones: milestones.filter(m => m.title && m.date),
      collaborators: collaborators.filter(c => c)
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taskgrid-project-${form.name.replace(/\s+/g, '')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)

    // Validate form
    if (!form.name) {
      setFormError('Project name is required.')
      return
    }

    if (!isQuickAdd) {
      if (!form.description) {
        setFormError('Description is required.')
        return
      }
      if (!form.startDate) {
        setFormError('Start date is required.')
        return
      }
      if (!form.endDate) {
        setFormError('Deadline/target date is required.')
        return
      }
    }

    try {
      // First, get the current user's ID
      const currentUser = await authAPI.getCurrentUser();
      console.log('Current user:', currentUser);
      
      if (!currentUser || !currentUser.id) {
        console.error('User not authenticated:', currentUser);
        throw new Error('User not authenticated');
      }

      // Fetch user IDs for collaborators
      const collaboratorEmails = collaborators.filter(c => c && c !== currentUser.email);
      console.log('Fetching user IDs for collaborators:', collaboratorEmails);
      
      const memberPromises = collaboratorEmails.map(async (email) => {
        try {
          const response = await apiInstance.get(`/users/email/${encodeURIComponent(email)}`);
          console.log(`Found user for email ${email}:`, response.data);
          return {
            user: response.data.id,
            role: 'member'
          };
        } catch (error) {
          // 404 is expected for new users
          if (error.response?.status === 404) {
            console.log(`User not found for email ${email}, will be added as pending member`);
            return {
              email: email,
              role: 'member',
              status: 'pending'
            };
          }
          // For other errors, log and rethrow
          console.error(`Error looking up user ${email}:`, error);
          throw error;
        }
      });

      const additionalMembers = await Promise.all(memberPromises);
      console.log('Additional members:', additionalMembers);

      // Filter out pending members for now
      const activeMembers = additionalMembers.filter(m => m.user);
      const pendingMembers = additionalMembers.filter(m => m.status === 'pending');

      // Ensure dates are in ISO format
      const startDate = form.startDate ? new Date(form.startDate).toISOString() : undefined;
      const endDate = form.endDate ? new Date(form.endDate).toISOString() : undefined;

      const projectData = {
        name: form.name,
        description: form.description || '',
        status: form.status === 'not started' ? 'active' : form.status,
        startDate,
        endDate,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        owner: currentUser.id,
        members: [
          {
            user: currentUser.id,
            role: 'admin'
          },
          ...activeMembers.map(m => ({
            user: m.user,
            role: m.role
          }))
        ],
        pendingMembers: pendingMembers.map(m => ({
          email: m.email,
          role: m.role
        })),
        settings: {
          visibility: 'private',
          allowComments: true
        }
      }

      console.log('Creating project with data:', projectData);
      const result = await createProject(projectData)
      
      if (result) {
        setSuccess('Project created!' + (pendingMembers.length > 0 ? 
          ` ${pendingMembers.length} collaborator(s) will be invited once they join.` : ''));
        // Clear draft
        if (currentUser.id) {
          localStorage.removeItem(`taskgrid_draft_${currentUser.id}`)
        }
        setTimeout(() => navigate('/projects'), 1000)
      }
    } catch (error) {
      console.error('Project creation error:', error)
      setFormError(error.response?.data?.message || error.message || 'Failed to create project')
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">New Project</h2>
        <div className="flex items-center space-x-4">
          <Switch
            checked={isQuickAdd}
            onChange={setIsQuickAdd}
            className={`${
              isQuickAdd ? 'bg-primary-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
          >
            <span className="sr-only">Quick Add Mode</span>
            <span
              className={`${
                isQuickAdd ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-600">Quick Add</span>
        </div>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Start from Template</label>
        <select
          onChange={(e) => handleTemplateSelect(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Select a template...</option>
          <option value="social-media">Social Media Campaign</option>
          <option value="dev-project">Development Project</option>
          <option value="event-planning">Event Planning</option>
        </select>
      </div>

      {/* JSON Import/Export */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <button
            type="button"
            onClick={() => setShowJsonImport(!showJsonImport)}
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <DocumentDuplicateIcon className="h-5 w-5 mr-1" />
            {showJsonImport ? 'Hide JSON Import' : 'Import from JSON'}
          </button>
          {showJsonImport && (
            <select
              onChange={(e) => handleJsonTemplateSelect(e.target.value)}
              className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="">Select a JSON template...</option>
              <option value="website-redesign">Website Redesign</option>
              <option value="quick-project">Quick Project</option>
              <option value="marketing-campaign">Marketing Campaign</option>
              <option value="api-integration">API Integration</option>
            </select>
          )}
        </div>
        {showJsonImport && (
          <div className="mt-2">
            <div className="relative">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={JSON.stringify(sampleJson, null, 2)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                rows={10}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(jsonInput || JSON.stringify(sampleJson, null, 2))
                }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 bg-white rounded"
                title="Copy to clipboard"
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
              </button>
            </div>
            {jsonError && <p className="mt-1 text-sm text-red-600">{jsonError}</p>}
            <div className="mt-2 flex justify-between">
              <button
                type="button"
                onClick={handleJsonImport}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Import
              </button>
              <button
                type="button"
                onClick={() => setJsonInput('')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {!isQuickAdd && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {priorityOptions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags / Categories <span className="text-xs text-gray-400">(comma separated)</span>
          </label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="e.g. Social Media, Content Creation, Marketing"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline / Target Date</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        {!isQuickAdd && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Milestones</label>
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="title"
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(i, e)}
                    placeholder="Milestone Title"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <input
                    type="date"
                    name="date"
                    value={m.date}
                    onChange={(e) => handleMilestoneChange(i, e)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <button type="button" onClick={() => removeMilestone(i)} className="text-red-500 px-2">✕</button>
                </div>
              ))}
              <button type="button" onClick={addMilestone} className="text-primary-600 text-sm mt-1">+ Add Milestone</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collaborators <span className="text-xs text-gray-400">(email or name)</span>
              </label>
              {collaborators.map((c, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => handleCollaboratorChange(i, e)}
                    placeholder="Collaborator Name or Email"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <button type="button" onClick={() => removeCollaborator(i)} className="text-red-500 px-2">✕</button>
                </div>
              ))}
              <button type="button" onClick={addCollaborator} className="text-primary-600 text-sm mt-1">+ Add Collaborator</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                value={user?.displayName || user?.email || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 shadow-sm"
              />
            </div>
          </>
        )}

        {formError && <div className="text-red-500 text-sm">{formError}</div>}
        {error && !formError && <div className="text-red-500 text-sm">{typeof error === 'string' ? error : (error.message || 'Server error. Please check your input.')}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export as JSON
          </button>

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewProject 