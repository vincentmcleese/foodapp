import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "✅ Defined"
      : "❌ Missing",
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "✅ Defined"
      : "❌ Missing",
  });
}
