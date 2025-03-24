import { supabase } from '../lib/supabase';
import type { Bot } from '../types';

export async function createBot(botData: Omit<Bot, 'id' | 'status' | 'createdAt' | 'lastActive' | 'totalEmails' | 'responseRate'>) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('Please sign in to create a bot');
    }

    // First check if a bot with this email already exists
    const { data: existingBot, error: checkError } = await supabase
      .from('bots')
      .select('id, name')
      .eq('email_address', botData.emailAddress)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing bot:', checkError);
      throw new Error('Failed to check for existing bot');
    }

    if (existingBot) {
      throw new Error(`A bot with the email address "${botData.emailAddress}" already exists`);
    }

    // Create bot with minimal required fields
    const { data: bot, error } = await supabase
      .from('bots')
      .insert({
        name: botData.name,
        email_address: botData.emailAddress,
        description: botData.description || '',
        created_by: session.user.id,
        status: 'active',
        total_emails: 0,
        response_rate: 100.0,
        openai_status: 'pending',
        openai_model: 'gpt-4-turbo-preview',
        openai_config: {},
        forward_email_display: 'Forward your emails here',
        forward_template_id: botData.forwardTemplateId || null,
        forward_email_address: botData.forwardEmailAddress || null,
        include_customer_in_forward: botData.includeCustomerInForward || false
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(error.message || 'Failed to create bot');
    }

    if (!bot) {
      throw new Error('Failed to create bot - no data returned');
    }

    return { 
      success: true, 
      bot: {
        id: bot.id,
        name: bot.name,
        status: bot.status,
        emailAddress: bot.email_address,
        description: bot.description,
        createdAt: bot.created_at,
        lastActive: bot.last_active,
        totalEmails: bot.total_emails,
        responseRate: bot.response_rate,
        forwardTemplateId: bot.forward_template_id || null,
        forwardEmailAddress: bot.forward_email_address || null,
        includeCustomerInForward: bot.include_customer_in_forward || false,
        forwardEmailDisplay: bot.forward_email_display || 'Forward your emails here'
      }
    };
  } catch (error) {
    console.error('Error creating bot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create bot',
    };
  }
}

export async function updateBot(id: string, botData: Partial<Bot>) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('Please sign in to update a bot');
    }

    // If email is being updated, check for duplicates
    if (botData.emailAddress) {
      const { data: existingBot, error: checkError } = await supabase
        .from('bots')
        .select('id, name')
        .eq('email_address', botData.emailAddress)
        .neq('id', id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing bot:', checkError);
        throw new Error('Failed to check for existing bot');
      }

      if (existingBot) {
        throw new Error(`A bot with the email address "${botData.emailAddress}" already exists`);
      }
    }

    // Only include fields that are actually being updated
    const updateData: Record<string, any> = {};
    
    if (botData.name !== undefined) updateData.name = botData.name;
    if (botData.emailAddress !== undefined) updateData.email_address = botData.emailAddress;
    if (botData.description !== undefined) updateData.description = botData.description;
    if (botData.forwardTemplateId !== undefined) updateData.forward_template_id = botData.forwardTemplateId;
    if (botData.forwardEmailAddress !== undefined) updateData.forward_email_address = botData.forwardEmailAddress;
    if (botData.includeCustomerInForward !== undefined) updateData.include_customer_in_forward = botData.includeCustomerInForward;

    const { data: bot, error } = await supabase
      .from('bots')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(error.message || 'Failed to update bot');
    }

    if (!bot) {
      throw new Error('Bot not found');
    }

    return { 
      success: true, 
      bot: {
        id: bot.id,
        name: bot.name,
        status: bot.status,
        emailAddress: bot.email_address,
        description: bot.description,
        createdAt: bot.created_at,
        lastActive: bot.last_active,
        totalEmails: bot.total_emails,
        responseRate: bot.response_rate,
        forwardTemplateId: bot.forward_template_id || null,
        forwardEmailAddress: bot.forward_email_address || null,
        includeCustomerInForward: bot.include_customer_in_forward || false,
        forwardEmailDisplay: bot.forward_email_display || 'Forward your emails here'
      }
    };
  } catch (error) {
    console.error('Error updating bot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update bot',
    };
  }
}

export async function deleteBot(id: string) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('Please sign in to delete a bot');
    }

    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      throw new Error(error.message || 'Failed to delete bot');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting bot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete bot',
    };
  }
}