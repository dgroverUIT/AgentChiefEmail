/**
 * Custom hook for managing application settings
 * Provides validation and persistence of settings
 */

import { useEffect, useState } from "react";
import { Settings, settingsSchema } from "../types";
import { supabase } from "../lib/supabase";

/**
 * Default settings configuration
 */
const defaultSettings: Settings = {
  general: {
    companyName: "AgentChief EmailBots",
    defaultLanguage: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
  },
  email: {
    defaultFromName: "AI Assistant",
    defaultFromEmail: "ai@example.com",
    replyToEmail: "support@example.com",
    emailFooter: "Powered by AgentChief EmailBots",
    maxAttachmentSize: 10,
  },
  notifications: {
    emailNotifications: true,
    slackWebhook: "",
    slackChannel: "",
    notifyOnNewConversation: true,
    notifyOnHandoff: true,
    notifyOnError: true,
  },
  security: {
    twoFactorEnabled: false,
    allowedDomains: [],
    ipWhitelist: [],
    sessionTimeout: 30,
  },
  api: {
    apiKey: crypto.randomUUID(),
    webhookUrl: "",
    webhookSecret: "",
  },
};

/**
 * Hook for managing settings state and validation
 */
export function useSettings() {
  // Initialize with defaultSettings instead of undefined
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [errors, setErrors] = useState<string[]>([]);
  const [settingsIsLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
        error: userError,
      } = await supabase.auth.getSession();

      if (userError) {
        console.error("Error getting user session:", userError);
        setIsLoading(false);
        return;
      }

      if (!session?.user?.id) {
        console.warn("No user session found.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        setIsLoading(false);
        return;
      }

      // Merge fetched data with defaults
      const mergedSettings: Settings = {
        general: {
          companyName:
            data?.company_name || defaultSettings.general.companyName,
          defaultLanguage:
            data?.default_language || defaultSettings.general.defaultLanguage,
          timezone: data?.timezone || defaultSettings.general.timezone,
          dateFormat: data?.date_format || defaultSettings.general.dateFormat,
        },
        email: {
          defaultFromName:
            data?.default_from_name || defaultSettings.email.defaultFromName,
          defaultFromEmail:
            data?.default_from_email || defaultSettings.email.defaultFromEmail,
          replyToEmail:
            data?.reply_to_email || defaultSettings.email.replyToEmail,
          emailFooter: data?.email_footer || defaultSettings.email.emailFooter,
          maxAttachmentSize:
            data?.max_attachment_size ||
            defaultSettings.email.maxAttachmentSize,
        },
        notifications: {
          emailNotifications:
            data?.email_notifications ??
            defaultSettings.notifications.emailNotifications,
          slackWebhook:
            data?.slackWebhook || defaultSettings.notifications.slackWebhook,
          slackChannel:
            data?.slackChannel || defaultSettings.notifications.slackChannel,
          notifyOnNewConversation:
            data?.notifyOnNewConversation ??
            defaultSettings.notifications.notifyOnNewConversation,
          notifyOnHandoff:
            data?.notifyOnHandoff ??
            defaultSettings.notifications.notifyOnHandoff,
          notifyOnError:
            data?.notifyOnError ?? defaultSettings.notifications.notifyOnError,
        },
        security: {
          twoFactorEnabled:
            data?.twoFactorEnabled ?? defaultSettings.security.twoFactorEnabled,
          allowedDomains: data?.allowedDomains
            ? data.allowedDomains.split(",")
            : defaultSettings.security.allowedDomains,
          ipWhitelist: data?.ipWhitelist
            ? data.ipWhitelist.split(",")
            : defaultSettings.security.ipWhitelist,
          sessionTimeout:
            data?.sessionTimeout || defaultSettings.security.sessionTimeout,
        },
        api: {
          apiKey: data?.apiKey || defaultSettings.api.apiKey,
          webhookUrl: data?.webhookUrl || defaultSettings.api.webhookUrl,
          webhookSecret:
            data?.webhookSecret || defaultSettings.api.webhookSecret,
        },
      };

      setSettings(mergedSettings);
    } catch (error) {
      console.error("Error in fetchSettings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = (newSettings: Settings) => {
    // try {
    //   const validated = settingsSchema.parse(newSettings);
    //   setSettings(validated);
    //   setErrors([]);
    // } catch (error: any) {
    //   if (error.errors) {
    //     setErrors(error.errors.map((e: any) => e.message));
    //   }
    // }
  };

  const saveSettings = async () => {
    try {
      // Sanitize settings before validation
      const sanitizedSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          slackWebhook: settings.notifications.slackWebhook || undefined,
        },
        api: {
          ...settings.api,
          webhookUrl: settings.api.webhookUrl || undefined,
        },
      };

      // Validate the sanitized settings
      const validated = settingsSchema.parse(sanitizedSettings);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      // Prepare the data for Supabase (convert nested objects to flat columns)
      const settingsToSave = {
        user_id: session.user.id,
        company_name: validated.general.companyName,
        default_language: validated.general.defaultLanguage,
        timezone: validated.general.timezone,
        date_format: validated.general.dateFormat,
        default_from_name: validated.email.defaultFromName,
        default_from_email: validated.email.defaultFromEmail,
        reply_to_email: validated.email.replyToEmail,
        email_footer: validated.email.emailFooter,
        max_attachment_size: validated.email.maxAttachmentSize,
        email_notifications: validated.notifications.emailNotifications,
        slackWebhook: validated.notifications.slackWebhook || null, // Handle null
        slackChannel: validated.notifications.slackChannel || null, // Handle null
        notifyOnNewConversation:
          validated.notifications.notifyOnNewConversation,
        notifyOnHandoff: validated.notifications.notifyOnHandoff,
        notifyOnError: validated.notifications.notifyOnError,
        twoFactorEnabled: validated.security.twoFactorEnabled,
        allowedDomains:
          validated.security.allowedDomains.length > 0
            ? `{${validated.security.allowedDomains.join(",")}}` // Convert to array literal
            : null, // Use null for empty arrays
        ipWhitelist:
          validated.security.ipWhitelist.length > 0
            ? `{${validated.security.ipWhitelist.join(",")}}` // Convert to array literal
            : null, // Use null for empty arrays
        sessionTimeout: validated.security.sessionTimeout,
        apiKey: validated.api.apiKey,
        webhookUrl: validated.api.webhookUrl || null, // Handle null
        webhookSecret: validated.api.webhookSecret || null, // Handle null
      };

      // Upsert the settings
      const { error } = await supabase
        .from("settings")
        .upsert(settingsToSave, { onConflict: "user_id" });

      if (error) {
        throw error;
      } else {
        console.log("settings updated successfully");

        return true;
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      if (error.errors) {
        setErrors(error.errors.map((e: any) => e.message));
      } else if (error.message) {
        setErrors([error.message]);
      }
      return false;
    }
  };

  return {
    settings,
    updateSettings,
    setSettings,
    saveSettings,
    errors,
    settingsIsLoading,
  };
}
