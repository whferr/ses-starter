import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { useSettings } from '../hooks/useSettings';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { contacts } = useContacts();
  const { templates } = useTemplates();
  const { isAWSConfigured } = useSettings();

  const stats = [
    {
      name: 'Total Contacts',
      value: contacts.length,
      icon: '👥',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Email Templates',
      value: templates.length,
      icon: '📝',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'AWS Status',
      value: isAWSConfigured() ? 'Connected' : 'Not Connected',
      icon: '☁️',
      color: isAWSConfigured() ? 'text-green-600' : 'text-red-600',
      bgColor: isAWSConfigured() ? 'bg-green-50' : 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to AWS SES Mailer. Get started by managing your contacts and templates.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className={`text-lg font-medium ${stat.color}`}>
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button 
              onClick={() => navigate('/contacts')}
              className="btn btn-outline flex flex-col items-center p-6 space-y-2"
            >
              <span className="text-2xl">👥</span>
              <span>Add Contacts</span>
            </button>
            <button 
              onClick={() => navigate('/templates')}
              className="btn btn-outline flex flex-col items-center p-6 space-y-2"
            >
              <span className="text-2xl">📝</span>
              <span>Create Template</span>
            </button>
            <button 
              onClick={() => navigate('/campaigns')}
              className="btn btn-outline flex flex-col items-center p-6 space-y-2"
            >
              <span className="text-2xl">🚀</span>
              <span>Start Campaign</span>
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="btn btn-outline flex flex-col items-center p-6 space-y-2"
            >
              <span className="text-2xl">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Setup Guide */}
      {!isAWSConfigured() && (
        <div className="alert alert-warning">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                AWS SES Not Configured
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  To start sending emails, you need to configure your AWS SES credentials.
                  Go to Settings to set up your AWS configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 