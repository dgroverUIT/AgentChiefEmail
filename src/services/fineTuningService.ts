import { supabase } from '../lib/supabase';
import type { FineTuningQuestion } from '../types';

export async function createFineTuningQuestion(questionData: Omit<FineTuningQuestion, 'id' | 'createdAt' | 'successRate'>) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('Please sign in to create a fine-tuning question');
    }

    // Create the fine-tuning question with snake_case column names
    const { data: question, error } = await supabase
      .from('fine_tuning_questions')
      .insert({
        question: questionData.question,
        expected_answer: questionData.expectedAnswer,
        category: questionData.category,
        difficulty: questionData.difficulty,
        tags: questionData.tags || [],
        is_active: questionData.isActive ?? true,
        created_by: session.user.id,
        organization_id: null,
        success_rate: null,
        last_used: null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create fine-tuning question');
    }

    if (!question) {
      throw new Error('Failed to create fine-tuning question - no data returned');
    }

    // If we have bot associations, create them
    if (questionData.botIds?.length > 0) {
      const { error: associationError } = await supabase
        .from('bot_fine_tuning_questions')
        .insert(
          questionData.botIds.map(botId => ({
            bot_id: botId,
            question_id: question.id,
            organization_id: null
          }))
        );

      if (associationError) {
        console.error('Error creating bot associations:', associationError);
        // Don't throw, just log the error since the main question was created
      }
    }

    // Get the bot associations
    const { data: associations } = await supabase
      .from('bot_fine_tuning_questions')
      .select('bot_id')
      .eq('question_id', question.id);

    // Transform the response to match our frontend types
    const transformedQuestion: FineTuningQuestion = {
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
      botIds: associations?.map(a => a.bot_id) || []
    };

    return { success: true, question: transformedQuestion };
  } catch (error) {
    console.error('Error creating fine-tuning question:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create fine-tuning question',
    };
  }
}

export async function updateFineTuningQuestion(id: string, questionData: Partial<FineTuningQuestion>) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('Please sign in to update a fine-tuning question');
    }

    // Update the question using snake_case column names
    const { data: question, error } = await supabase
      .from('fine_tuning_questions')
      .update({
        question: questionData.question,
        expected_answer: questionData.expectedAnswer,
        category: questionData.category,
        difficulty: questionData.difficulty,
        tags: questionData.tags,
        is_active: questionData.isActive,
        last_used: questionData.lastUsed,
        success_rate: questionData.successRate
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update fine-tuning question');
    }

    if (!question) {
      throw new Error('Fine-tuning question not found');
    }

    // If bot associations are provided, update them
    if (questionData.botIds) {
      // First remove all existing associations
      const { error: deleteError } = await supabase
        .from('bot_fine_tuning_questions')
        .delete()
        .eq('question_id', id);

      if (deleteError) {
        console.error('Error removing bot associations:', deleteError);
      }

      // Then create new associations
      if (questionData.botIds.length > 0) {
        const { error: associationError } = await supabase
          .from('bot_fine_tuning_questions')
          .insert(
            questionData.botIds.map(botId => ({
              bot_id: botId,
              question_id: id,
              organization_id: null
            }))
          );

        if (associationError) {
          console.error('Error creating bot associations:', associationError);
        }
      }
    }

    // Get the updated bot associations
    const { data: associations } = await supabase
      .from('bot_fine_tuning_questions')
      .select('bot_id')
      .eq('question_id', id);

    // Transform the response to match our frontend types
    const transformedQuestion: FineTuningQuestion = {
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
      botIds: associations?.map(a => a.bot_id) || []
    };

    return { success: true, question: transformedQuestion };
  } catch (error) {
    console.error('Error updating fine-tuning question:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update fine-tuning question',
    };
  }
}

export async function deleteFineTuningQuestion(id: string) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('Please sign in to delete a fine-tuning question');
    }

    // First remove all bot associations
    const { error: associationError } = await supabase
      .from('bot_fine_tuning_questions')
      .delete()
      .eq('question_id', id);

    if (associationError) {
      console.error('Error removing bot associations:', associationError);
    }

    // Then delete the question
    const { error } = await supabase
      .from('fine_tuning_questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete fine-tuning question');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting fine-tuning question:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete fine-tuning question',
    };
  }
}