import { createClient } from "@supabase/supabase-js";

// We use the service role key here which should only be used in server components
// and API routes, never in client components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug logs removed for cleaner console output

// In development, provide graceful fallback if environment variables are missing
if (!supabaseUrl || !supabaseServiceKey) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️ Missing Supabase environment variables in development mode. Using fallback values."
    );
  } else {
    throw new Error("Missing Supabase environment variables");
  }
}

// Create a Supabase client with the service role key
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder-for-dev.supabase.co",
  supabaseServiceKey || "placeholder-service-key-for-dev",
  {
    auth: {
      persistSession: false,
    },
    // Add global error handler with enhanced debugging
    global: {
      fetch: (...args) => {
        // Debug logs removed for cleaner console output

        return fetch(...args).catch((err) => {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "⚠️ Supabase fetch error in development mode:",
              err.message,
              err.stack
            );

            // Log network-related errors with more context
            if (err.message.includes("fetch failed")) {
              console.error("⚠️ Network error details:", {
                url: args[0],
                errorName: err.name,
                errorMessage: err.message,
                errorStack: err.stack,
                errorCause: err.cause,
              });
            }
          }
          throw err;
        });
      },
    },
    // Add a default timeout
    db: {
      schema: "public",
    },
    realtime: {
      timeout: 30000,
    },
  }
);

// Helper function to check Supabase connection
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from("health_check")
      .select("count")
      .single();
    if (error) throw error;
    return { connected: true, error: null };
  } catch (error) {
    console.error("Supabase connection check failed:", error);
    return { connected: false, error };
  }
}
