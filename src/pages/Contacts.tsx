import React, { useState } from 'react';
import { Contact, ContactFormData } from '../lib/types';
import { useContacts } from '../hooks/useContacts';
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

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}; 