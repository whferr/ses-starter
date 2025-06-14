import { useState, useEffect, useCallback } from 'react';
import { SentEmail } from '../lib/types';
import { storage } from '../lib/storage';

export const useHistory = () => {
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const emails = await storage.loadSentEmails();
      // Sort by most recent first
      setSentEmails(emails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const recordSentEmail = useCallback(async (emailData: Omit<SentEmail, 'id' | 'sentAt'>) => {
    try {
      const sentEmail = await storage.recordSentEmail(emailData);
      setSentEmails(prev => [sentEmail, ...prev]);
      return sentEmail;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record sent email');
      throw err;
    }
  }, []);

  const getEmailsForContact = useCallback((contactId: string) => {
    return sentEmails.filter(email => email.contactId === contactId);
  }, [sentEmails]);

  const getEmailsByStatus = useCallback((status: SentEmail['status']) => {
    return sentEmails.filter(email => email.status === status);
  }, [sentEmails]);

  const getEmailsByTemplate = useCallback((templateId: string) => {
    return sentEmails.filter(email => email.templateId === templateId);
  }, [sentEmails]);

  const getEmailsBySender = useCallback((senderProfileId: string) => {
    return sentEmails.filter(email => email.senderProfileId === senderProfileId);
  }, [sentEmails]);

  const getRecentEmails = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sentEmails.filter(email => 
      new Date(email.sentAt) >= cutoffDate
    );
  }, [sentEmails]);

  const getTotalStats = useCallback(() => {
    const total = sentEmails.length;
    const sent = sentEmails.filter(email => email.status === 'sent').length;
    const failed = sentEmails.filter(email => email.status === 'failed').length;
    
    return { total, sent, failed };
  }, [sentEmails]);

  return {
    sentEmails,
    loading,
    error,
    loadHistory,
    recordSentEmail,
    getEmailsForContact,
    getEmailsByStatus,
    getEmailsByTemplate,
    getEmailsBySender,
    getRecentEmails,
    getTotalStats,
  };
}; 