import { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { CodeBracketIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const Section = ({ title, children }) => (
  <div className="bg-white/5 p-6 rounded-lg">
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const ProjectSettings = ({ project, onCancel }) => {
  const { updateProject, isLoading } = useProjectStore();
  const [view, setView] = useState('form'); // 'form' or 'json'
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'not started',
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    tags: project.tags?.join(', ') || '',
    visibility: project.settings?.visibility || 'private',
    allowComments: project.settings?.allowComments ?? true,
  });
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    const projectDataForJson = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      settings: {
        visibility: formData.visibility,
        allowComments: formData.allowComments
      }
    };
    setJsonString(JSON.stringify(projectDataForJson, null, 2));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleJsonChange = (e) => {
    setJsonString(e.target.value);
    setJsonError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updateData;

    if (view === 'json') {
      try {
        const parsedJson = JSON.parse(jsonString);
        updateData = parsedJson;
      } catch (error) {
        setJsonError('Invalid JSON format. Please correct it before saving.');
        return;
      }
    } else {
      updateData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        settings: {
          visibility: formData.visibility,
          allowComments: formData.allowComments,
        }
      };
      // Clean up root-level properties that are now in settings
      delete updateData.visibility;
      delete updateData.allowComments;
    }
    
    await updateProject(project._id, updateData);
    onCancel(); // Exit edit mode
  };

  return (
    <div className="bg-gray-900/10 p-4 sm:p-6 rounded-2xl space-y-6 animate-fade-in border border-white/10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white tracking-tight">Project Settings</h2>
        <div className="flex gap-2 rounded-lg p-1 bg-gray-800/60">
          <button onClick={() => setView('form')} className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'form' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <PencilSquareIcon className="w-5 h-5 inline mr-1" /> Form
          </button>
          <button onClick={() => setView('json')} className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'json' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <CodeBracketIcon className="w-5 h-5 inline mr-1" /> JSON
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {view === 'form' ? (
          <div className="space-y-8">
            <Section title="Basic Information">
              <div className="md:col-span-2">
                <Input name="name" label="Project Name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <Textarea name="description" label="Description" value={formData.description} onChange={handleChange} />
              </div>
            </Section>

            <Section title="Timeline & Status">
              <Input name="startDate" label="Start Date" type="date" value={formData.startDate} onChange={handleChange} />
              <Input name="endDate" label="End Date" type="date" value={formData.endDate} onChange={handleChange} />
              <Select name="status" label="Status" value={formData.status} onChange={handleChange} options={[
                { value: 'not started', label: 'Not Started' },
                { value: 'active', label: 'Active' },
                { value: 'on hold', label: 'On Hold' },
                { value: 'completed', label: 'Completed' },
                { value: 'archived', label: 'Archived' },
              ]} />
              <Input name="tags" label="Tags (comma-separated)" value={formData.tags} onChange={handleChange} placeholder="e.g. frontend, marketing" />
            </Section>

            <Section title="Permissions">
              <Select name="visibility" label="Visibility" value={formData.visibility} onChange={handleChange} options={[
                { value: 'private', label: 'Private' },
                { value: 'public', label: 'Public' },
              ]} />
              <div className="flex items-center pt-7">
                <input id="allowComments" name="allowComments" type="checkbox" checked={formData.allowComments} onChange={handleChange} className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500" />
                <label htmlFor="allowComments" className="ml-3 text-sm text-gray-300">Allow Comments</label>
              </div>
            </Section>
          </div>
        ) : (
          <div className="bg-white/5 p-6 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-2">Project Data (JSON)</label>
            <textarea
              value={jsonString}
              onChange={handleJsonChange}
              className={`w-full bg-gray-800 border rounded-md shadow-sm text-white font-mono text-sm p-4 h-96 focus:ring-purple-500 focus:border-purple-500 ${jsonError ? 'border-red-500' : 'border-gray-600'}`}
              spellCheck="false"
            />
            {jsonError && <p className="mt-2 text-sm text-red-400">{jsonError}</p>}
          </div>
        )}
        
        <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-700/50 rounded-md hover:bg-gray-700/80 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-colors text-sm font-medium">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable Form Components with updated styling
const Input = ({ label, ...props }) => (
  <div className="w-full">
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <input id={props.name} {...props} className="w-full bg-white/10 border-white/20 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500 transition" />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="w-full">
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <textarea id={props.name} rows="4" {...props} className="w-full bg-white/10 border-white/20 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500 transition" />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="w-full">
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <select id={props.name} {...props} className="w-full bg-white/10 border-white/20 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500 transition">
      {options.map(option => (
        <option key={option.value} value={option.value} className="bg-gray-800 text-white">{option.label}</option>
      ))}
    </select>
  </div>
);

export default ProjectSettings; 