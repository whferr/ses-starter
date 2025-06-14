import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
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

  const awsRegions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'us-west-1', label: 'US West (N. California)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">
                  Sender profile management will be available in Phase 3. 
                  For now, configure your default sender in the AWS SES Configuration tab.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 