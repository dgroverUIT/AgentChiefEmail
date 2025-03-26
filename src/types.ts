/**
 * Core type definitions for the EmailAI application
 */

import { z } from "zod";

/**
 * Represents an AI-powered email bot
 */
export interface Bot {
  id: string; // Unique identifier for the bot
  name: string; // Display name of the bot
  status: "active" | "inactive"; // Current operational status
  emailAddress: string; // Email address the bot uses
  createdAt: string; // Creation timestamp
  lastActive: string; // Last activity timestamp
  totalEmails: number; // Total number of emails processed
  responseRate: number; // Percentage of successful responses
  description?: string; // Optional bot description
  forwardTemplateId?: string; // Template ID for forwarding emails
  forwardEmailAddress?: string; // Address to forward complex queries
  forwardEmailDisplay?: string; // Read-only display text for forwarding
  includeCustomerInForward?: boolean; // Whether to CC customer in forwards
  fineTuningQuestions?: string[]; // Associated fine-tuning questions
}

/**
 * Represents a fine-tuning question for training bots
 */
export interface FineTuningQuestion {
  id: string; // Unique identifier
  question: string; // The question text
  expectedAnswer: string; // The expected answer
  category: string; // Question category
  difficulty: "easy" | "medium" | "hard"; // Question difficulty
  tags: string[]; // Categorization tags
  createdAt: string; // Creation timestamp
  lastUsed?: string; // Last usage timestamp
  successRate?: number; // Success rate in training
  botIds: string[]; // Associated bot IDs
  isActive: boolean; // Whether the question is active
}

/**
 * Represents an email conversation thread
 */
export interface Conversation {
  id: string; // Unique conversation identifier
  botId: string; // ID of the bot handling the conversation
  customerEmail: string; // Customer's email address
  subject: string; // Email subject line
  status: "active" | "resolved" | "pending" | "forwarded"; // Current status
  startedAt: string; // Conversation start timestamp
  lastMessageAt: string; // Last message timestamp
  totalMessages: number; // Total messages in thread
  tags: string[]; // Categorization tags
  sentiment: "positive" | "neutral" | "negative"; // Overall conversation sentiment
  messages: Message[]; // Array of messages in the conversation
}

/**
 * Represents a single message in a conversation
 */
export interface Message {
  id: string; // Unique message identifier
  conversationId: string; // Parent conversation ID
  sender: "bot" | "customer" | "human"; // Message sender type
  content: string; // Message content
  timestamp: string; // Message timestamp
  attachments?: Attachment[]; // Optional file attachments
}

/**
 * Represents a file attachment in a message
 */
export interface Attachment {
  id: string; // Unique attachment identifier
  name: string; // Original filename
  type: string; // MIME type
  size: number; // File size in bytes
  url: string; // File access URL
}

/**
 * Represents an email template for automated responses
 */
export interface EmailTemplate {
  id: string; // Unique template identifier
  name: string; // Template name
  category: "support" | "sales" | "onboarding" | "handoff" | "other"; // Template category
  subject: string; // Email subject template
  content: string; // Email body template
  variables: string[]; // Template variables
  language: string; // Template language code
  lastModified: string; // Last modification timestamp
  createdBy: string; // Creator identifier
  isActive: boolean; // Template status
  tags: string[]; // Categorization tags
}

/**
 * Represents a knowledge base item
 */
export interface KnowledgeBase {
  id: string; // Unique identifier
  name: string; // Display name
  type: "document" | "website"; // Source type
  source: string; // Source URL or document path
  status: "processing" | "ready" | "error"; // Processing status
  lastUpdated: string; // Last update timestamp
}

/**
 * Represents a document upload request
 */
export interface UploadDocument {
  name: string; // Document name
  description?: string; // Optional description
  tags: string[]; // Categorization tags
  source: string; // Document path
}

/**
 * Represents a website source for knowledge base
 */
export interface WebsiteSource {
  url: string; // Website URL
  name: string; // Display name
  description?: string; // Optional description
  crawlFrequency: "daily" | "weekly" | "monthly" | "never"; // Update frequency
  tags: string[]; // Categorization tags
}

/**
 * Zod schema for application settings validation
 */
export const settingsSchema = z.object({
  general: z.object({
    companyName: z.string().min(1),
    defaultLanguage: z.string(),
    timezone: z.string(),
    dateFormat: z.string(),
  }),
  email: z.object({
    defaultFromName: z.string().min(1),
    defaultFromEmail: z.string().email(),
    replyToEmail: z.string().email(),
    emailFooter: z.string(),
    maxAttachmentSize: z.number().min(1),
  }),
  notifications: z.object({
    emailNotifications: z.boolean(),
    slackWebhook: z.string().url().optional(),
    slackChannel: z.string().optional(),
    notifyOnNewConversation: z.boolean(),
    notifyOnHandoff: z.boolean(),
    notifyOnError: z.boolean(),
  }),
  security: z.object({
    twoFactorEnabled: z.boolean(),
    allowedDomains: z.array(z.string()),
    ipWhitelist: z.array(z.string()),
    sessionTimeout: z.number(),
  }),
  api: z.object({
    apiKey: z.string(),
    webhookUrl: z.string().url().optional(),
    webhookSecret: z.string().optional(),
  }),
});

/**
 * Type definition for application settings
 */
export type Settings = z.infer<typeof settingsSchema>;
