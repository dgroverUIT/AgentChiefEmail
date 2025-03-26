import { supabase } from "../lib/supabase";
import type { KnowledgeBase } from "../types";

export async function createKnowledgeBaseItem(
  itemData: Omit<KnowledgeBase, "id" | "status" | "lastUpdated">
) {
  console.log("itemdata", itemData);
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      throw new Error("Please sign in to create a knowledge base item");
    }

    // Validate the URL if it's a website source
    if (itemData.type === "website") {
      try {
        // Add protocol if missing
        let urlToTest = itemData.source;
        if (
          !urlToTest.startsWith("http://") &&
          !urlToTest.startsWith("https://")
        ) {
          urlToTest = "https://" + urlToTest;
        }
        new URL(urlToTest);
        // Update the source with the potentially modified URL
        itemData.source = urlToTest;
      } catch (e) {
        throw new Error(
          "Invalid URL format. Please include the full URL (e.g., https://example.com)"
        );
      }
    }

    // First check if this source already exists
    const { data: existingItem, error: checkError } = await supabase
      .from("knowledge_base")
      .select("id")
      .eq("source", itemData.source)
      .maybeSingle();

    console.log("itemData.source", itemData.source);

    if (checkError) {
      console.error("Error checking for existing source:", checkError);
      throw new Error("Failed to check for existing source");
    }

    if (existingItem) {
      throw new Error(
        "This source has already been added to the knowledge base"
      );
    }

    // Create the knowledge base item
    const { data: item, error } = await supabase
      .from("knowledge_base")
      .insert({
        name: itemData.name,
        type: itemData.type,
        source: itemData.source,
        description: itemData.description || "",
        tags: itemData.tags || [],
        created_by: session.user.id,
        status: "processing",
        last_updated: new Date().toISOString(),
        organization_id: null, // Make organization_id explicitly null
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error(
          "This source has already been added to the knowledge base"
        );
      }
      console.error("Database error:", error);
      throw new Error("Failed to create knowledge base item");
    }

    if (!item) {
      throw new Error(
        "Failed to create knowledge base item - no data returned"
      );
    }

    return { success: true, item };
  } catch (error) {
    console.error("Error creating knowledge base item:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create knowledge base item",
    };
  }
}

export async function updateKnowledgeBaseItem(
  id: string,
  itemData: Partial<KnowledgeBase>
) {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      throw new Error("Please sign in to update a knowledge base item");
    }

    // Validate URL if being updated and is a website
    if (itemData.type === "website" && itemData.source) {
      try {
        // Add protocol if missing
        let urlToTest = itemData.source;
        if (
          !urlToTest.startsWith("http://") &&
          !urlToTest.startsWith("https://")
        ) {
          urlToTest = "https://" + urlToTest;
        }
        new URL(urlToTest);
        // Update the source with the potentially modified URL
        itemData.source = urlToTest;
      } catch (e) {
        throw new Error(
          "Invalid URL format. Please include the full URL (e.g., https://example.com)"
        );
      }
    }

    // Check for duplicate source if updating source
    if (itemData.source) {
      const { data: existingItem, error: checkError } = await supabase
        .from("knowledge_base")
        .select("id")
        .eq("source", itemData.source)
        .neq("id", id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking for existing source:", checkError);
        throw new Error("Failed to check for existing source");
      }

      if (existingItem) {
        throw new Error(
          "This source has already been added to the knowledge base"
        );
      }
    }

    const { data: item, error } = await supabase
      .from("knowledge_base")
      .update({
        name: itemData.name,
        type: itemData.type,
        source: itemData.source,
        description: itemData.description,
        tags: itemData.tags,
        last_updated: new Date().toISOString(),
        status: itemData.type === "website" ? "processing" : "ready", // Reset processing for website updates
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(
          "This source has already been added to the knowledge base"
        );
      }
      console.error("Database error:", error);
      throw new Error("Failed to update knowledge base item");
    }

    if (!item) {
      throw new Error("Knowledge base item not found");
    }

    return { success: true, item };
  } catch (error) {
    console.error("Error updating knowledge base item:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update knowledge base item",
    };
  }
}

export async function deleteKnowledgeBaseItem(id: string) {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      throw new Error("Please sign in to delete a knowledge base item");
    }

    const { error } = await supabase
      .from("knowledge_base")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to delete knowledge base item");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting knowledge base item:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete knowledge base item",
    };
  }
}
