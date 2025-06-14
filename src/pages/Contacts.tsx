import React, { useState } from 'react';
import { Contact, ContactFormData } from '../lib/types';
import { useContacts } from '../hooks/useContacts';
import { useHistory } from '../hooks/useHistory';
import { useTemplates } from '../hooks/useTemplates';
import { useSender } from '../hooks/useSender';
import { ContactForm } from '../components/contacts/ContactForm';
import { ContactList } from '../components/contacts/ContactList';

export const Contacts: React.FC = () => {
  const {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
  } = useContacts();

  const { getEmailsForContact } = useHistory();
  const { templates } = useTemplates();
  const { senderProfiles } = useSender();

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [viewingHistory, setViewingHistory] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNew = () => {
    setEditingContact(undefined);
    setShowForm(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleSave = async (contactData: ContactFormData) => {
    try {
      if (editingContact) {
        await updateContact(editingContact.id, contactData);
      } else {
        await createContact(contactData);
      }
      setShowForm(false);
      setEditingContact(undefined);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContact(undefined);
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(contactId);
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleBulkDelete = async (contactIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${contactIds.length} contacts?`)) {
      try {
        await deleteMultipleContacts(contactIds);
      } catch (error) {
        console.error('Error deleting contacts:', error);
      }
    }
  };

  const handleViewHistory = (contact: Contact) => {
    setViewingHistory(contact);
  };

  const closeHistoryModal = () => {
    setViewingHistory(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your email contacts and lists.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn btn-primary"
          disabled={loading}
        >
          <span className="mr-2">+</span>
          Add Contact
        </button>
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

      {/* Contact Form */}
      {showForm && (
        <ContactForm
          contact={editingContact}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      )}

      {/* Contact List */}
      <ContactList
        contacts={contacts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onViewHistory={handleViewHistory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Contact History Modal */}
      {viewingHistory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Email History for {viewingHistory.name}
                  </h3>
                  <p className="text-sm text-gray-500">{viewingHistory.email}</p>
                </div>
                <button
                  onClick={closeHistoryModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Email History Content */}
              <div className="mt-4">
                {(() => {
                  const contactEmails = getEmailsForContact(viewingHistory.id);
                  return contactEmails.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📧</div>
                      <p>No emails sent to this contact yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        Total emails sent: {contactEmails.length}
                      </div>
                      <div className="max-h-96 overflow-y-auto space-y-3">
                        {contactEmails.map((email) => (
                          <div
                            key={email.id}
                            className={`p-4 border rounded-lg ${
                              email.status === 'sent' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">{email.subject}</h4>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    email.status === 'sent' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {email.status === 'sent' ? '✅ Sent' : '❌ Failed'}
                                  </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                  <p>📄 Template: {getTemplateName(email.templateId)}</p>
                                  <p>👤 Sender: {getSenderName(email.senderProfileId)}</p>
                                  <p>📅 Sent: {formatDate(email.sentAt)}</p>
                                  {email.messageId && (
                                    <p>🆔 Message ID: {email.messageId}</p>
                                  )}
                                </div>
                                {email.error && (
                                  <div className="mt-2 text-sm text-red-600">
                                    <strong>Error:</strong> {email.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-4 border-t mt-4">
                <button
                  onClick={closeHistoryModal}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 