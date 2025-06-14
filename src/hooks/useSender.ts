import { useState, useEffect, useCallback } from 'react';
import { SenderProfile } from '../lib/types';
import { storage } from '../lib/storage';

export const useSender = () => {
  const [senderProfiles, setSenderProfiles] = useState<SenderProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSenderProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profiles = await storage.loadSenderProfiles();
      setSenderProfiles(profiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sender profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSenderProfiles();
  }, [loadSenderProfiles]);

  const createSenderProfile = useCallback(async (profileData: Omit<SenderProfile, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newProfile = await storage.createSenderProfile(profileData);
      setSenderProfiles(prev => [...prev, newProfile]);
      return newProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sender profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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

  const getDefaultProfile = useCallback(() => {
    return senderProfiles.find(profile => profile.isDefault) || senderProfiles[0] || null;
  }, [senderProfiles]);

  const setDefaultProfile = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update all profiles: set target as default, others as non-default
      const promises = senderProfiles.map(profile => 
        storage.updateSenderProfile(profile.id, { isDefault: profile.id === id })
      );
      
      await Promise.all(promises);
      
      // Reload to get updated state
      await loadSenderProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [senderProfiles, loadSenderProfiles]);

  return {
    senderProfiles,
    loading,
    error,
    loadSenderProfiles,
    createSenderProfile,
    updateSenderProfile,
    deleteSenderProfile,
    getDefaultProfile,
    setDefaultProfile,
  };
}; 