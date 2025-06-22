import { useState, useEffect, useCallback } from 'react';
import { Contact, ContactFormData } from '../lib/types';
import { storage } from '../lib/storage';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedContacts = await storage.loadContacts();
      setContacts(loadedContacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const createContact = useCallback(async (contactData: ContactFormData) => {
    try {
      setLoading(true);
      setError(null);
      const newContact = await storage.createContact(contactData);
      setContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (id: string, updates: Partial<Contact>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedContact = await storage.updateContact(id, updates);
      if (updatedContact) {
        setContacts(prev => 
          prev.map(contact => contact.id === id ? updatedContact : contact)
        );
        return updatedContact;
      }
      throw new Error('Contact not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    // Store original contacts for potential rollback
    const originalContacts = contacts;
    
    try {
      setError(null);
      
      // Optimistic update - update UI immediately
      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      // Then sync with storage in the background
      const success = await storage.deleteContact(id);
      
      if (!success) {
        // Rollback if contact wasn't found
        setContacts(originalContacts);
        throw new Error('Contact not found');
      }
    } catch (err) {
      // Rollback UI on failure
      setContacts(originalContacts);
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
      throw err;
    }
  }, [contacts]);

  const deleteMultipleContacts = useCallback(async (ids: string[]) => {
    // Store original contacts for potential rollback
    const originalContacts = contacts;
    
    try {
      setError(null);
      
      // Optimistic update - update UI immediately
      setContacts(prev => prev.filter(contact => !ids.includes(contact.id)));
      
      // Then sync with storage in the background
      const deletedCount = await storage.deleteMultipleContacts(ids);
      
      // If no contacts were actually deleted, rollback
      if (deletedCount === 0) {
        setContacts(originalContacts);
        throw new Error('No contacts were found to delete');
      }
      
      return deletedCount;
    } catch (err) {
      // Rollback UI on failure
      setContacts(originalContacts);
      setError(err instanceof Error ? err.message : 'Failed to delete contacts');
      throw err;
    }
  }, [contacts]);

  const getContactById = useCallback((id: string) => {
    return contacts.find(contact => contact.id === id);
  }, [contacts]);

  const searchContacts = useCallback((query: string) => {
    if (!query.trim()) return contacts;
    
    const lowercaseQuery = query.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.email.toLowerCase().includes(lowercaseQuery) ||
      contact.company?.toLowerCase().includes(lowercaseQuery) ||
      contact.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [contacts]);

  const filterContactsByType = useCallback((type: Contact['type']) => {
    return contacts.filter(contact => contact.type === type);
  }, [contacts]);

  const getContactsByTags = useCallback((tags: string[]) => {
    return contacts.filter(contact => 
      tags.some(tag => contact.tags.includes(tag))
    );
  }, [contacts]);

  const getAllTags = useCallback(() => {
    const allTags = contacts.flatMap(contact => contact.tags);
    return Array.from(new Set(allTags)).sort();
  }, [contacts]);

  const importContacts = useCallback(async (newContacts: ContactFormData[]) => {
    try {
      setLoading(true);
      setError(null);
      const createdContacts = await storage.createMultipleContacts(newContacts);
      setContacts(prev => [...prev, ...createdContacts]);
      return createdContacts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import contacts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportContacts = useCallback(() => {
    return contacts;
  }, [contacts]);

  return {
    contacts,
    loading,
    error,
    loadContacts,
    createContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
    getContactById,
    searchContacts,
    filterContactsByType,
    getContactsByTags,
    getAllTags,
    importContacts,
    exportContacts,
  };
}; 