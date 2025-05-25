import { NextResponse } from "next/server";
import { supabaseAdmin, checkSupabaseConnection } from "@/lib/supabase";

export async function GET() {
  try {
    // Test direct network connectivity to Supabase URL
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://placeholder-for-dev.supabase.co";
    let urlTestResult = "Not tested";

    try {
      const response = await fetch(supabaseUrl);
      urlTestResult = `Status: ${response.status}, OK: ${response.ok}`;
    } catch (error: any) {
      urlTestResult = `Error: ${error?.message || "Unknown error"}`;
    }

    // Try a simple query
    let queryResult;
    try {
      const startTime = Date.now();
      const { data, error } = await supabaseAdmin.from("meal").select("count");
      const endTime = Date.now();

      queryResult = {
        success: !error,
        error: error ? error.message : null,
        data: data,
        timeMs: endTime - startTime,
      };
    } catch (queryError: any) {
      queryResult = {
        success: false,
        error: queryError?.message || "Unknown error",
        stack: queryError?.stack || "No stack trace available",
      };
    }

    // Use the connection check helper
    const connectionCheck = await checkSupabaseConnection();

    // Return all the test results
    return NextResponse.json({
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 15) + "..."
          : "Not set",
      },
      urlTest: urlTestResult,
      queryTest: queryResult,
      connectionCheck,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Unknown error",
        stack: error?.stack || "No stack trace available",
      },
      { status: 500 }
    );
  }
}
