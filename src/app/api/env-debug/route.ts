import { NextResponse } from "next/server";

export async function GET() {
  // Get the first 10 characters of the service key to avoid exposing the full key
  const serviceKeyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + "..."
    : "not set";

  // Get the Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "not set";

  return NextResponse.json({
    env: process.env.NODE_ENV,
    supabaseUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl,
    serviceKeyPrefix,
    timestamp: new Date().toISOString(),
  });
}
