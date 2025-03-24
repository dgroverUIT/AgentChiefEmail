/**
 * Custom hook for managing application settings
 * Provides validation and persistence of settings
 */

import { useState } from 'react';
import { Settings, settingsSchema } from '../types';

/**
 * Default settings configuration
 */
const defaultSettings: Settings = {
  general: {
    companyName: 'AgentChief EmailBots',
    defaultLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
  },
  email: {
    defaultFromName: 'AI Assistant',
    defaultFromEmail: 'ai@example.com',
    replyToEmail: 'support@example.com',
    emailFooter: 'Powered by AgentChief EmailBots',
    maxAttachmentSize: 10,
  },
  notifications: {
    emailNotifications: true,
    slackWebhook: '',
    slackChannel: '',
    notifyOnNewConversation: true,
    notifyOnHandoff: true,
    notifyOnError: true,
  },
  security: {
    twoFactorEnabled: false,
    allowedDomains: [],
    ipWhitelist: [],
    sessionTimeout: 30,
  },
  api: {
    apiKey: crypto.randomUUID(),
    webhookUrl: '',
    webhookSecret: '',
  },
};

/**
 * Hook for managing settings state and validation
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Update settings with validation
   */
  const updateSettings = (newSettings: Settings) => {
    try {
      const validated = settingsSchema.parse(newSettings);
      setSettings(validated);
      setErrors([]);
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors.map((e: any) => e.message));
      }
    }
  };

  /**
   * Save settings to backend (mock implementation)
   */
  const saveSettings = async () => {
    try {
      const validated = settingsSchema.parse(settings);
      // In a real app, you would save the settings to your backend here
      console.log('Saving settings:', validated);
      return true;
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors.map((e: any) => e.message));
      }
      return false;
    }
  };

  return {
    settings,
    updateSettings,
    saveSettings,
    errors,
  };
}