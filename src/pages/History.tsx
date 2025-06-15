import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { useSender } from '../hooks/useSender';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  Mail,
  User,
  FileText,
  Calendar
} from 'lucide-react';

export const History: React.FC = () => {
  const { sentEmails, loading, getTotalStats, getRecentEmails } = useHistory();
  const { contacts } = useContacts();
  const { templates } = useTemplates();
  const { senderProfiles } = useSender();
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'failed'>('all');
  const [filterDays, setFilterDays] = useState<number>(7);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const stats = getTotalStats();
  const recentEmails = getRecentEmails(filterDays);
  
  const filteredEmails = recentEmails.filter(email => {
    const matchesStatus = filterStatus === 'all' || email.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getContactName(email.contactId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getContactEmail(email.contactId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTemplateName(email.templateId).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Unknown Contact';
  };

  const getContactEmail = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.email || 'Unknown';
  };

  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template?.name || 'Unknown Template';
  };

  const getSenderName = (senderProfileId: string) => {
    const sender = senderProfiles.find(s => s.id === senderProfileId);
    return sender?.name || 'Unknown Sender';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">History</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your email campaigns and delivery status
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 bg-white border border-gray-200 rounded-lg p-6">
        <div>
          <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total emails</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-gray-900">{stats.sent}</div>
          <div className="text-sm text-gray-600">Successfully sent</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}% success rate
          </div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-gray-900">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed deliveries</div>
          {stats.failed > 0 && (
            <Badge variant="destructive" className="text-xs mt-1">
              Needs attention
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent w-full"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="all">All status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={filterDays}
          onChange={(e) => setFilterDays(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="text-sm text-gray-600">
        {filteredEmails.length} emails
      </div>

      {/* Empty State */}
      {filteredEmails.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
          <p className="text-gray-600">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your filters or search terms'
              : 'Start sending campaigns to see your history here'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmails.map((email) => {
                const isExpanded = expandedEmail === email.id;

                return (
                  <React.Fragment key={email.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-sm font-medium">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{email.subject}</div>
                            <div className="text-sm text-gray-500">{getSenderName(email.senderProfileId)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{getContactName(email.contactId)}</div>
                          <div className="text-sm text-gray-500">{getContactEmail(email.contactId)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {getTemplateName(email.templateId)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={email.status === 'sent' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {email.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDateTime(email.sentAt)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setExpandedEmail(isExpanded ? null : email.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 border-t border-gray-200">
                          <div className="px-4 py-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Email Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Sender:</span>
                                    <span className="text-gray-900">{getSenderName(email.senderProfileId)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Template:</span>
                                    <span className="text-gray-900">{getTemplateName(email.templateId)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Sent at:</span>
                                    <span className="text-gray-900">{formatDateTime(email.sentAt)}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  {email.status === 'sent' ? 'Delivery Status' : 'Error Details'}
                                </h4>
                                {email.status === 'sent' ? (
                                  <div className="text-sm text-green-600">
                                    ✓ Successfully delivered
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="text-sm text-red-600 font-medium">Failed to deliver</div>
                                    {email.error && (
                                      <div className="text-sm text-gray-600 p-2 bg-red-50 border border-red-200 rounded">
                                        {email.error}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 