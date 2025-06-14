import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useSender } from '../hooks/useSender';
import { AWSSettings, SenderProfile } from '../lib/types';

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your AWS SES and application settings.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <div className="flex">
            <span className="text-2xl mr-3">❌</span>
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('aws')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'aws'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              AWS SES Configuration
            </button>
            <button
              onClick={() => setActiveTab('sender')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sender'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sender Profiles
            </button>
          </nav>
        </div>

        <div className="card-body">
          {activeTab === 'aws' && (
            <div className="space-y-6">
              {/* AWS Configuration Form */}
              <form onSubmit={handleAWSSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Region */}
                  <div className="form-group">
                    <label htmlFor="region" className="form-label">
                      AWS Region *
                    </label>
                    <select
                      id="region"
                      className="form-select"
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
                  <div className="form-group">
                    <label htmlFor="rateLimitPerSecond" className="form-label">
                      Rate Limit (emails/second) *
                    </label>
                    <input
                      type="number"
                      id="rateLimitPerSecond"
                      min="1"
                      max="50"
                      className="form-input"
                      value={rateLimitForm}
                      onChange={(e) => setRateLimitForm(parseInt(e.target.value))}
                      disabled={loading}
                    />
                    <p className="form-help">AWS SES sandbox allows 1/sec, production varies by region</p>
                  </div>
                </div>

                {/* AWS Credentials */}
                <div className="space-y-4">
                  <div className="form-group">
                    <label htmlFor="accessKeyId" className="form-label">
                      AWS Access Key ID *
                    </label>
                    <input
                      type="text"
                      id="accessKeyId"
                      className="form-input"
                      value={awsForm.accessKeyId}
                      onChange={(e) => setAwsForm(prev => ({ ...prev, accessKeyId: e.target.value }))}
                      placeholder="AKIA..."
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="secretAccessKey" className="form-label">
                      AWS Secret Access Key *
                    </label>
                    <input
                      type="password"
                      id="secretAccessKey"
                      className="form-input"
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
                   <div className="form-group">
                     <label htmlFor="fromEmail" className="form-label">
                       From Email *
                     </label>
                     <input
                       type="email"
                       id="fromEmail"
                       className="form-input"
                       value={awsForm.fromEmail}
                       onChange={(e) => setAwsForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                       placeholder="your-email@example.com"
                       disabled={loading}
                     />
                     <p className="form-help">Must be verified in AWS SES</p>
                   </div>

                  <div className="form-group">
                    <label htmlFor="replyToEmail" className="form-label">
                      Reply-To Email
                    </label>
                    <input
                      type="email"
                      id="replyToEmail"
                      className="form-input"
                      value={awsForm.replyToEmail}
                      onChange={(e) => setAwsForm(prev => ({ ...prev, replyToEmail: e.target.value }))}
                      placeholder="reply@example.com (optional)"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save AWS Settings'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="btn btn-outline"
                    disabled={loading || !awsForm.accessKeyId || !awsForm.secretAccessKey}
                  >
                    Test Connection
                  </button>

                  <button
                    type="button"
                    onClick={handleGetQuota}
                    className="btn btn-outline"
                    disabled={loading || !awsForm.accessKeyId || !awsForm.secretAccessKey}
                  >
                    Check Quota
                  </button>
                </div>
              </form>

              {/* Test Results */}
              {testResult && (
                <div className={`alert ${testResult.success ? 'alert-success' : 'alert-error'}`}>
                  <div className="flex">
                    <span className="text-2xl mr-3">
                      {testResult.success ? '✅' : '❌'}
                    </span>
                    <div>
                      <h3 className="font-medium">
                        {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                      </h3>
                      <p className="mt-1">{testResult.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quota Information */}
              {quota && (
                <div className="card bg-blue-50 border-blue-200">
                  <div className="card-header">
                    <h3 className="text-lg font-medium text-blue-900">AWS SES Sending Quota</h3>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{quota.sent24h}</div>
                        <div className="text-sm text-blue-800">Sent (24h)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{quota.max24h}</div>
                        <div className="text-sm text-blue-800">Limit (24h)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{quota.sendingRate}/sec</div>
                        <div className="text-sm text-blue-800">Max Rate</div>
                      </div>
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
                <div className="alert alert-error">
                  <div className="flex">
                    <span className="text-2xl mr-3">❌</span>
                    <div>
                      <h3 className="font-medium">Error</h3>
                      <p className="mt-1">{senderError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Add/Edit Sender Profile Form */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingSender ? 'Edit Sender Profile' : 'Add New Sender Profile'}
                  </h3>
                </div>
                <form onSubmit={handleSenderSubmit} className="card-body space-y-4">
                  <div className="form-group">
                    <label htmlFor="senderName" className="form-label">
                      Sender Name *
                    </label>
                    <input
                      type="text"
                      id="senderName"
                      className="form-input"
                      value={senderForm.name}
                      onChange={(e) => setSenderForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      disabled={senderLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="senderEmail" className="form-label">
                      Sender Email *
                    </label>
                    <input
                      type="email"
                      id="senderEmail"
                      className="form-input"
                      value={senderForm.email}
                      onChange={(e) => setSenderForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      disabled={senderLoading}
                      required
                    />
                    <p className="form-help">Must be verified in AWS SES</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="senderSignature" className="form-label">
                      Email Signature
                    </label>
                    <textarea
                      id="senderSignature"
                      rows={4}
                      className="form-textarea"
                      value={senderForm.signature}
                      onChange={(e) => setSenderForm(prev => ({ ...prev, signature: e.target.value }))}
                      placeholder="Best regards,&#10;John Doe&#10;Company Name&#10;+1 (555) 123-4567"
                      disabled={senderLoading}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={senderLoading || !senderForm.name || !senderForm.email}
                    >
                      {senderLoading ? (
                        <div className="flex items-center">
                          <div className="spinner mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        editingSender ? 'Update Profile' : 'Add Profile'
                      )}
                    </button>
                    
                    {editingSender && (
                      <button
                        type="button"
                        onClick={() => {
                          setSenderForm({ name: '', email: '', signature: '' });
                          setEditingSender(null);
                        }}
                        className="btn btn-outline"
                        disabled={senderLoading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Existing Sender Profiles */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Sender Profiles</h3>
                </div>
                <div className="card-body">
                  {senderProfiles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No sender profiles yet. Add one above to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {senderProfiles.map((profile) => (
                        <div
                          key={profile.id}
                          className={`p-4 border rounded-lg ${
                            profile.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">{profile.name}</h4>
                                {profile.isDefault && (
                                  <span className="px-2 py-1 text-xs font-medium bg-primary text-white rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{profile.email}</p>
                              {profile.signature && (
                                <div className="mt-2 text-sm text-gray-500">
                                  <strong>Signature:</strong>
                                  <pre className="mt-1 whitespace-pre-wrap">{profile.signature}</pre>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {!profile.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(profile.id)}
                                  className="btn btn-outline btn-sm"
                                  disabled={senderLoading}
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => handleEditSender(profile)}
                                className="btn btn-outline btn-sm"
                                disabled={senderLoading}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSender(profile.id)}
                                className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                                disabled={senderLoading}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 