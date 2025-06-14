import { useState, useEffect, useCallback } from 'react';
import { SenderProfile, SenderProfileFormData, Contact, EmailTemplate, SentEmail } from '../lib/types';
import { storage } from '../lib/storage';
import { awsSESService } from '../lib/aws-ses';
import { EmailUtils } from '../lib/email-utils';

export const useSender = () => {
  const [senderProfiles, setSenderProfiles] = useState<SenderProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingProgress, setSendingProgress] = useState<{
    total: number;
    sent: number;
    failed: number;
    isActive: boolean;
  }>({ total: 0, sent: 0, failed: 0, isActive: false });

  // Load sender profiles on mount
  useEffect(() => {
    loadSenderProfiles();
  }, []);

  const loadSenderProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedProfiles = await storage.loadSenderProfiles();
      setSenderProfiles(loadedProfiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sender profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSenderProfile = useCallback(async (profileData: SenderProfileFormData) => {
    try {
      setLoading(true);
      setError(null);
      const profileWithDefaults = {
        ...profileData,
        isDefault: senderProfiles.length === 0, // Set as default if it's the first profile
      };
      const newProfile = await storage.createSenderProfile(profileWithDefaults);
      setSenderProfiles(prev => [...prev, newProfile]);
      return newProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sender profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [senderProfiles.length]);

  const updateSenderProfile = useCallback(async (id: string, updates: Partial<SenderProfile>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await storage.updateSenderProfile(id, updates);
      if (updatedProfile) {
        setSenderProfiles(prev => 
          prev.map(profile => profile.id === id ? updatedProfile : profile)
        );
        return updatedProfile;
      }
      throw new Error('Sender profile not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sender profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSenderProfile = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await storage.deleteSenderProfile(id);
      if (success) {
        setSenderProfiles(prev => prev.filter(profile => profile.id !== id));
      } else {
        throw new Error('Sender profile not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sender profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSenderProfileById = useCallback((id: string) => {
    return senderProfiles.find(profile => profile.id === id);
  }, [senderProfiles]);

  const getDefaultSenderProfile = useCallback(() => {
    return senderProfiles.find(profile => profile.isDefault);
  }, [senderProfiles]);

  const setDefaultProfile = useCallback(async (id: string) => {
    const profile = getSenderProfileById(id);
    if (!profile) {
      throw new Error('Sender profile not found');
    }

    // Update all profiles to set the new default
    await Promise.all(
      senderProfiles.map(p => 
        updateSenderProfile(p.id, { isDefault: p.id === id })
      )
    );
  }, [senderProfiles, getSenderProfileById, updateSenderProfile]);

  const sendSingleEmail = useCallback(async (params: {
    contact: Contact;
    template: EmailTemplate;
    senderProfileId: string;
  }) => {
    const { contact, template, senderProfileId } = params;
    const senderProfile = getSenderProfileById(senderProfileId);
    
    if (!senderProfile) {
      throw new Error('Sender profile not found');
    }

    if (!awsSESService.isConfigured()) {
      throw new Error('AWS SES not configured');
    }

    try {
      // Process template with contact data
      const processedEmail = EmailUtils.processTemplate(template, contact, senderProfile);
      
      // Send email
      const result = await awsSESService.sendEmail({
        to: contact.email,
        subject: processedEmail.subject,
        htmlContent: processedEmail.htmlContent,
        textContent: processedEmail.textContent,
        from: senderProfile.email,
      });

      // Record sent email
      if (result.success) {
        await storage.recordSentEmail({
          contactId: contact.id,
          templateId: template.id,
          senderProfileId: senderProfileId,
          subject: processedEmail.subject,
          status: 'sent',
          messageId: result.messageId,
        });

        // Update contact's last emailed date
        await storage.updateContact(contact.id, {
          lastEmailed: new Date().toISOString(),
        });
      } else {
        await storage.recordSentEmail({
          contactId: contact.id,
          templateId: template.id,
          senderProfileId: senderProfileId,
          subject: processedEmail.subject,
          status: 'failed',
          error: result.error,
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Record failed email
      await storage.recordSentEmail({
        contactId: contact.id,
        templateId: template.id,
        senderProfileId: senderProfileId,
        subject: template.subject,
        status: 'failed',
        error: errorMessage,
      });

      throw err;
    }
  }, [getSenderProfileById]);

  const sendBulkEmail = useCallback(async (params: {
    contacts: Contact[];
    template: EmailTemplate;
    senderProfileId: string;
    onProgress?: (sent: number, total: number) => void;
  }) => {
    const { contacts, template, senderProfileId, onProgress } = params;
    const senderProfile = getSenderProfileById(senderProfileId);
    
    if (!senderProfile) {
      throw new Error('Sender profile not found');
    }

    if (!awsSESService.isConfigured()) {
      throw new Error('AWS SES not configured');
    }

    setSendingProgress({
      total: contacts.length,
      sent: 0,
      failed: 0,
      isActive: true,
    });

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    try {
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];

        try {
          const result = await sendSingleEmail({
            contact,
            template,
            senderProfileId,
          });

          if (result.success) {
            results.sent++;
          } else {
            results.failed++;
            results.errors.push({ 
              email: contact.email, 
              error: result.error || 'Unknown error' 
            });
          }
        } catch (error) {
          results.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push({ email: contact.email, error: errorMessage });
        }

        // Update progress
        const currentProgress = {
          total: contacts.length,
          sent: results.sent,
          failed: results.failed,
          isActive: true,
        };
        setSendingProgress(currentProgress);
        onProgress?.(results.sent + results.failed, contacts.length);

        // Rate limiting: wait 2-3 seconds between emails
        if (i < contacts.length - 1) {
          const delay = 2000 + Math.random() * 1000; // 2-3 seconds
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      return results;
    } finally {
      setSendingProgress(prev => ({ ...prev, isActive: false }));
    }
  }, [getSenderProfileById, sendSingleEmail]);

  const sendTestEmail = useCallback(async (params: {
    template: EmailTemplate;
    senderProfileId: string;
    testEmail: string;
  }) => {
    const { template, senderProfileId, testEmail } = params;
    const senderProfile = getSenderProfileById(senderProfileId);
    
    if (!senderProfile) {
      throw new Error('Sender profile not found');
    }

    if (!awsSESService.isConfigured()) {
      throw new Error('AWS SES not configured');
    }

    // Create a test contact with preview data
    const testContact: Contact = {
      id: 'test',
      email: testEmail,
      name: 'Test User',
      company: 'Test Company',
      tags: [],
      type: 'default',
      createdAt: new Date().toISOString(),
    };

    // Process template with test data
    const processedEmail = EmailUtils.processTemplate(template, testContact, senderProfile);

    // Send test email
    return await awsSESService.sendEmail({
      to: testEmail,
      subject: `[TEST] ${processedEmail.subject}`,
      htmlContent: processedEmail.htmlContent,
      textContent: processedEmail.textContent,
      from: senderProfile.email,
    });
  }, [getSenderProfileById]);

  return {
    senderProfiles,
    loading,
    error,
    sendingProgress,
    loadSenderProfiles,
    createSenderProfile,
    updateSenderProfile,
    deleteSenderProfile,
    getSenderProfileById,
    getDefaultSenderProfile,
    setDefaultProfile,
    sendSingleEmail,
    sendBulkEmail,
    sendTestEmail,
  };
}; 