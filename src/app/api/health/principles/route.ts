import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

// Schema for creating a health principle
const createPrincipleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

// GET /api/health/principles - Get all health principles
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("health_principle")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching health principles:", error);
      return NextResponse.json(
        { error: "Failed to fetch health principles" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in health principles GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/health/principles - Create a new health principle
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = createPrincipleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description, enabled } = validationResult.data;

    // Insert the new principle
    const { data, error } = await supabaseAdmin
      .from("health_principle")
      .insert({ name, description, enabled })
      .select()
      .single();

    if (error) {
      console.error("Error creating health principle:", error);
      return NextResponse.json(
        { error: "Failed to create health principle" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in health principles POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
