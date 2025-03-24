import React from 'react';
import { Settings } from '../types';
import { Key, Mail, Bell, Shield, Webhook } from 'lucide-react';

interface SettingsFormProps {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
  onSave: () => void;
}

export default function SettingsForm({ settings, onUpdate, onSave }: SettingsFormProps) {
  const handleChange = (section: keyof Settings, field: string, value: any) => {
    onUpdate({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Key className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold">General Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              value={settings.general.companyName}
              onChange={(e) => handleChange('general', 'companyName', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Language</label>
            <select
              value={settings.general.defaultLanguage}
              onChange={(e) => handleChange('general', 'defaultLanguage', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => handleChange('general', 'timezone', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Format</label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Mail className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold">Email Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Default From Name</label>
            <input
              type="text"
              value={settings.email.defaultFromName}
              onChange={(e) => handleChange('email', 'defaultFromName', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default From Email</label>
            <input
              type="email"
              value={settings.email.defaultFromEmail}
              onChange={(e) => handleChange('email', 'defaultFromEmail', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reply-To Email</label>
            <input
              type="email"
              value={settings.email.replyToEmail}
              onChange={(e) => handleChange('email', 'replyToEmail', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Footer</label>
            <textarea
              value={settings.email.emailFooter}
              onChange={(e) => handleChange('email', 'emailFooter', e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Attachment Size (MB)</label>
            <input
              type="number"
              value={settings.email.maxAttachmentSize}
              onChange={(e) => handleChange('email', 'maxAttachmentSize', parseInt(e.target.value))}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Bell className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold">Notification Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Email Notifications</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slack Webhook URL</label>
            <input
              type="url"
              value={settings.notifications.slackWebhook || ''}
              onChange={(e) => handleChange('notifications', 'slackWebhook', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="https://hooks.slack.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slack Channel</label>
            <input
              type="text"
              value={settings.notifications.slackChannel || ''}
              onChange={(e) => handleChange('notifications', 'slackChannel', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="#channel-name"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.notifyOnNewConversation}
                onChange={(e) => handleChange('notifications', 'notifyOnNewConversation', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Notify on new conversation</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.notifyOnHandoff}
                onChange={(e) => handleChange('notifications', 'notifyOnHandoff', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Notify on human handoff</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.notifyOnError}
                onChange={(e) => handleChange('notifications', 'notifyOnError', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Notify on errors</span>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Shield className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold">Security Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.security.twoFactorEnabled}
                onChange={(e) => handleChange('security', 'twoFactorEnabled', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Enable Two-Factor Authentication</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Allowed Domains</label>
            <input
              type="text"
              value={settings.security.allowedDomains.join(', ')}
              onChange={(e) => handleChange('security', 'allowedDomains', e.target.value.split(',').map(d => d.trim()))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="example.com, another-domain.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">IP Whitelist</label>
            <input
              type="text"
              value={settings.security.ipWhitelist.join(', ')}
              onChange={(e) => handleChange('security', 'ipWhitelist', e.target.value.split(',').map(ip => ip.trim()))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="192.168.1.1, 10.0.0.0/24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
              min="5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Webhook className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold">API Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="password"
                value={settings.api.apiKey}
                readOnly
                className="flex-1 rounded-l-md border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button
                type="button"
                onClick={() => {
                  const newApiKey = crypto.randomUUID();
                  handleChange('api', 'apiKey', newApiKey);
                }}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
              >
                Regenerate
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
            <input
              type="url"
              value={settings.api.webhookUrl || ''}
              onChange={(e) => handleChange('api', 'webhookUrl', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="https://your-domain.com/webhook"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Webhook Secret</label>
            <input
              type="password"
              value={settings.api.webhookSecret || ''}
              onChange={(e) => handleChange('api', 'webhookSecret', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}