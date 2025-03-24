import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Bot } from '../types';

interface BulkEditBotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (botIds: string[]) => void;
  bots: Bot[];
  selectedBotIds?: string[];
}

export default function BulkEditBotsModal({
  isOpen,
  onClose,
  onSubmit,
  bots,
  selectedBotIds = []
}: BulkEditBotsModalProps) {
  const [selectedBots, setSelectedBots] = useState<Set<string>>(new Set(selectedBotIds));

  useEffect(() => {
    if (isOpen) {
      setSelectedBots(new Set(selectedBotIds));
    }
  }, [isOpen, selectedBotIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(Array.from(selectedBots));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            Associate Questions with Bots
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Select the bots you want to associate with the selected questions.
              This will update the bot associations for all selected questions.
            </p>
            
            <div className="space-y-2">
              {bots.map(bot => (
                <label key={bot.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedBots.has(bot.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedBots);
                      if (e.target.checked) {
                        newSelected.add(bot.id);
                      } else {
                        newSelected.delete(bot.id);
                      }
                      setSelectedBots(newSelected);
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">{bot.name}</span>
                </label>
              ))}
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
              Update Associations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}