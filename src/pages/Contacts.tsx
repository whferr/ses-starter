import React, { useState } from 'react';
import { Contact, ContactFormData } from '../lib/types';
import { useContacts } from '../hooks/useContacts';
import { useHistory } from '../hooks/useHistory';
import { useTemplates } from '../hooks/useTemplates';
import { EmailUtils } from '../lib/email-utils';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import { CSVImportModal } from '../components/contacts/CSVImportModal';
import { 
  Plus, 
  Search, 
  ChevronDown,
  ChevronRight,
  Upload
} from 'lucide-react';

export const Contacts: React.FC = () => {
  const {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
    importContacts,
  } = useContacts();

  const { getEmailsForContact } = useHistory();
  const { templates } = useTemplates();

  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Contact['type'] | 'all'>('all');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  
  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    tags: [],
    type: 'default'
  });
  const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({});
  const [tagInput, setTagInput] = useState('');

  const handleAddNew = () => {
    setEditingContact(undefined);
    setFormData({
      name: '',
      email: '',
      company: '',
      tags: [],
      type: 'default'
    });
    setFormErrors({});
    setTagInput('');
    setShowForm(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      company: contact.company || '',
      tags: contact.tags,
      type: contact.type
    });
    setFormErrors({});
    setTagInput('');
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EmailUtils.validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
      } else {
        await createContact(formData);
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
    setFormData({
      name: '',
      email: '',
      company: '',
      tags: [],
      type: 'default'
    });
    setFormErrors({});
    setTagInput('');
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedContacts.size} contacts?`)) {
      try {
        await deleteMultipleContacts(Array.from(selectedContacts));
        setSelectedContacts(new Set());
      } catch (error) {
        console.error('Error deleting contacts:', error);
      }
    }
  };
  
  const handleImportContacts = async (contactsToImport: ContactFormData[]) => {
    try {
      await importContacts(contactsToImport);
      // Clear any selections after import
      setSelectedContacts(new Set());
    } catch (error) {
      console.error('Error importing contacts:', error);
      throw error;
    }
  };

  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
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

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchQuery || 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || contact.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getTypeDisplay = (type: Contact['type']) => {
    switch (type) {
      case 'hot': return 'Hot';
      case 'cold': return 'Cold';
      default: return 'Default';
    }
  };

  const getContactHistory = (contactId: string) => {
    return getEmailsForContact(contactId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Audience</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your contacts and audience segments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowImportModal(true)}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-1"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button
            onClick={handleAddNew}
            disabled={loading}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add contact
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent w-full"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as Contact['type'] | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
        >
          <option value="all">All Types</option>
          <option value="default">Default</option>
          <option value="cold">Cold</option>
          <option value="hot">Hot</option>
        </select>

        {selectedContacts.size > 0 && (
          <Button
            onClick={handleBulkDelete}
            variant="destructive"
            size="sm"
          >
            Delete ({selectedContacts.size})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600">
        {filteredContacts.length} of {contacts.length} contacts
        {selectedContacts.size > 0 && (
          <span className="ml-4 text-black font-medium">{selectedContacts.size} selected</span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-900 font-medium">Error</div>
          <div className="text-red-800 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* Empty State */}
      {filteredContacts.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filterType !== 'all' ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Add your first contact to start building your audience'
            }
          </p>
          {!searchQuery && filterType === 'all' && (
            <Button onClick={handleAddNew} className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Add your first contact
            </Button>
          )}
        </div>
      )}

      {/* Contacts Table */}
      {filteredContacts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                    onChange={toggleAllSelection}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emails
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="w-32 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => {
                const contactHistory = getContactHistory(contact.id);
                const isSelected = selectedContacts.has(contact.id);
                const isExpanded = expandedContact === contact.id;

                return (
                  <React.Fragment key={contact.id}>
                    <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleContactSelection(contact.id)}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {contact.company || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-600">
                          {getTypeDisplay(contact.type)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setExpandedContact(isExpanded ? null : contact.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          {contactHistory.length}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => handleEdit(contact)}
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(contact.id)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded History Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 border-t border-gray-200">
                          <div className="px-4 py-4">
                            {contactHistory.length === 0 ? (
                              <div className="text-center py-6 text-gray-500 text-sm">
                                No emails sent to this contact
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-900 mb-3">
                                  Email History ({contactHistory.length})
                                </div>
                                <div className="space-y-2">
                                  {contactHistory.slice(0, 5).map((email) => (
                                    <div
                                      key={email.id}
                                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded text-sm"
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">{email.subject}</div>
                                        <div className="text-gray-500 text-xs mt-1">
                                          {getTemplateName(email.templateId)} • {formatDateTime(email.sentAt)}
                                        </div>
                                      </div>
                                      <Badge 
                                        variant={email.status === 'sent' ? 'default' : 'destructive'}
                                        className="text-xs"
                                      >
                                        {email.status}
                                      </Badge>
                                    </div>
                                  ))}
                                  {contactHistory.length > 5 && (
                                    <div className="text-xs text-gray-500 text-center py-2">
                                      +{contactHistory.length - 5} more emails
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
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

      {/* Contact Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
        description={editingContact ? 'Update contact information' : 'Add a new contact to your audience'}
        size="2xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {loading ? 'Saving...' : (editingContact ? 'Update Contact' : 'Add Contact')}
            </Button>
          </div>
        }
      >
      
      
        <div className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                formErrors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              disabled={loading}
            />
            {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                formErrors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              disabled={loading}
            />
            {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
          </div>

          {/* Company Field */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Enter company name"
              disabled={loading}
            />
          </div>

          {/* Type Field */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Type
            </label>
            <select
              id="type"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Contact['type'] }))}
              disabled={loading}
            >
              <option value="default">Default</option>
              <option value="cold">Cold Lead</option>
              <option value="hot">Hot Lead</option>
            </select>
          </div>

          {/* Tags Field */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="Type tag and press Enter"
              disabled={loading}
            />
            <p className="text-gray-500 text-sm mt-1">Press Enter to add tags</p>
            
            {/* Display Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      onClick={() => handleTagRemove(tag)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
      
      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportContacts}
      />
    </div>
  );
}; 