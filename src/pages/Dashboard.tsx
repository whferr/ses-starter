import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { useSettings } from '../hooks/useSettings';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  FileText, 
  Rocket, 
  Settings as SettingsIcon,
  ArrowRight,
  Plus,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { contacts } = useContacts();
  const { templates } = useTemplates();
  const { isAWSConfigured } = useSettings();

  const quickActions = [
    {
      title: 'Manage Audience',
      description: 'Add and organize your contacts',
      icon: Users,
      action: () => navigate('/contacts'),
      color: 'text-blue-600'
    },
    {
      title: 'Create Template',
      description: 'Design email templates',
      icon: FileText,
      action: () => navigate('/templates'),
      color: 'text-green-600'
    },
    {
      title: 'Launch Campaign',
      description: 'Send emails to your audience',
      icon: Rocket,
      action: () => navigate('/send'),
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Good morning 👋
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Here's what's happening with your email campaigns
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{contacts.length}</div>
              <div className="text-sm text-gray-600">Total contacts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{templates.length}</div>
              <div className="text-sm text-gray-600">Email templates</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isAWSConfigured() ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {isAWSConfigured() ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <Badge 
                className={`${
                  isAWSConfigured() 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                {isAWSConfigured() ? "Connected" : "Setup Required"}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">AWS SES status</div>
            </div>
          </div>
        </div>
      </div>

      {/* AWS Setup Alert */}
      {!isAWSConfigured() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900">Setup required</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Configure your AWS SES credentials to start sending emails
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/settings')}
              className="border-yellow-300 text-yellow-900 hover:bg-yellow-100"
            >
              Setup AWS
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-900">Quick actions</h2>
        </div>
        <div className="space-y-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.action}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left border border-gray-200 hover:border-gray-300"
              >
                <div className="flex-shrink-0">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <IconComponent className={`w-4 h-4 ${action.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-900">Recent activity</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
          <p className="text-gray-600 mb-6">
            Start by creating a campaign to see your activity here
          </p>
          <Button 
            onClick={() => navigate('/send')}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>
    </div>
  );
}; 