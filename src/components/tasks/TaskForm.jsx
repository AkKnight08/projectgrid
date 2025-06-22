import { useState } from 'react'
import { useTaskStore } from '../../store/taskStore'

const TaskForm = ({ projectId, onCancel, colors }) => {
  const { createTask, isLoading } = useTaskStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'todo',
    priority: 'medium'
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createTask({ ...formData, project: projectId })
      onCancel() // Close form on success
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 rounded-lg" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
      <Input name="title" label="Task Title" value={formData.title} onChange={handleChange} placeholder="e.g., Design new landing page" colors={colors} required />
      <Textarea name="description" label="Description" value={formData.description} onChange={handleChange} placeholder="Add a more detailed description..." colors={colors} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input name="dueDate" label="Due Date" type="date" value={formData.dueDate} onChange={handleChange} colors={colors} required />
        <Select name="status" label="Status" value={formData.status} onChange={handleChange} colors={colors} options={[
          { value: 'todo', label: 'To Do' },
          { value: 'in-progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
        ]} />
        <Select name="priority" label="Priority" value={formData.priority} onChange={handleChange} colors={colors} options={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' },
        ]} />
      </div>

      <div className="flex justify-end gap-4 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors" style={{color: colors.TEXT_SECONDARY}}>
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-medium rounded-md disabled:opacity-50" style={{backgroundColor: colors.ACCENT_PURPLE, color: '#121212'}}>
          {isLoading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}


const Input = ({ label, colors, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium mb-1" style={{color: colors.TEXT_SECONDARY}}>{label}</label>
    <input id={props.name} {...props} className="w-full border-0 rounded-md shadow-sm text-sm" style={{backgroundColor: 'rgba(255,255,255,0.1)', color: colors.TEXT_PRIMARY}} />
  </div>
);

const Textarea = ({ label, colors, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium mb-1" style={{color: colors.TEXT_SECONDARY}}>{label}</label>
    <textarea id={props.name} rows="3" {...props} className="w-full border-0 rounded-md shadow-sm text-sm" style={{backgroundColor: 'rgba(255,255,255,0.1)', color: colors.TEXT_PRIMARY}} />
  </div>
);

const Select = ({ label, options, colors, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium mb-1" style={{color: colors.TEXT_SECONDARY}}>{label}</label>
    <select id={props.name} {...props} className="w-full border-0 rounded-md shadow-sm text-sm" style={{backgroundColor: 'rgba(255,255,255,0.1)', color: colors.TEXT_PRIMARY}}>
      {options.map(option => (
        <option key={option.value} value={option.value} style={{backgroundColor: colors.PANEL_BG}}>{option.label}</option>
      ))}
    </select>
  </div>
);


export default TaskForm 