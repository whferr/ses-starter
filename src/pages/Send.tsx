import React, { useState } from 'react';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { useSettings } from '../hooks/useSettings';
import { useSender } from '../hooks/useSender';
import { useHistory } from '../hooks/useHistory';
import { Contact, EmailTemplate, SenderProfile } from '../lib/types';
import { AWSSESService } from '../lib/aws-ses';
import { EmailUtils } from '../lib/email-utils';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Users,
  FileText,
  Play,
  Settings,
  Clock,
  Search,
  X
} from 'lucide-react';

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
  const [filterType, setFilterType] = useState<'all' | 'default' | 'cold' | 'hot'>('all');
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
          await recordSentEmail({
            contactId: contact.id,
            templateId: selectedTemplate.id,
            senderProfileId: selectedSender.id,
            subject: selectedTemplate.subject,
            status: 'failed',
            error: errorMessage,
          });
        }

        // Rate limiting
        if (chillMode) {
          const delay = 2000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (settings.rateLimitPerSecond) {
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

  const isReadyToSend = selectedTemplate && selectedContacts.length > 0 && selectedSender && settings?.aws;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-600 mt-1">
            Send personalized emails to your audience
          </p>
        </div>
      </div>

      {/* Send Results */}
      {sendResults && (
        <div className={`rounded-lg p-4 ${
          sendResults.failed === 0 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {sendResults.failed === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <span className="font-medium text-gray-900">Campaign Complete</span>
          </div>
          <div className="flex gap-3 mb-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Sent: {sendResults.sent}
            </Badge>
            {sendResults.failed > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                Failed: {sendResults.failed}
              </Badge>
            )}
          </div>
          {sendResults.errors.length > 0 && (
            <div className="mt-3">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-700 hover:text-gray-900 font-medium">
                  View errors ({sendResults.errors.length})
                </summary>
                <div className="mt-2 p-3 bg-white border border-gray-200 rounded text-xs font-mono max-h-32 overflow-y-auto">
                  {sendResults.errors.map((error, i) => (
                    <div key={i} className="text-red-700 py-1">{error}</div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Template Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-900">Select Template</h2>
        </div>
        
        {selectedTemplate ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">{selectedTemplate.name}</div>
              <div className="text-sm text-gray-600 mt-1">{selectedTemplate.subject}</div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedTemplate(null)}
            >
              Change
            </Button>
          </div>
        ) : (
          <div>
            {templatesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
                <p className="text-gray-600">Create a template first to start campaigns</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.slice(0, 5).map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-left transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{template.name}</div>
                      <div className="text-sm text-gray-600 truncate">{template.subject}</div>
                    </div>
                  </button>
                ))}
                {templates.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{templates.length - 5} more templates available
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audience Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Select Audience</h2>
          </div>
          <div className="text-sm text-gray-600">
            {selectedContacts.length} of {filteredContacts.length} selected
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent w-full"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="default">Default</option>
            <option value="cold">Cold</option>
            <option value="hot">Hot</option>
          </select>
          <Button variant="outline" onClick={handleSelectAll}>
            {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        
        {/* Contact List */}
        {contactsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts available</h3>
            <p className="text-gray-600">Add contacts first to create campaigns</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600">No contacts match your search</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedContacts.find(c => c.id === contact.id)
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleContactToggle(contact)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={!!selectedContacts.find(c => c.id === contact.id)}
                    onChange={() => handleContactToggle(contact)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-600 truncate">{contact.email}</p>
                    {contact.company && (
                      <p className="text-xs text-gray-500 truncate">{contact.company}</p>
                    )}
                  </div>
                </div>
                <Badge 
                  className={`ml-2 ${
                    contact.type === 'hot' ? 'bg-green-100 text-green-800 border-green-200' :
                    contact.type === 'cold' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {contact.type || 'default'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Selected contacts summary */}
        {selectedContacts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-2">Selected contacts:</p>
            <div className="flex flex-wrap gap-2">
              {selectedContacts.slice(0, 5).map(contact => (
                <Badge key={contact.id} className="bg-gray-100 text-gray-700 border-gray-200">
                  {contact.name}
                  <button
                    onClick={() => handleContactToggle(contact)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedContacts.length > 5 && (
                <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                  +{selectedContacts.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sender Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-900">Sender Identity</h2>
        </div>
        
        {senderProfiles.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sender profiles available</h3>
            <p className="text-gray-600">Create a sender profile in Settings first</p>
          </div>
        ) : (
          <div className="space-y-2">
            {senderProfiles.map((profile) => (
              <div
                key={profile.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSender?.id === profile.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSender(profile)}
              >
                <input
                  type="radio"
                  checked={selectedSender?.id === profile.id}
                  onChange={() => setSelectedSender(profile)}
                  className="text-black focus:ring-black"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900">{profile.name}</p>
                    {profile.isDefault && (
                      <Badge className="bg-black text-white">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{profile.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-900">Campaign Settings</h2>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">Chill Mode</div>
            <div className="text-sm text-gray-600">Send emails with 2-3 second delays</div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={chillMode}
              onChange={(e) => setChillMode(e.target.checked)}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <Clock className="w-4 h-4 text-gray-500" />
          </label>
        </div>
      </div>

      {/* Send Button */}
      <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-200">
        <Button
          onClick={handleSendEmails}
          disabled={!isReadyToSend || sending}
          className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-base"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Send Campaign
            </>
          )}
        </Button>

        {/* Help Text */}
        {!isReadyToSend && (
          <div className="text-sm text-gray-500 text-center">
            {!selectedTemplate && "Select a template to continue"}
            {selectedTemplate && selectedContacts.length === 0 && "Select contacts to continue"}
            {selectedTemplate && selectedContacts.length > 0 && !selectedSender && "Set up a sender profile in Settings"}
            {selectedTemplate && selectedContacts.length > 0 && selectedSender && !settings?.aws && "Configure AWS SES in Settings"}
          </div>
        )}
      </div>
    </div>
  );
}; 