import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { read, utils } from 'xlsx';
import { FineTuningQuestion } from '../types';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: Omit<FineTuningQuestion, 'id' | 'createdAt' | 'successRate'>[]) => void;
}

export default function ImportQuestionsModal({ isOpen, onClose, onImport }: ImportQuestionsModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setFile(file);

      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      // Validate the data structure
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('No data found in the Excel file');
      }

      // Check required columns
      const requiredColumns = ['question', 'expected_answer', 'category', 'difficulty'];
      const firstRow = jsonData[0] as any;
      const missingColumns = requiredColumns.filter(col => 
        !Object.keys(firstRow).some(key => key.toLowerCase() === col.toLowerCase())
      );

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      setPreview(jsonData.slice(0, 5)); // Show first 5 rows as preview
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read Excel file');
      setFile(null);
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setError(null);

      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      // Transform the data to match our FineTuningQuestion type
      const questions = jsonData.map((row: any) => ({
        question: row.question || row.Question,
        expectedAnswer: row.expected_answer || row.Expected_Answer || row.ExpectedAnswer,
        category: row.category || row.Category,
        difficulty: (row.difficulty || row.Difficulty || 'medium').toLowerCase(),
        tags: (row.tags || row.Tags || '').toString().split(',').map((t: string) => t.trim()).filter(Boolean),
        botIds: (row.bot_ids || row.Bot_Ids || '').toString().split(',').map((id: string) => id.trim()).filter(Boolean),
        isActive: true,
        lastUsed: null
      }));

      onImport(questions);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import questions');
    }
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
          <h2 className="text-xl font-semibold text-gray-900">Import Questions from Excel</h2>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excel File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 text-sm text-gray-600">
                        {file ? file.name : 'Drop an Excel file here, or click to select'}
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Excel files (.xlsx, .xls)
                  </p>
                </div>
              </div>
            </div>

            {preview.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (First 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map((key) => (
                          <th
                            key={key}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value: any, j) => (
                            <td key={j} className="px-3 py-2 text-sm text-gray-500">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Required Columns</h4>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>question - The question text</li>
                <li>expected_answer - The expected answer</li>
                <li>category - Question category</li>
                <li>difficulty - easy, medium, or hard (defaults to medium)</li>
                <li>tags - Optional, comma-separated list</li>
                <li>bot_ids - Optional, comma-separated list of bot IDs</li>
              </ul>
            </div>
          </div>
        </div>

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
              onClick={handleImport}
              disabled={!file}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}