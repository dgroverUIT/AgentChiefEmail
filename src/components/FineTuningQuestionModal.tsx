import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { FineTuningQuestion, Bot } from '../types';

interface FineTuningQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: Omit<FineTuningQuestion, 'id' | 'createdAt' | 'successRate'>) => void;
  editQuestion?: FineTuningQuestion;
  bots: Bot[];
}

export default function FineTuningQuestionModal({
  isOpen,
  onClose,
  onSubmit,
  editQuestion,
  bots
}: FineTuningQuestionModalProps) {
  const [formData, setFormData] = useState<Omit<FineTuningQuestion, 'id' | 'createdAt' | 'successRate'>>({
    question: '',
    expectedAnswer: '',
    category: '',
    difficulty: 'medium',
    tags: [],
    botIds: [],
    isActive: true,
    lastUsed: null,
  });

  const [newTag, setNewTag] = useState('');

  // Reset form when modal opens/closes or editQuestion changes
  useEffect(() => {
    if (isOpen) {
      if (editQuestion) {
        setFormData({
          question: editQuestion.question,
          expectedAnswer: editQuestion.expectedAnswer,
          category: editQuestion.category,
          difficulty: editQuestion.difficulty,
          tags: editQuestion.tags || [],
          botIds: editQuestion.botIds || [],
          isActive: editQuestion.isActive,
          lastUsed: editQuestion.lastUsed,
        });
      } else {
        // Reset to initial state for new question
        setFormData({
          question: '',
          expectedAnswer: '',
          category: '',
          difficulty: 'medium',
          tags: [],
          botIds: [],
          isActive: true,
          lastUsed: null,
        });
      }
      setNewTag('');
    }
  }, [isOpen, editQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    onSubmit(formData);
    onClose(); // Close the modal after submission
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {editQuestion ? 'Edit Fine-Tuning Question' : 'Add Fine-Tuning Question'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Enter the training question..."
                required
              />
            </div>

            <div>
              <label htmlFor="expectedAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Answer
              </label>
              <textarea
                id="expectedAnswer"
                value={formData.expectedAnswer}
                onChange={(e) => setFormData({ ...formData, expectedAnswer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Enter the expected answer..."
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Product Knowledge, Support, Sales"
                required
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as FineTuningQuestion['difficulty'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associated Bots
              </label>
              <div className="space-y-2">
                {bots.map(bot => (
                  <label key={bot.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.botIds.includes(bot.id)}
                      onChange={(e) => {
                        const newBotIds = e.target.checked
                          ? [...formData.botIds, bot.id]
                          : formData.botIds.filter(id => id !== bot.id);
                        setFormData({ ...formData, botIds: newBotIds });
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">{bot.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 flex-wrap mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 inline-flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">Question is active</span>
              </label>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {editQuestion ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}