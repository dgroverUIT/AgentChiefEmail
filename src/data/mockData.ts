import { Bot, Conversation, EmailTemplate } from '../types';

export const MOCK_BOTS: Bot[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    status: 'active',
    emailAddress: 'support@demo.com',
    createdAt: '2024-03-10',
    lastActive: '2024-03-15',
    totalEmails: 1250,
    responseRate: 95,
    description: 'Handles customer support inquiries',
    forwardTemplateId: '1',
    forwardEmailAddress: 'support-team@demo.com',
    includeCustomerInForward: true,
  },
  {
    id: '2',
    name: 'Sales Assistant',
    status: 'active',
    emailAddress: 'sales@demo.com',
    createdAt: '2024-03-01',
    lastActive: '2024-03-15',
    totalEmails: 850,
    responseRate: 92,
    description: 'Handles sales inquiries',
    forwardTemplateId: '2',
    forwardEmailAddress: 'sales-team@demo.com',
    includeCustomerInForward: false,
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    botId: '1',
    customerEmail: 'customer@example.com',
    subject: 'Need help with my order',
    status: 'active',
    startedAt: '2024-03-15T10:00:00Z',
    lastMessageAt: '2024-03-15T10:30:00Z',
    totalMessages: 5,
    tags: ['order', 'support'],
    sentiment: 'positive',
    messages: [
      {
        id: '1',
        conversationId: '1',
        sender: 'customer',
        content: 'Hi, I need help tracking my order #12345',
        timestamp: '2024-03-15T10:00:00Z'
      },
      {
        id: '2',
        conversationId: '1',
        sender: 'bot',
        content: 'I\'ll help you track your order. Let me look that up for you.',
        timestamp: '2024-03-15T10:01:00Z'
      }
    ]
  },
  {
    id: '2',
    botId: '2',
    customerEmail: 'prospect@example.com',
    subject: 'Product pricing inquiry',
    status: 'forwarded',
    startedAt: '2024-03-15T09:00:00Z',
    lastMessageAt: '2024-03-15T09:45:00Z',
    totalMessages: 3,
    tags: ['sales', 'pricing'],
    sentiment: 'neutral',
    messages: [
      {
        id: '3',
        conversationId: '2',
        sender: 'customer',
        content: 'Can you tell me about your enterprise pricing?',
        timestamp: '2024-03-15T09:00:00Z'
      },
      {
        id: '4',
        conversationId: '2',
        sender: 'bot',
        content: 'I\'ll connect you with our sales team for detailed pricing information.',
        timestamp: '2024-03-15T09:01:00Z'
      }
    ]
  }
];

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    name: 'Human Support Handoff',
    category: 'handoff',
    subject: 'Support Request: {{ticket_number}}',
    content: 'Dear Support Team,\n\nA customer inquiry requires human attention.\n\nTicket: {{ticket_number}}\nCustomer: {{customer_name}}\nIssue: {{issue_description}}\n\nBest regards,\nAI Assistant',
    variables: ['ticket_number', 'customer_name', 'issue_description'],
    language: 'en',
    lastModified: new Date().toISOString(),
    createdBy: 'system',
    isActive: true,
    tags: ['support', 'handoff']
  },
  {
    id: '2',
    name: 'Sales Team Handoff',
    category: 'handoff',
    subject: 'Sales Opportunity: {{lead_id}}',
    content: 'Dear Sales Team,\n\nA potential sales opportunity has been identified.\n\nLead ID: {{lead_id}}\nProspect: {{prospect_name}}\nInterest: {{interest_area}}\n\nBest regards,\nAI Assistant',
    variables: ['lead_id', 'prospect_name', 'interest_area'],
    language: 'en',
    lastModified: new Date().toISOString(),
    createdBy: 'system',
    isActive: true,
    tags: ['sales', 'handoff']
  }
];