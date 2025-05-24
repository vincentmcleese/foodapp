import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

// Schema for updating a health principle
const updatePrincipleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
});

// GET /api/health/principles/[id] - Get a specific health principle
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("health_principle")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching health principle ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch health principle" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in health principle GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/health/principles/[id] - Update a health principle
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate the request body
    const validationResult = updatePrincipleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update the principle
    const { data, error } = await supabaseAdmin
      .from("health_principle")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating health principle ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to update health principle" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in health principle PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/health/principles/[id] - Delete a health principle
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("health_principle")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting health principle ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to delete health principle" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in health principle DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
