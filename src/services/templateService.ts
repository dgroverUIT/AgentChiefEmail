import { supabase } from '../lib/supabase';
import type { EmailTemplate } from '../types';

export async function createTemplate(templateData: Omit<EmailTemplate, 'id' | 'lastModified' | 'createdBy'>) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('Please sign in to create a template');
    }

    const { data: template, error } = await supabase
      .from('templates')
      .insert({
        name: templateData.name,
        category: templateData.category,
        subject: templateData.subject,
        content: templateData.content,
        variables: templateData.variables || [],
        language: templateData.language || 'en',
        is_active: templateData.isActive ?? true,
        tags: templateData.tags || [],
        created_by: session.user.id,
        organization_id: null // Make organization_id explicitly null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create template');
    }

    if (!template) {
      throw new Error('Failed to create template - no data returned');
    }

    return { success: true, template };
  } catch (error) {
    console.error('Error creating template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create template',
    };
  }
}

export async function updateTemplate(id: string, templateData: Partial<EmailTemplate>) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('Please sign in to update a template');
    }

    const { data: template, error } = await supabase
      .from('templates')
      .update({
        name: templateData.name,
        category: templateData.category,
        subject: templateData.subject,
        content: templateData.content,
        variables: templateData.variables,
        language: templateData.language,
        is_active: templateData.isActive,
        tags: templateData.tags,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update template');
    }

    if (!template) {
      throw new Error('Template not found');
    }

    return { success: true, template };
  } catch (error) {
    console.error('Error updating template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update template',
    };
  }
}

export async function deleteTemplate(id: string) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('Please sign in to delete a template');
    }

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete template');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete template',
    };
  }
}