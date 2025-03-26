import { supabase } from "../lib/supabase";
import type {
  Bot,
  Conversation,
  EmailTemplate,
  KnowledgeBase,
  FineTuningQuestion,
} from "../types";

export async function fetchBots() {
  try {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    console.log("session", session);

    if (sessionError) {
      console.log("Error getting user session", sessionError);
      return;
    }

    const { data: bots, error } = await supabase
      .from("bots")
      .select("*")
      .eq("created_by", session?.session?.user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bots:", error);
      return [];
    }

    return bots || [];
  } catch (error) {
    console.error("Error in fetchBots:", error);
    return [];
  }
}

export async function fetchTemplates() {
  try {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log("Error getting user session", sessionError);
      return;
    }

    const { data: templates, error } = await supabase
      .from("templates")
      .select(
        `
        id,
        name,
        category,
        subject,
        content,
        variables,
        language,
        last_modified,
        created_by,
        is_active,
        tags
      `
      )
      .eq("created_by", session?.session?.user?.id)
      .order("last_modified", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      return [];
    }

    return (templates || []).map((template) => ({
      id: template.id,
      name: template.name,
      category: template.category,
      subject: template.subject,
      content: template.content,
      variables: template.variables || [],
      language: template.language,
      lastModified: template.last_modified,
      createdBy: template.created_by,
      isActive: template.is_active,
      tags: template.tags || [],
    }));
  } catch (error) {
    console.error("Error in fetchTemplates:", error);
    return [];
  }
}

export async function fetchFineTuningQuestions() {
  try {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log("Error getting user session", sessionError);
      return;
    }

    // First get all questions
    const { data: questions, error: questionsError } = await supabase
      .from("fine_tuning_questions")
      .select(
        `
        id,
        question,
        expected_answer,
        category,
        difficulty,
        tags,
        created_at,
        last_used,
        success_rate,
        is_active,
        created_by
      `
      )
      .eq("created_by", session?.session?.user?.id)
      .order("created_at", { ascending: false });

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      return [];
    }

    // Then get all bot associations
    const { data: associations, error: associationsError } = await supabase
      .from("bot_fine_tuning_questions")
      .select("question_id, bot_id");

    if (associationsError) {
      console.error("Error fetching bot associations:", associationsError);
      return [];
    }

    // Create a map of question ID to bot IDs
    const botAssociations = new Map<string, string[]>();
    associations?.forEach((assoc) => {
      const botIds = botAssociations.get(assoc.question_id) || [];
      botIds.push(assoc.bot_id);
      botAssociations.set(assoc.question_id, botIds);
    });

    // Transform and combine the data
    return (questions || []).map((question) => ({
      id: question.id,
      question: question.question,
      expectedAnswer: question.expected_answer,
      category: question.category,
      difficulty: question.difficulty,
      tags: question.tags || [],
      createdAt: question.created_at,
      lastUsed: question.last_used,
      successRate: question.success_rate,
      isActive: question.is_active,
      botIds: botAssociations.get(question.id) || [],
    }));
  } catch (error) {
    console.error("Error in fetchFineTuningQuestions:", error);
    return [];
  }
}

export async function fetchKnowledgeBase() {
  try {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log("Error getting user session", sessionError);
      return;
    }

    const { data: items, error } = await supabase
      .from("knowledge_base")
      .select(
        `
        id,
        name,
        type,
        source,
        status,
        description,
        last_updated,
        tags
      `
      )
      .eq("created_by", session?.session?.user?.id)
      .order("last_updated", { ascending: false });

    if (error) {
      console.error("Error fetching knowledge base:", error);
      return [];
    }

    return (items || []).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      source: item.source,
      status: item.status,
      description: item.description,
      lastUpdated: item.last_updated,
      tags: item.tags || [],
    }));
  } catch (error) {
    console.error("Error in fetchKnowledgeBase:", error);
    return [];
  }
}

export async function fetchConversations() {
  try {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log("Error getting user session", sessionError);
      return;
    }

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        bot_id,
        customer_email,
        subject,
        status,
        started_at,
        last_message_at,
        total_messages,
        tags,
        sentiment,
        messages:messages(*),
        bots!inner(created_by)
      `
      )
      .eq("bots.created_by", session?.session?.user?.id)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }

    console.log("conversations", conversations);

    return (conversations || []).map((conv) => ({
      id: conv.id,
      botId: conv.bot_id,
      customerEmail: conv.customer_email,
      subject: conv.subject,
      status: conv.status,
      startedAt: conv.started_at,
      lastMessageAt: conv.last_message_at,
      totalMessages: conv.total_messages,
      tags: conv.tags || [],
      sentiment: conv.sentiment,
      messages: (conv.messages || []).map((msg) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    }));
  } catch (error) {
    console.error("Error in fetchConversations:", error);
    return [];
  }
}
