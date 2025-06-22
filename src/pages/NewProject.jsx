import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useUserStore } from '../store/userStore'
import { Switch } from '@headlessui/react'
import { 
  DocumentDuplicateIcon, 
  ArrowDownTrayIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import authAPI from '../services/auth'
import apiInstance from '../services/api'
import { BACKGROUND_COLORS, DARK_MODE_COLORS } from '../constants/colors'
import { useTheme } from '../context/ThemeContext'

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
  const { theme } = useTheme()

  // Get colors based on current theme
  const colors = theme === 'dark' ? DARK_MODE_COLORS : {
    PAGE_BG: BACKGROUND_COLORS.MAIN,
    PANEL_BG: '#FFFFFF',
    CARD_INNER_BG: '#FFFFFF',
    BORDER: '#E5E5E5',
    TEXT_PRIMARY: '#1A1A1A',
    TEXT_SECONDARY: '#666666',
    TEXT_DISABLED: '#999999',
    ACCENT_PURPLE: '#7C3AED',
    ACCENT_TEAL: '#0D9488',
    ACCENT_ORANGE: '#D97706',
    ACCENT_RED: '#DC2626',
    ACCENT_GREEN: '#059669',
    ICON_DEFAULT: '#666666',
    ICON_HOVER: '#1A1A1A'
  }

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

    if (!user) {
      console.error('User not authenticated:', user)
      setFormError('User not authenticated. Please log in again.')
      return
    }

    if (!form.name) {
      setFormError('Project name is required')
      return
    }

    setFormError('')
    setSuccess('')

    const projectData = {
      ...form,
      owner: user._id,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      milestones: milestones.filter(m => m.title),
      collaborators: collaborators.filter(c => c),
    }

    console.log('Submitting project data:', projectData)

    try {
      const newProject = await createProject(projectData)
      console.log('Project created:', newProject)
      setSuccess(`Project "${newProject.name}" created successfully!`)
      // Reset form
      setForm({ name: '', description: '', status: 'not started', priority: 'medium', tags: '', startDate: '', endDate: '' })
      setMilestones([{ title: '', date: '' }])
      setCollaborators([''])
      localStorage.removeItem(`taskgrid_draft_${user.id}`)
      setTimeout(() => navigate(`/projects/${newProject._id}`), 1500)
    } catch (err) {
      console.error('Project creation error:', err)
      setFormError(err.message || 'Failed to create project')
    }
  }

  return (
    <div className="h-screen bg-[#1E1E1E] p-6 pt-16 pb-12 overflow-hidden">
      {/* Page Title */}
      <div className="w-full h-full bg-[#1E1E1E] rounded-lg">
        <h1 className={`text-[1.5rem] font-semibold text-[${colors.TEXT_PRIMARY}] mb-6 italic`}>Create New Project</h1>

        {/* Breadcrumbs */}
        <div className={`text-[0.875rem] text-[${colors.TEXT_SECONDARY}] mb-8`}>
          <span className={`hover:text-[${colors.TEXT_PRIMARY}] cursor-pointer`}>Dashboard</span>
          <span className="mx-2">/</span>
          <span>Projects</span>
          <span className="mx-2">/</span>
          <span>New Project</span>
        </div>

        {/* Content Area */}
        <div className={`flex gap-8 bg-[#1E1E1E] rounded-lg mt-4 h-[calc(100%-8rem)]`}>
          {/* Main Form */}
          <div className={`flex-1 bg-[#1E1E1E] overflow-y-auto rounded-lg p-8`}>
            {/* Quick Add Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}]`}>Project Details</h2>
              <div className="flex items-center space-x-4">
                <Switch
                  checked={isQuickAdd}
                  onChange={setIsQuickAdd}
                  className={`${
                    isQuickAdd ? `bg-[${colors.ACCENT_PURPLE}]` : `bg-[${colors.BORDER}]`
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}] focus:ring-offset-2`}
                >
                  <span className="sr-only">Quick Add Mode</span>
                  <span
                    className={`${
                      isQuickAdd ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
                <span className={`text-sm text-[${colors.TEXT_SECONDARY}]`}>Quick Add</span>
              </div>
            </div>

            {/* Template Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>Start from Template</label>
              <select
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                  focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
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
                  className={`inline-flex items-center text-sm text-[${colors.ACCENT_PURPLE}] hover:text-[${colors.ACCENT_PURPLE}]/80`}
                >
                  <DocumentDuplicateIcon className="h-5 w-5 mr-1" />
                  {showJsonImport ? 'Hide JSON Import' : 'Import from JSON'}
                </button>
                {showJsonImport && (
                  <select
                    onChange={(e) => handleJsonTemplateSelect(e.target.value)}
                    className={`block w-64 bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                      focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
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
                      className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm font-mono
                        focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                      rows={10}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(jsonInput || JSON.stringify(sampleJson, null, 2))
                      }}
                      className={`absolute top-2 right-2 p-1 text-[${colors.ICON_DEFAULT}] hover:text-[${colors.ICON_HOVER}] bg-[${colors.CARD_INNER_BG}] rounded`}
                      title="Copy to clipboard"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {jsonError && <p className={`mt-1 text-sm text-[${colors.ACCENT_RED}]`}>{jsonError}</p>}
                  <div className="mt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={handleJsonImport}
                      className={`px-3 py-1.5 bg-[${colors.ACCENT_PURPLE}] text-[${colors.PAGE_BG}] font-medium rounded-md hover:bg-[${colors.ACCENT_PURPLE}]/90 transition-colors`}
                    >
                      Import
                    </button>
                    <button
                      type="button"
                      onClick={() => setJsonInput('')}
                      className={`px-3 py-1.5 border border-[${colors.BORDER}] text-[${colors.TEXT_PRIMARY}] font-medium rounded-md hover:bg-[${colors.CARD_INNER_BG}] transition-colors`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label htmlFor="projectName" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                    focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
                    placeholder:text-[${colors.TEXT_DISABLED}]`}
                />
              </div>

              {!isQuickAdd && (
                <>
                  {/* Project Description */}
                  <div>
                    <label htmlFor="projectDescription" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                      Description
                    </label>
                    <textarea
                      id="projectDescription"
                      name="description"
                      rows={4}
                      value={form.description}
                      onChange={handleChange}
                      className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                        focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
                        placeholder:text-[${colors.TEXT_DISABLED}]`}
                    />
                  </div>

                  {/* Status and Priority */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="status" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                          focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="priority" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                          focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                      >
                        {priorityOptions.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Tags */}
              <div>
                <label htmlFor="projectTags" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                  Tags / Categories <span className={`text-xs text-[${colors.TEXT_DISABLED}]`}>(comma separated)</span>
                </label>
                <input
                  type="text"
                  id="projectTags"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                    focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none
                    placeholder:text-[${colors.TEXT_DISABLED}]`}
                  placeholder="e.g. Social Media, Content Creation, Marketing"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                      focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                    Deadline / Target Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className={`w-full bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                      focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                  />
                </div>
              </div>

              {!isQuickAdd && (
                <>
                  {/* Milestones */}
                  <div>
                    <label className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>Milestones</label>
                    {milestones.map((m, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          name="title"
                          value={m.title}
                          onChange={(e) => handleMilestoneChange(i, e)}
                          placeholder="Milestone Title"
                          className={`flex-1 bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                            focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                        />
                        <input
                          type="date"
                          name="date"
                          value={m.date}
                          onChange={(e) => handleMilestoneChange(i, e)}
                          className={`bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                            focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                        />
                        <button
                          type="button"
                          onClick={() => removeMilestone(i)}
                          className={`text-[${colors.ACCENT_RED}] px-2 hover:text-[${colors.ACCENT_RED}]/80`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMilestone}
                      className={`text-[${colors.ACCENT_PURPLE}] text-sm mt-1 hover:text-[${colors.ACCENT_PURPLE}]/80`}
                    >
                      + Add Milestone
                    </button>
                  </div>

                  {/* Collaborators */}
                  <div>
                    <label className={`block text-sm font-medium text-[${colors.TEXT_SECONDARY}] mb-1`}>
                      Collaborators <span className={`text-xs text-[${colors.TEXT_DISABLED}]`}>(email or name)</span>
                    </label>
                    {collaborators.map((c, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={c}
                          onChange={(e) => handleCollaboratorChange(i, e)}
                          placeholder="Collaborator Name or Email"
                          className={`flex-1 bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}] rounded-md text-[${colors.TEXT_PRIMARY}] px-4 py-2 text-sm
                            focus:border-[${colors.ACCENT_PURPLE}] focus:ring-2 focus:ring-[${colors.ACCENT_PURPLE}]/30 focus:outline-none`}
                        />
                        <button
                          type="button"
                          onClick={() => removeCollaborator(i)}
                          className={`text-[${colors.ACCENT_RED}] px-2 hover:text-[${colors.ACCENT_RED}]/80`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCollaborator}
                      className={`text-[${colors.ACCENT_PURPLE}] text-sm mt-1 hover:text-[${colors.ACCENT_PURPLE}]/80`}
                    >
                      + Add Collaborator
                    </button>
                  </div>
                </>
              )}

              {/* Error and Success Messages */}
              {formError && <div className={`text-[${colors.ACCENT_RED}] text-sm`}>{formError}</div>}
              {error && !formError && <div className={`text-[${colors.ACCENT_RED}] text-sm`}>{typeof error === 'string' ? error : (error.message || 'Server error. Please check your input.')}</div>}
              {success && <div className={`text-[${colors.ACCENT_GREEN}] text-sm`}>{success}</div>}

              {/* Buttons */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className={`inline-flex items-center px-4 py-2 border border-[${colors.BORDER}] text-[${colors.TEXT_PRIMARY}] font-medium rounded-md hover:bg-[${colors.CARD_INNER_BG}] transition-colors`}
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Export as JSON
                </button>

                <button
                  type="submit"
                  className={`inline-flex items-center px-4 py-2 bg-[${colors.ACCENT_PURPLE}] text-[${colors.PAGE_BG}] font-medium rounded-md hover:bg-[${colors.ACCENT_PURPLE}]/90 transition-colors`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className={`w-[300px] bg-[${colors.CARD_INNER_BG}] rounded-lg p-6 sticky top-6 h-fit`}>
            <h2 className={`text-lg font-semibold text-[${colors.TEXT_PRIMARY}] mb-4`}>Project Guidelines</h2>
            <div className="space-y-4">
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Project Name</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Choose a clear, descriptive name that reflects the project's purpose.
                </p>
              </div>
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Description</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Provide a detailed overview of the project goals and objectives.
                </p>
              </div>
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Timeline</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Set realistic start and end dates for the project.
                </p>
              </div>
              <div className={`p-4 bg-[${colors.PAGE_BG}] rounded-lg border border-[${colors.BORDER}]`}>
                <h3 className={`text-sm font-medium text-[${colors.TEXT_PRIMARY}] mb-2`}>Team</h3>
                <p className={`text-xs text-[${colors.TEXT_SECONDARY}]`}>
                  Assign team members with appropriate roles and responsibilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewProject 