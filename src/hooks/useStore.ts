import { create } from 'zustand';
import { Bot, Conversation, EmailTemplate, KnowledgeBase, Settings, FineTuningQuestion } from '../types';
import { createBot, updateBot as updateBotService } from '../services/botService';
import { createTemplate, updateTemplate as updateTemplateService } from '../services/templateService';
import { createKnowledgeBaseItem, updateKnowledgeBaseItem as updateKnowledgeBaseService } from '../services/knowledgeBaseService';
import { createFineTuningQuestion, updateFineTuningQuestion as updateFineTuningQuestionService, deleteFineTuningQuestion } from '../services/fineTuningService';
import { fetchBots, fetchTemplates, fetchFineTuningQuestions, fetchKnowledgeBase, fetchConversations } from '../services/dataService';
import { defaultSettings } from '../data/defaultSettings';

interface Store {
  // State properties
  bots: Bot[];
  conversations: Conversation[];
  templates: EmailTemplate[];
  knowledgeBase: KnowledgeBase[];
  settings: Settings;
  fineTuningQuestions: FineTuningQuestion[];
  isLoading: boolean;
  error: string | null;
  
  // Action methods
  initialize: () => Promise<void>;
  addBot: (bot: Omit<Bot, 'id' | 'status' | 'createdAt' | 'lastActive' | 'totalEmails' | 'responseRate'>) => Promise<void>;
  updateBot: (id: string, bot: Partial<Bot>) => Promise<void>;
  addConversation: (conversation: Omit<Conversation, 'id' | 'startedAt' | 'lastMessageAt' | 'totalMessages'>) => void;
  updateConversation: (id: string, conversation: Partial<Conversation>) => void;
  addTemplate: (template: Omit<EmailTemplate, 'id' | 'lastModified' | 'createdBy'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<EmailTemplate>) => Promise<void>;
  addKnowledgeBase: (item: Omit<KnowledgeBase, 'id' | 'status' | 'lastUpdated'>) => Promise<void>;
  updateKnowledgeBase: (id: string, item: Partial<KnowledgeBase>) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
  addFineTuningQuestion: (question: Omit<FineTuningQuestion, 'id' | 'createdAt' | 'successRate'>) => Promise<void>;
  updateFineTuningQuestion: (id: string, question: Partial<FineTuningQuestion>) => Promise<void>;
  deleteFineTuningQuestions: (ids: string[]) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  // Initial state
  bots: [],
  conversations: [],
  templates: [],
  knowledgeBase: [],
  settings: defaultSettings,
  fineTuningQuestions: [],
  isLoading: false,
  error: null,

  // Initialize function to load data from Supabase
  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const [bots, templates, questions, knowledge, conversations] = await Promise.all([
        fetchBots(),
        fetchTemplates(),
        fetchFineTuningQuestions(),
        fetchKnowledgeBase(),
        fetchConversations()
      ]);

      set({
        bots,
        templates,
        fineTuningQuestions: questions,
        knowledgeBase: knowledge,
        conversations,
        isLoading: false
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false 
      });
    }
  },

  // Actions
  addBot: async (bot) => {
    const result = await createBot(bot);
    if (result.success && result.bot) {
      set((state) => ({
        bots: [...state.bots, result.bot],
      }));
    } else {
      throw new Error(result.error || 'Failed to create bot');
    }
  },

  updateBot: async (id, bot) => {
    const result = await updateBotService(id, bot);
    if (result.success && result.bot) {
      set((state) => ({
        bots: state.bots.map((b) => (b.id === id ? { ...b, ...result.bot } : b)),
      }));
    }
  },

  addConversation: (conversation) => set((state) => ({
    conversations: [...state.conversations, {
      ...conversation,
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      totalMessages: conversation.messages?.length || 0,
    }],
  })),

  updateConversation: (id, conversation) => set((state) => ({
    conversations: state.conversations.map((c) => (c.id === id ? { ...c, ...conversation } : c)),
  })),

  addTemplate: async (template) => {
    const result = await createTemplate(template);
    if (result.success && result.template) {
      set((state) => ({
        templates: [...state.templates, result.template],
      }));
    } else {
      throw new Error(result.error || 'Failed to create template');
    }
  },

  updateTemplate: async (id, template) => {
    const result = await updateTemplateService(id, template);
    if (result.success && result.template) {
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? { ...t, ...result.template } : t)),
      }));
    }
  },

  addKnowledgeBase: async (item) => {
    const result = await createKnowledgeBaseItem(item);
    if (result.success && result.item) {
      set((state) => ({
        knowledgeBase: [...state.knowledgeBase, result.item],
      }));
    } else {
      throw new Error(result.error || 'Failed to create knowledge base item');
    }
  },

  updateKnowledgeBase: async (id, item) => {
    const result = await updateKnowledgeBaseService(id, item);
    if (result.success && result.item) {
      set((state) => ({
        knowledgeBase: state.knowledgeBase.map((i) => (i.id === id ? { ...i, ...result.item } : i)),
      }));
    }
  },

  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings },
  })),

  addFineTuningQuestion: async (question) => {
    const result = await createFineTuningQuestion(question);
    if (result.success && result.question) {
      set((state) => ({
        fineTuningQuestions: [...state.fineTuningQuestions, result.question],
      }));
    } else {
      throw new Error(result.error || 'Failed to create fine-tuning question');
    }
  },

  updateFineTuningQuestion: async (id, question) => {
    const result = await updateFineTuningQuestionService(id, question);
    if (result.success && result.question) {
      set((state) => ({
        fineTuningQuestions: state.fineTuningQuestions.map((q) => (q.id === id ? { ...q, ...result.question } : q)),
      }));
    }
  },

  deleteFineTuningQuestions: async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteFineTuningQuestion(id)));
      set((state) => ({
        fineTuningQuestions: state.fineTuningQuestions.filter(q => !ids.includes(q.id)),
      }));
    } catch (error) {
      console.error('Error deleting questions:', error);
      throw error;
    }
  },
}));