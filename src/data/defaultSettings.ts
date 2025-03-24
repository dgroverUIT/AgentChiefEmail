import { Settings } from '../types';

export const defaultSettings: Settings = {
  general: {
    companyName: 'My Company',
    defaultLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
  },
  email: {
    defaultFromName: 'AI Assistant',
    defaultFromEmail: 'ai@example.com',
    replyToEmail: 'support@example.com',
    emailFooter: 'Powered by EmailAI',
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