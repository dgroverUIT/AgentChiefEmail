import React, { useState } from 'react';
import { Bot as BotIcon, Mail, Brain, Settings, BarChart3, Plus, Upload, Link, LineChart, Users, Bell, Shield, Key, MessageSquare, Pencil, MessageCircle, Sparkles } from 'lucide-react';
import AuthButton from './AuthButton';
import BotModal from './CreateBotModal';
import UploadDocumentModal from './UploadDocumentModal';
import AddUrlModal from './AddUrlModal';
import CreateTemplateModal from './CreateTemplateModal';
import ConversationList from './ConversationList';
import FineTuningQuestionList from './FineTuningQuestionList';
import { useSettings } from '../hooks/useSettings';
import { useStore } from '../hooks/useStore';
import SettingsForm from './SettingsForm';
import { Bot, KnowledgeBase, UploadDocument, WebsiteSource, EmailTemplate, Conversation, FineTuningQuestion } from '../types';

// Format date safely
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never';
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
};

const AnalyticsCard = ({ title, value, icon: Icon, change }: { title: string; value: string; icon: React.ElementType; change?: string }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        {change && <p className="mt-1 text-sm text-green-600">+{change} from last month</p>}
      </div>
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
  </div>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('bots');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | undefined>(undefined);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    bots,
    conversations,
    templates,
    knowledgeBase,
    settings,
    fineTuningQuestions,
    addBot,
    updateBot,
    addTemplate,
    updateTemplate,
    addKnowledgeBase,
    updateSettings,
    addFineTuningQuestion,
    updateFineTuningQuestion,
    deleteFineTuningQuestions,
  } = useStore();

  const { settings: settingsState, updateSettings: updateSettingsState, saveSettings, errors: settingsErrors } = useSettings();

  const handleSubmit = async (botData: {
    name: string;
    emailAddress: string;
    description: string;
    responseTime: string;
    forwardTemplateId: string;
    forwardEmailAddress: string;
    includeCustomerInForward: boolean;
  }) => {
    setError(null);
    setIsLoading(true);
    try {
      if (editingBot) {
        await updateBot(editingBot.id, {
          name: botData.name,
          emailAddress: botData.emailAddress,
          description: botData.description,
          forwardTemplateId: botData.forwardTemplateId,
          forwardEmailAddress: botData.forwardEmailAddress,
          includeCustomerInForward: botData.includeCustomerInForward,
        });
      } else {
        await addBot(botData);
      }
      setIsModalOpen(false);
      setEditingBot(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBot = (bot: Bot) => {
    setEditingBot(bot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBot(undefined);
    setError(null);
  };

  const handleDocumentUpload = async (data: UploadDocument) => {
    try {
      await addKnowledgeBase({
        name: data.name,
        type: 'document',
        source: data.name,
        description: data.description,
        tags: data.tags,
      });
      setIsUploadModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading the document');
    }
  };

  const handleUrlAdd = async (data: WebsiteSource) => {
    try {
      await addKnowledgeBase({
        name: data.name,
        type: 'website',
        source: data.url,
        description: data.description,
        tags: data.tags,
      });
      setIsUrlModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the URL');
    }
  };

  const handleTemplateSubmit = async (templateData: Omit<EmailTemplate, 'id' | 'lastModified' | 'createdBy'>) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
      } else {
        await addTemplate(templateData);
      }
      setIsTemplateModalOpen(false);
      setEditingTemplate(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the template');
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleAddFineTuningQuestion = async (question: Omit<FineTuningQuestion, 'id' | 'createdAt' | 'successRate'>) => {
    try {
      await addFineTuningQuestion(question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the question');
    }
  };

  const handleEditFineTuningQuestion = async (id: string, question: Partial<FineTuningQuestion>) => {
    try {
      await updateFineTuningQuestion(id, question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the question');
    }
  };

  const handleDeleteQuestions = async (ids: string[]) => {
    try {
      await deleteFineTuningQuestions(ids);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete questions');
    }
  };

  const handleExportConversations = (botId: string) => {
    const exportConversations = botId === 'all' ? conversations : conversations.filter(conv => conv.botId === botId);
    const filename = botId === 'all' ? 'all-conversations.csv' : `${bots.find(b => b.id === botId)?.name.toLowerCase().replace(/\s+/g, '-')}-conversations.csv`;
    
    const csvContent = [
      ['Conversation ID', 'Customer Email', 'Subject', 'Status', 'Started At', 'Last Message', 'Total Messages', 'Sentiment', 'Bot'].join(','),
      ...exportConversations.map(conv => [
        conv.id,
        conv.customerEmail,
        `"${conv.subject}"`,
        conv.status,
        new Date(conv.startedAt).toLocaleString(),
        new Date(conv.lastMessageAt).toLocaleString(),
        conv.totalMessages,
        conv.sentiment,
        bots.find(b => b.id === conv.botId)?.name || 'Unknown Bot'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BotIcon className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AgentChief EmailBots</span>
            </div>
            <div className="flex items-center">
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('bots')}
              className={`${
                activeTab === 'bots'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <BotIcon className="h-5 w-5 mr-2" />
              Bots
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`${
                activeTab === 'conversations'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('fine-tuning')}
              className={`${
                activeTab === 'fine-tuning'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Fine-Tuning
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`${
                activeTab === 'templates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Mail className="h-5 w-5 mr-2" />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`${
                activeTab === 'knowledge'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Brain className="h-5 w-5 mr-2" />
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'bots' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Email Bots</h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                  disabled={isLoading}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Bot
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {bot.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            bot.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {bot.status}
                        </span>
                        <button
                          onClick={() => handleEditBot(bot)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p className="text-gray-600">
                        Email: {bot.emailAddress}
                      </p>
                      <p className="text-gray-600">
                        Created: {formatDate(bot.createdAt)}
                      </p>
                      <p className="text-gray-600">
                        Last Active: {formatDate(bot.lastActive)}
                      </p>
                      {(bot.forwardTemplateId || bot.forwardEmailAddress) && (
                        <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md">
                          <MessageSquare className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="space-y-2">
                            {bot.forwardEmailAddress && (
                              <div>
                                <p className="text-xs font-medium text-gray-500">Forward To</p>
                                <p className="text-sm text-gray-700">{bot.forwardEmailAddress}</p>
                                <p className="text-xs text-gray-500">
                                  {bot.includeCustomerInForward ? 'Customer will be CC\'d' : 'Customer not included'}
                                </p>
                              </div>
                            )}
                            {bot.forwardTemplateId && (
                              <div>
                                <p className="text-xs font-medium text-gray-500">Using Template</p>
                                <p className="text-sm text-gray-700">
                                  {templates.find(t => t.id === bot.forwardTemplateId)?.name || 'Template not found'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-gray-500">Total Emails</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {bot.totalEmails?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Response Rate</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {bot.responseRate?.toString() || '0'}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Conversations</h2>
              </div>
              <ConversationList
                conversations={conversations}
                bots={bots}
                onExport={handleExportConversations}
              />
            </div>
          )}

          {activeTab === 'fine-tuning' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Fine-Tuning Questions</h2>
              </div>
              <FineTuningQuestionList
                questions={fineTuningQuestions}
                bots={bots}
                onAddQuestion={handleAddFineTuningQuestion}
                onEditQuestion={handleEditFineTuningQuestion}
                onDeleteQuestions={handleDeleteQuestions}
              />
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
                <button 
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Template
                </button>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Language
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tags
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {templates.map((template) => (
                        <tr key={template.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500">{template.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{template.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{template.language}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {template.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {templates.length === 0 && (
                  <div className="text-center py-12">
                    <Mail className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Create your first email template to get started</p>
                    <div className="mt-6 flex justify-center gap-3">
                      <button
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Template
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsUrlModalOpen(true)}
                    className="bg-white text-gray-600 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Link className="h-5 w-5 mr-2" />
                    Add URL
                  </button>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Documents
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tags
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {knowledgeBase.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.type === 'document' ? 'Document' : 'Website'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {item.source}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'ready'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(item.lastUpdated).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {knowledgeBase.length === 0 && (
                  <div className="text-center py-12">
                    <Brain className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Knowledge base empty</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload documents or add website URLs to train your bots</p>
                    <div className="mt-6 flex justify-center gap-3">
                      <button
                        onClick={() => setIsUrlModalOpen(true)}
                        className="bg-white text-gray-600 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <Link className="h-5 w-5 mr-2" />
                        Add URL
                      </button>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Documents
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                  title="Total Conversations"
                  value={conversations.length.toString()}
                  icon={MessageSquare}
                  change="12%"
                />
                <AnalyticsCard
                  title="Active Bots"
                  value={bots.filter(b => b.status === 'active').length.toString()}
                  icon={BotIcon}
                  change="2"
                />
                <AnalyticsCard
                  title="Average Response Rate"
                  value={`${Math.round(bots.reduce((acc, bot) => acc + (bot.responseRate || 0), 0) / (bots.length || 1))}%`}
                  icon={LineChart}
                />
                <AnalyticsCard
                  title="Total Messages"
                  value={conversations.reduce((acc, conv) => acc + conv.totalMessages, 0).toString()}
                  icon={MessageCircle}
                  change="8%"
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              </div>
              <SettingsForm
                settings={settingsState}
                onUpdate={updateSettingsState}
                onSave={saveSettings}
              />
            </div>
          )}
        </div>

        <BotModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editBot={editingBot}
          templates={templates}
          error={error}
          isLoading={isLoading}
        />

        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleDocumentUpload}
        />

        <AddUrlModal
          isOpen={isUrlModalOpen}
          onClose={() => setIsUrlModalOpen(false)}
          onSubmit={handleUrlAdd}
        />

        <CreateTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => {
            setIsTemplateModalOpen(false);
            setEditingTemplate(undefined);
          }}
          onSubmit={handleTemplateSubmit}
          editTemplate={editingTemplate}
        />
      </div>
    </div>
  );
}