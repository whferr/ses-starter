import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { useSender } from '../hooks/useSender';

export const History: React.FC = () => {
  const { sentEmails, loading, getTotalStats, getRecentEmails } = useHistory();
  const { contacts } = useContacts();
  const { templates } = useTemplates();
  const { senderProfiles } = useSender();
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'failed'>('all');
  const [filterDays, setFilterDays] = useState<number>(7);

  const stats = getTotalStats();
  const recentEmails = getRecentEmails(filterDays);
  
  const filteredEmails = recentEmails.filter(email => 
    filterStatus === 'all' || email.status === filterStatus
  );

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
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email History 📈</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track all your sent emails and their delivery status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Emails</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-sm text-gray-500">Successfully Sent</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="form-select-sm"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <select
                value={filterDays}
                onChange={(e) => setFilterDays(Number(e.target.value))}
                className="form-select-sm"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              Showing {filteredEmails.length} of {recentEmails.length} emails
            </div>
          </div>
        </div>
      </div>

      {/* Email History Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Emails</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-8">Loading email history...</div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No emails found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmails.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getContactName(email.contactId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getContactEmail(email.contactId)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {email.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getTemplateName(email.templateId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getSenderName(email.senderProfileId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          email.status === 'sent' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {email.status === 'sent' ? '✅ Sent' : '❌ Failed'}
                        </span>
                        {email.error && (
                          <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                            {email.error}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(email.sentAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 