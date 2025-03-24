import React, { useState } from 'react';
import { FineTuningQuestion, Bot } from '../types';
import { Search, Filter, Plus, Pencil, Tag, Brain, Trash2, CheckSquare, Square, Users, Upload } from 'lucide-react';
import FineTuningQuestionModal from './FineTuningQuestionModal';
import ImportQuestionsModal from './ImportQuestionsModal';
import BulkEditBotsModal from './BulkEditBotsModal';

interface FineTuningQuestionListProps {
  questions: FineTuningQuestion[];
  bots: Bot[];
  onAddQuestion: (question: Omit<FineTuningQuestion, 'id' | 'createdAt' | 'successRate'>) => void;
  onEditQuestion: (id: string, question: Partial<FineTuningQuestion>) => void;
  onDeleteQuestions?: (ids: string[]) => Promise<void>;
}

export default function FineTuningQuestionList({
  questions,
  bots,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestions
}: FineTuningQuestionListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FineTuningQuestion | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = Array.from(new Set(questions.map(q => q.category)));

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || question.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleEditClick = (question: FineTuningQuestion) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (questionData: Omit<FineTuningQuestion, 'id' | 'createdAt' | 'successRate'>) => {
    try {
      if (editingQuestion) {
        onEditQuestion(editingQuestion.id, questionData);
      } else {
        onAddQuestion(questionData);
      }
      setIsModalOpen(false);
      setEditingQuestion(undefined);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleImportQuestions = async (questions: Omit<FineTuningQuestion, 'id' | 'createdAt' | 'successRate'>[]) => {
    try {
      // Add each question one by one
      for (const question of questions) {
        await onAddQuestion(question);
      }
    } catch (error) {
      console.error('Error importing questions:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleSelectQuestion = (id: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuestions(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!onDeleteQuestions || selectedQuestions.size === 0) return;
    
    try {
      setIsDeleting(true);
      await onDeleteQuestions(Array.from(selectedQuestions));
      setSelectedQuestions(new Set());
    } catch (error) {
      console.error('Error deleting questions:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkEditSubmit = (botIds: string[]) => {
    const selectedIds = Array.from(selectedQuestions);
    selectedIds.forEach(id => {
      onEditQuestion(id, { botIds });
    });
    setSelectedQuestions(new Set());
  };

  // Get common bot IDs among selected questions
  const getCommonBotIds = () => {
    const selectedQuestionsData = questions.filter(q => selectedQuestions.has(q.id));
    if (selectedQuestionsData.length === 0) return [];
    
    const commonBots = selectedQuestionsData.reduce((common, question) => {
      if (common === null) return new Set(question.botIds);
      return new Set([...common].filter(id => question.botIds.includes(id)));
    }, null as Set<string> | null);
    
    return commonBots ? Array.from(commonBots) : [];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Import Excel
          </button>
          <button
            onClick={() => {
              setEditingQuestion(undefined);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Question
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {selectedQuestions.size > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedQuestions.size} {selectedQuestions.size === 1 ? 'question' : 'questions'} selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBulkEditOpen(true)}
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2 text-sm"
              >
                <Users className="h-4 w-4" />
                Edit Bot Associations
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                  <button
                    onClick={handleSelectAll}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {selectedQuestions.size === filteredQuestions.length ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Associated Bots
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr 
                  key={question.id} 
                  className={`hover:bg-gray-50 ${selectedQuestions.has(question.id) ? 'bg-indigo-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectQuestion(question.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      {selectedQuestions.has(question.id) ? (
                        <CheckSquare className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{question.question}</div>
                    <div className="mt-1 text-sm text-gray-500">{question.expectedAnswer.substring(0, 100)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{question.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {question.botIds.map(botId => {
                        const bot = bots.find(b => b.id === botId);
                        return bot ? (
                          <span
                            key={botId}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {bot.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {question.successRate ? `${question.successRate}%` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(question)}
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
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding some fine-tuning questions.
            </p>
          </div>
        )}
      </div>

      <FineTuningQuestionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(undefined);
        }}
        onSubmit={handleModalSubmit}
        editQuestion={editingQuestion}
        bots={bots}
      />

      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportQuestions}
      />

      <BulkEditBotsModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        onSubmit={handleBulkEditSubmit}
        bots={bots}
        selectedBotIds={getCommonBotIds()}
      />
    </div>
  );
}