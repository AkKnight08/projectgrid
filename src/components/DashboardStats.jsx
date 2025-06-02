import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

export default function DashboardStats() {
  const [activeTab, setActiveTab] = useState('overview');

  // Project Status Chart Data
  const projectStatusData = {
    labels: ['Completed', 'Active', 'On Hold', 'Overdue'],
    datasets: [
      {
        data: [5, 4, 2, 1],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  // Task Status Chart Data
  const taskStatusData = {
    labels: ['Done', 'In Progress', 'To Do', 'Overdue'],
    datasets: [
      {
        data: [34, 10, 5, 3],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  // Recent Activity Data
  const activities = [
    {
      id: 1,
      date: '06/01/2025',
      action: 'Completed',
      task: 'Analyze Engagement',
      project: 'Instagram Page Growth',
    },
    {
      id: 2,
      date: '05/31/2025',
      action: 'Created project',
      project: 'YouTube Channel Redesign',
    },
    {
      id: 3,
      date: '05/30/2025',
      action: 'Task overdue',
      task: 'Upload 5 Reels',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Activity
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Project Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Status</h3>
            <div className="h-64">
              <Doughnut data={projectStatusData} options={chartOptions} />
            </div>
          </div>

          {/* Task Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status</h3>
            <div className="h-64">
              <Doughnut data={taskStatusData} options={chartOptions} />
            </div>
          </div>

          {/* Stats List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Snapshot Stats</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Total Projects</dt>
                <dd className="text-sm font-medium text-gray-900">12</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Completed Projects</dt>
                <dd className="text-sm font-medium text-gray-900">5</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Active Projects</dt>
                <dd className="text-sm font-medium text-gray-900">4</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">On Hold Projects</dt>
                <dd className="text-sm font-medium text-gray-900">2</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Overdue Projects</dt>
                <dd className="text-sm font-medium text-gray-900">1</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-sm">✓</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {activity.action}{' '}
                            {activity.task && (
                              <>
                                <span className="font-medium text-gray-900">{activity.task}</span>{' '}
                                in{' '}
                              </>
                            )}
                            <span className="font-medium text-gray-900">{activity.project}</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={activity.date}>{activity.date}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
        <div className="space-y-3">
          <a
            href="/projects"
            className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md"
          >
            View All Projects
          </a>
          <a
            href="/tasks"
            className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md"
          >
            My Tasks
          </a>
          <a
            href="/calendar"
            className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md"
          >
            Calendar View
          </a>
        </div>
      </div>
    </div>
  );
} 