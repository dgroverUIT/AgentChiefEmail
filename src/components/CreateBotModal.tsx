import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { Bot, EmailTemplate } from "../types";

interface BotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (botData: {
    name: string;
    emailAddress: string;
    description: string;
    responseTime: string;
    forwardTemplateId: string;
    forwardEmailAddress: string;
    includeCustomerInForward: boolean;
  }) => void;
  editBot?: Bot;
  templates: EmailTemplate[];
  error?: string | null;
  isLoading?: boolean;
}

const initialFormData = {
  name: "",
  emailAddress: "",
  description: "",
  responseTime: "1",
  forwardTemplateId: "",
  forwardEmailAddress: "",
  includeCustomerInForward: false,
};

export default function BotModal({
  isOpen,
  onClose,
  onSubmit,
  editBot,
  templates,
  error,
  isLoading = false,
}: BotModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [showSuccess, setShowSuccess] = useState(false);

  console.log("error checking", error);

  // Reset form when modal opens/closes or editBot changes
  useEffect(() => {
    if (isOpen) {
      if (editBot) {
        setFormData({
          name: editBot.name,
          emailAddress: editBot.email_address,
          description: editBot.description || "",
          responseTime: "1", // Default value since it's not stored
          forwardTemplateId: editBot.forward_template_id || "",
          forwardEmailAddress: editBot.forward_email_address || "",
          includeCustomerInForward:
            editBot.include_customer_in_forward || false,
        });
      } else {
        setFormData(initialFormData);
      }
      setShowSuccess(false);
    }
  }, [isOpen, editBot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("formData before", formData);
    await onSubmit(formData);
    if (!error && error !== null) {
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData(initialFormData); // Reset form after successful submission
      }, 1500);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData(initialFormData); // Reset form on close
  };

  if (!isOpen) return null;

  const handoffTemplates = templates.filter(
    (t) => t.category === "handoff" && t.isActive
  );

  console.log("forwardTemplateId", formData.forwardTemplateId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col relative">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {editBot ? "Edit Bot" : "Create New Bot"}
          </h2>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="px-6 py-3 bg-green-50 border-b border-green-100">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-600">
                Bot {editBot ? "updated" : "created"} successfully!
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bot Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Customer Support Assistant"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.emailAddress}
                onChange={(e) =>
                  setFormData({ ...formData, emailAddress: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="bot@yourdomain.com"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Must be unique across all bots
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Describe what this bot will do..."
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="responseTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Target Response Time (minutes)
              </label>
              <select
                id="responseTime"
                value={formData.responseTime}
                onChange={(e) =>
                  setFormData({ ...formData, responseTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                <option value="1">1 minute</option>
                <option value="2">2 minutes</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
              </select>
            </div>

            <div className="space-y-4 rounded-md bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">Forward Settings</h3>

              {editBot && (
                <div className="bg-white rounded-md p-3 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forward Email Display
                  </label>
                  <input
                    type="text"
                    value={
                      editBot.forwardEmailDisplay || "Forward your emails here"
                    }
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="forwardEmailAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Forward Email Address
                </label>
                <input
                  type="email"
                  id="forwardEmailAddress"
                  value={formData.forwardEmailAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      forwardEmailAddress: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="human@yourdomain.com"
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email address to forward conversations to when they need human
                  attention
                </p>
              </div>

              <div>
                <label
                  htmlFor="forwardTemplate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Forward Template
                </label>
                <select
                  id="forwardTemplate"
                  value={formData.forwardTemplateId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      forwardTemplateId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  <option value="">Select a template</option>
                  {handoffTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {handoffTemplates.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    No handoff templates available. Create a template with the
                    "Human Handoff" category.
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeCustomerInForward}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        includeCustomerInForward: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Include customer in forward email
                  </span>
                </label>
                <p className="mt-1 text-sm text-gray-500 ml-6">
                  When enabled, the customer will be CC'd on the forwarded email
                </p>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editBot ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>{editBot ? "Save Changes" : "Create Bot"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
