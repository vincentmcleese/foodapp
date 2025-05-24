import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Check if plan_entry table exists by querying for its schema
    const { data: tablesData, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tablesError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to retrieve database tables",
          error: tablesError,
        },
        { status: 500 }
      );
    }

    // Get list of tables
    const tables = (tablesData || []).map((t) => t.table_name);

    // Check if our required tables exist
    const requiredTables = [
      "meal",
      "ingredient",
      "fridge_item",
      "meal_ingredient",
      "plan_entry",
    ];
    const missingTables = requiredTables.filter(
      (table) => !tables.includes(table)
    );

    return NextResponse.json({
      status: "ok",
      database: {
        connected: true,
        tables: tables,
        missing_tables: missingTables,
        all_required_tables_exist: missingTables.length === 0,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
