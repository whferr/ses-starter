import { useState, useEffect, useCallback } from 'react';
import { AppSettings, AWSSettings } from '../lib/types';
import { storage } from '../lib/storage';
import { awsSESService } from '../lib/aws-ses';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedSettings = await storage.loadSettings();
      setSettings(loadedSettings);
      
      // Configure AWS SES if settings exist
      if (loadedSettings?.aws) {
        awsSESService.configure(loadedSettings.aws);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      setLoading(true);
      setError(null);
      await storage.saveSettings(newSettings);
      setSettings(newSettings);
      
      // Configure AWS SES with new settings
      awsSESService.configure(newSettings.aws);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAWSSettings = useCallback(async (awsSettings: AWSSettings) => {
    const currentSettings = settings || {
      aws: awsSettings,
      rateLimitPerSecond: 10,
      batchSize: 50,
    };

    const updatedSettings = {
      ...currentSettings,
      aws: awsSettings,
    };

    await saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  const testAWSConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await awsSESService.testConnection();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test AWS connection';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getSendQuota = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await awsSESService.getSendQuota();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get send quota';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const isAWSConfigured = useCallback(() => {
    return awsSESService.isConfigured();
  }, []);

  const getDefaultSettings = useCallback((): AppSettings => {
    return {
      aws: {
        region: 'us-east-1',
        accessKeyId: '',
        secretAccessKey: '',
        fromEmail: '',
        replyToEmail: '',
      },
      rateLimitPerSecond: 10,
      batchSize: 50,
    };
  }, []);

  const resetSettings = useCallback(async () => {
    const defaultSettings = getDefaultSettings();
    await saveSettings(defaultSettings);
  }, [getDefaultSettings, saveSettings]);

  const updateRateLimit = useCallback(async (rateLimitPerSecond: number) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      rateLimitPerSecond,
    };

    await saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  const updateBatchSize = useCallback(async (batchSize: number) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      batchSize,
    };

    await saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    saveSettings,
    updateAWSSettings,
    testAWSConnection,
    getSendQuota,
    isAWSConfigured,
    getDefaultSettings,
    resetSettings,
    updateRateLimit,
    updateBatchSize,
  };
}; 