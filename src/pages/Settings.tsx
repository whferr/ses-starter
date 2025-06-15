import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useSender } from '../hooks/useSender';
import { AWSSettings, SenderProfile } from '../lib/types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Star
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    settings,
    loading,
    error,
    saveSettings,
    testAWSConnection,
    getSendQuota,
  } = useSettings();

  const {
    senderProfiles,
    loading: senderLoading,
    error: senderError,
    createSenderProfile,
    updateSenderProfile,
    deleteSenderProfile,
    setDefaultProfile,
  } = useSender();

  const [activeTab, setActiveTab] = useState<'aws' | 'sender'>('aws');
  const [awsForm, setAwsForm] = useState<AWSSettings>({
    region: 'us-east-1',
    accessKeyId: '',
    secretAccessKey: '',
    fromEmail: '',
    replyToEmail: '',
  });
  const [rateLimitForm, setRateLimitForm] = useState(14);
  const [senderForm, setSenderForm] = useState<Omit<SenderProfile, 'id' | 'isDefault'>>({
    name: '',
    email: '',
    signature: '',
  });
  const [editingSender, setEditingSender] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [quota, setQuota] = useState<{ sent24h: number; max24h: number; sendingRate: number } | null>(null);

  // Initialize forms when settings load
  React.useEffect(() => {
    if (settings?.aws) {
      setAwsForm(settings.aws);
    }
    if (settings?.rateLimitPerSecond) {
      setRateLimitForm(settings.rateLimitPerSecond);
    }
  }, [settings]);

  const handleAWSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSettings({
        aws: awsForm,
        rateLimitPerSecond: rateLimitForm,
        batchSize: settings?.batchSize || 50,
      });
      alert('AWS settings saved successfully!');
    } catch (error) {
      console.error('Error saving AWS settings:', error);
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testAWSConnection();
      if (result.success) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        setTestResult({ success: false, message: result.error || 'Connection failed' });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      });
    }
  };

  const handleGetQuota = async () => {
    try {
      const quotaResult = await getSendQuota();
      if (quotaResult.success && quotaResult.quota) {
        setQuota({
          sent24h: quotaResult.quota.sentLast24Hours,
          max24h: quotaResult.quota.max24Hour,
          sendingRate: quotaResult.quota.maxSendRate,
        });
      }
    } catch (error) {
      console.error('Error getting quota:', error);
    }
  };

  const handleSenderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSender) {
        await updateSenderProfile(editingSender, senderForm);
      } else {
        await createSenderProfile({
          ...senderForm,
          isDefault: senderProfiles.length === 0
        });
      }
      setSenderForm({ name: '', email: '', signature: '' });
      setEditingSender(null);
      alert('Sender profile saved successfully!');
    } catch (error) {
      console.error('Error saving sender profile:', error);
    }
  };

  const handleEditSender = (profile: SenderProfile) => {
    setSenderForm({
      name: profile.name,
      email: profile.email,
      signature: profile.signature,
    });
    setEditingSender(profile.id);
  };

  const handleDeleteSender = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sender profile?')) {
      try {
        await deleteSenderProfile(id);
        alert('Sender profile deleted successfully!');
      } catch (error) {
        console.error('Error deleting sender profile:', error);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultProfile(id);
      alert('Default sender profile updated!');
    } catch (error) {
      console.error('Error setting default profile:', error);
    }
  };

  const awsRegions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-east-2', label: 'US East (Ohio)' },
    { value: 'us-west-1', label: 'US West (N. California)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
    { value: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
    { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
    { value: 'ca-central-1', label: 'Canada (Central)' },
    { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'eu-west-2', label: 'Europe (London)' },
    { value: 'eu-west-3', label: 'Europe (Paris)' },
    { value: 'eu-north-1', label: 'Europe (Stockholm)' },
    { value: 'sa-east-1', label: 'South America (São Paulo)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure your AWS SES and application settings
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-900 font-medium">Error</div>
          <div className="text-red-800 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('aws')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'aws'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              AWS SES Configuration
            </button>
            <button
              onClick={() => setActiveTab('sender')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'sender'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              Sender Profiles
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'aws' && (
            <div className="space-y-6">
              {/* AWS Configuration Form */}
              <form onSubmit={handleAWSSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Region */}
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                      AWS Region *
                    </label>
                    <select
                      id="region"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={awsForm.region}
                      onChange={(e) => setAwsForm(prev => ({ ...prev, region: e.target.value }))}
                      disabled={loading}
                    >
                      {awsRegions.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rate Limit */}
                  <div>
                    <label htmlFor="rateLimitPerSecond" className="block text-sm font-medium text-gray-700 mb-2">
                      Rate Limit (emails/second) *
                    </label>
                    <input
                      type="number"
                      id="rateLimitPerSecond"
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={rateLimitForm}
                      onChange={(e) => setRateLimitForm(parseInt(e.target.value))}
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500 mt-1">AWS SES sandbox allows 1/sec, production varies by region</p>
                  </div>
                </div>

                {/* AWS Credentials */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="accessKeyId" className="block text-sm font-medium text-gray-700 mb-2">
                      AWS Access Key ID *
                    </label>
                    <input
                      type="text"
                      id="accessKeyId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={awsForm.accessKeyId}
                      onChange={(e) => setAwsForm(prev => ({ ...prev, accessKeyId: e.target.value }))}
                      placeholder="AKIA..."
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="secretAccessKey" className="block text-sm font-medium text-gray-700 mb-2">
                      AWS Secret Access Key *
                    </label>
                    <input
                      type="password"
                      id="secretAccessKey"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={awsForm.secretAccessKey}
                      onChange={(e) => setAwsForm(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                      placeholder="Enter secret access key"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Default Sender Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Default Sender</h3>
                  <div>
                    <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      From Email *
                    </label>
                    <input
                      type="email"
                      id="fromEmail"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={awsForm.fromEmail}
                      onChange={(e) => setAwsForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                      placeholder="your-email@example.com"
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500 mt-1">Must be verified in AWS SES</p>
                  </div>

                  <div>
                    <label htmlFor="replyToEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Reply-To Email
                    </label>
                    <input
                      type="email"
                      id="replyToEmail"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={awsForm.replyToEmail}
                      onChange={(e) => setAwsForm(prev => ({ ...prev, replyToEmail: e.target.value }))}
                      placeholder="reply@example.com (optional)"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    {loading ? 'Saving...' : 'Save AWS Settings'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={loading || !awsForm.accessKeyId || !awsForm.secretAccessKey}
                  >
                    Test Connection
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetQuota}
                    disabled={loading || !awsForm.accessKeyId || !awsForm.secretAccessKey}
                  >
                    Check Quota
                  </Button>
                </div>
              </form>

              {/* Test Results */}
              {testResult && (
                <div className={`rounded-lg p-4 ${
                  testResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className={`font-medium ${
                        testResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                      </div>
                      <div className={`text-sm mt-1 ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult.message}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quota Information */}
              {quota && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">AWS SES Sending Quota</h3>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-semibold text-blue-600">{quota.sent24h}</div>
                      <div className="text-sm text-blue-800">Sent (24h)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-blue-600">{quota.max24h}</div>
                      <div className="text-sm text-blue-800">Limit (24h)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-blue-600">{quota.sendingRate}/sec</div>
                      <div className="text-sm text-blue-800">Max Rate</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sender' && (
            <div className="space-y-6">
              {/* Error Display for Sender */}
              {senderError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-900 font-medium">Error</div>
                  <div className="text-red-800 text-sm mt-1">{senderError}</div>
                </div>
              )}

              {/* Add/Edit Sender Profile Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSender ? 'Edit Sender Profile' : 'Add New Sender Profile'}
                </h3>
                <form onSubmit={handleSenderSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Name *
                    </label>
                    <input
                      type="text"
                      id="senderName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={senderForm.name}
                      onChange={(e) => setSenderForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      disabled={senderLoading}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Email *
                    </label>
                    <input
                      type="email"
                      id="senderEmail"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={senderForm.email}
                      onChange={(e) => setSenderForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      disabled={senderLoading}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Must be verified in AWS SES</p>
                  </div>

                  <div>
                    <label htmlFor="senderSignature" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Signature
                    </label>
                    <textarea
                      id="senderSignature"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={senderForm.signature}
                      onChange={(e) => setSenderForm(prev => ({ ...prev, signature: e.target.value }))}
                      placeholder="Best regards,&#10;John Doe&#10;Company Name&#10;+1 (555) 123-4567"
                      disabled={senderLoading}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={senderLoading || !senderForm.name || !senderForm.email}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {senderLoading ? 'Saving...' : (editingSender ? 'Update Profile' : 'Add Profile')}
                    </Button>
                    
                    {editingSender && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSenderForm({ name: '', email: '', signature: '' });
                          setEditingSender(null);
                        }}
                        disabled={senderLoading}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              {/* Existing Sender Profiles */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Sender Profiles</h3>
                  <div className="text-sm text-gray-600">
                    {senderProfiles.length} profile{senderProfiles.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {senderProfiles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">👤</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sender profiles yet</h3>
                    <p className="text-gray-600">
                      Add a sender profile above to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {senderProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className={`p-4 rounded-lg border ${
                          profile.isDefault 
                            ? 'border-black bg-gray-50' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{profile.name}</h4>
                              {profile.isDefault && (
                                <Badge className="bg-black text-white">
                                  <Star className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{profile.email}</p>
                            {profile.signature && (
                              <div className="text-sm text-gray-500">
                                <div className="font-medium mb-1">Signature:</div>
                                <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                                  {profile.signature}
                                </pre>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {!profile.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(profile.id)}
                                disabled={senderLoading}
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSender(profile)}
                              disabled={senderLoading}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSender(profile.id)}
                              disabled={senderLoading}
                              className="text-red-600 hover:bg-red-50 hover:border-red-200"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 