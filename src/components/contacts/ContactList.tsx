import React, { useState, useMemo } from 'react';
import { Contact } from '../../lib/types';

interface ContactListProps {
  contacts: Contact[];
  loading?: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onBulkDelete: (contactIds: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  loading = false,
  onEdit,
  onDelete,
  onBulkDelete,
  searchQuery,
  onSearchChange
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Contact>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<Contact['type'] | 'all'>('all');

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts;

    // Filter by search query
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(lowercaseQuery) ||
        contact.email.toLowerCase().includes(lowercaseQuery) ||
        contact.company?.toLowerCase().includes(lowercaseQuery) ||
        contact.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(contact => contact.type === filterType);
    }

    // Sort contacts
    filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });

    return filtered;
  }, [contacts, searchQuery, filterType, sortField, sortDirection]);

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(filteredAndSortedContacts.map(c => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedContacts.size > 0) {
      onBulkDelete(Array.from(selectedContacts));
      setSelectedContacts(new Set());
    }
  };

  const getTypeColor = (type: Contact['type']) => {
    switch (type) {
      case 'hot':
        return 'badge-error';
      case 'cold':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <div className="spinner mr-2"></div>
            <span>Loading contacts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search contacts by name, email, company, or tags..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="sm:w-48">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as Contact['type'] | 'all')}
              >
                <option value="all">All Types</option>
                <option value="default">Default</option>
                <option value="cold">Cold Leads</option>
                <option value="hot">Hot Leads</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedContacts.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="btn btn-error btn-sm"
                >
                  Delete Selected ({selectedContacts.size})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredAndSortedContacts.length} of {contacts.length} contacts
        </span>
        {selectedContacts.size > 0 && (
          <span>{selectedContacts.size} selected</span>
        )}
      </div>

      {/* Contacts Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">
                  <input
                    type="checkbox"
                    checked={filteredAndSortedContacts.length > 0 && selectedContacts.size === filteredAndSortedContacts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === 'name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortField === 'email' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="table-header-cell">Company</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Tags</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredAndSortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center text-gray-500 py-8">
                    {searchQuery || filterType !== 'all' 
                      ? 'No contacts match your search criteria.' 
                      : 'No contacts yet. Add your first contact to get started.'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                      />
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                    </td>
                    <td className="table-cell">
                      <div className="text-gray-600">{contact.email}</div>
                    </td>
                    <td className="table-cell">
                      <div className="text-gray-600">{contact.company || '-'}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getTypeColor(contact.type)}`}>
                        {contact.type}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="badge badge-secondary text-xs">
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{contact.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-gray-600 text-sm">
                        {formatDate(contact.createdAt)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(contact)}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(contact.id)}
                          className="text-error hover:text-error/80 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 