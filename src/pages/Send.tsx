import React, { useState } from 'react';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { useSettings } from '../hooks/useSettings';
import { useSender } from '../hooks/useSender';
import { useHistory } from '../hooks/useHistory';
import { Contact, EmailTemplate, SenderProfile } from '../lib/types';
import { AWSSESService } from '../lib/aws-ses';
import { EmailUtils } from '../lib/email-utils';

export const Send: React.FC = () => {
  const { contacts, loading: contactsLoading } = useContacts();
  const { templates, loading: templatesLoading } = useTemplates();
  const { settings } = useSettings();
  const { senderProfiles, getDefaultProfile } = useSender();
  const { recordSentEmail } = useHistory();
  
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [selectedSender, setSelectedSender] = useState<SenderProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'default' | 'prospect' | 'customer'>('all');
  const [chillMode, setChillMode] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<{
    sent: number;
    failed: number;
    total: number;
    errors: string[];
  } | null>(null);

  // Auto-select default sender profile
  React.useEffect(() => {
    if (!selectedSender && senderProfiles.length > 0) {
      const defaultProfile = getDefaultProfile();
      if (defaultProfile) {
        setSelectedSender(defaultProfile);
      }
    }
  }, [selectedSender, senderProfiles, getDefaultProfile]);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contact.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleContactToggle = (contact: Contact) => {
    setSelectedContacts(prev => 
      prev.find(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts);
    }
  };

  const handleSendEmails = async () => {
    if (!selectedTemplate || selectedContacts.length === 0 || !settings?.aws || !selectedSender) {
      return;
    }

    setSending(true);
    setSendResults(null);

    try {
      const sesService = new AWSSESService();
      sesService.configure(settings.aws);
      let sent = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const contact of selectedContacts) {
        try {
          const processedTemplate = EmailUtils.processTemplate(
            selectedTemplate,
            contact,
            selectedSender
          );

          const result = await sesService.sendEmail({
            to: contact.email,
            subject: processedTemplate.subject,
            htmlContent: processedTemplate.htmlContent,
            textContent: processedTemplate.textContent,
            from: `"${selectedSender.name}" <${selectedSender.email}>`,
          });

          if (result.success) {
            sent++;
            // Record successful email to history
            await recordSentEmail({
              contactId: contact.id,
              templateId: selectedTemplate.id,
              senderProfileId: selectedSender.id,
              subject: processedTemplate.subject,
              status: 'sent',
              messageId: result.messageId,
            });
          } else {
            failed++;
            errors.push(`${contact.email}: ${result.error || 'Unknown error'}`);
            // Record failed email to history
            await recordSentEmail({
              contactId: contact.id,
              templateId: selectedTemplate.id,
              senderProfileId: selectedSender.id,
              subject: processedTemplate.subject,
              status: 'failed',
              error: result.error,
            });
          }
        } catch (error) {
          failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${contact.email}: ${errorMessage}`);
          // Record failed email to history
          await recordSentEmail({
            contactId: contact.id,
            templateId: selectedTemplate.id,
            senderProfileId: selectedSender.id,
            subject: selectedTemplate.subject,
            status: 'failed',
            error: errorMessage,
          });
        }

        // Rate limiting: Use chill mode or user settings
        if (chillMode) {
          // Chill mode: 2-3 seconds between emails
          const delay = 2000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (settings.rateLimitPerSecond) {
          // Use user's rate limit setting
          await new Promise(resolve => setTimeout(resolve, 1000 / settings.rateLimitPerSecond));
        }
      }

      setSendResults({
        sent,
        failed,
        total: selectedContacts.length,
        errors
      });

    } catch (error) {
      console.error('Error sending emails:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Send Emails</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a template and contacts to send personalized emails.
        </p>
      </div>

      {/* Send Results */}
      {sendResults && (
        <div className={`alert ${sendResults.failed === 0 ? 'alert-success' : 'alert-warning'}`}>
          <div className="flex">
            <span className="text-2xl mr-3">{sendResults.failed === 0 ? '✅' : '⚠️'}</span>
            <div>
              <h3 className="font-medium">Send Complete</h3>
              <p className="mt-1">
                Sent: {sendResults.sent}, Failed: {sendResults.failed}, Total: {sendResults.total}
              </p>
              {sendResults.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">View Errors</summary>
                  <ul className="mt-1 text-sm space-y-1">
                    {sendResults.errors.map((error, index) => (
                      <li key={index} className="text-red-600">• {error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Select Template</h3>
          </div>
          <div className="card-body">
            {templatesLoading ? (
              <div className="text-center py-4">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No templates available. Create one first.
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {selectedTemplate?.id === template.id && (
                          <span className="text-primary">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sender Profile Selection */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Select Sender</h3>
          </div>
          <div className="card-body">
            {senderProfiles.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No sender profiles available. Create one in Settings first.
              </div>
            ) : (
              <div className="space-y-3">
                {senderProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSender?.id === profile.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSender(profile)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{profile.name}</h4>
                          {profile.isDefault && (
                            <span className="px-1 py-0.5 text-xs bg-primary text-white rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {selectedSender?.id === profile.id && (
                          <span className="text-primary">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Selection */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Select Contacts</h3>
              <span className="text-sm text-gray-500">
                {selectedContacts.length} selected
              </span>
            </div>
          </div>
          <div className="card-body">
            {contactsLoading ? (
              <div className="text-center py-4">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No contacts available. Add some first.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Filters */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                  />
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="all">All Types</option>
                    <option value="default">Default</option>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="btn btn-outline btn-sm w-full"
                  >
                    {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Contact List */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedContacts.find(c => c.id === contact.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleContactToggle(contact)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.email}</p>
                          {contact.company && (
                            <p className="text-xs text-gray-400">{contact.company}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {selectedContacts.find(c => c.id === contact.id) && (
                            <span className="text-primary">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Configuration & Button */}
      <div className="card">
        <div className="card-body space-y-4">
          {/* Send Mode Selection */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Sending Mode</h4>
              <p className="text-sm text-gray-500 mt-1">
                {chillMode 
                  ? '🐌 Chill Mode: 2-3 seconds between emails (recommended)' 
                  : `⚡ Fast Mode: ${settings?.rateLimitPerSecond || 1} emails/second`
                }
              </p>
            </div>
            <button
              onClick={() => setChillMode(!chillMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                chillMode 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
              }`}
            >
              {chillMode ? '🐌 Chill Mode' : '⚡ Fast Mode'}
            </button>
          </div>

          {/* Send Summary */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Ready to Send</h3>
              <div className="text-sm text-gray-500 mt-1 space-y-1">
                <p>
                  {selectedTemplate ? `📄 Template: ${selectedTemplate.name}` : '📄 No template selected'}
                </p>
                <p>
                  {selectedSender ? `👤 Sender: ${selectedSender.name} (${selectedSender.email})` : '👤 No sender selected'}
                </p>
                <p>
                  📧 {selectedContacts.length} contacts selected
                </p>
              </div>
            </div>
            <button
              onClick={handleSendEmails}
              disabled={!selectedTemplate || !selectedSender || selectedContacts.length === 0 || sending || !settings?.aws}
              className="btn btn-primary"
            >
              {sending ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Sending...
                </span>
              ) : (
                `🚀 Send ${selectedContacts.length} Emails`
              )}
            </button>
          </div>
          
          {/* Validation Messages */}
          <div className="space-y-1">
            {!settings?.aws && (
              <p className="text-sm text-red-600">
                ⚠️ Please configure AWS SES in Settings before sending emails.
              </p>
            )}
            {!selectedSender && senderProfiles.length === 0 && (
              <p className="text-sm text-red-600">
                ⚠️ Please create a sender profile in Settings before sending emails.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 