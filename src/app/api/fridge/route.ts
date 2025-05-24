import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all fridge items
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('fridge_item')
      .select(`
        *,
        ingredient:ingredient_id (id, name, usda_fdc_id, nutrition)
      `);
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fridge items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fridge items' },
      { status: 500 }
    );
  }
}

// POST - Add a new fridge item
export async function POST(request: Request) {
  try {
    const fridgeItem = await request.json();
    
    // Validate the input
    if (!fridgeItem.ingredient_id || !fridgeItem.quantity || !fridgeItem.unit) {
      return NextResponse.json(
        { error: 'Required fields: ingredient_id, quantity, unit' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('fridge_item')
      .insert(fridgeItem)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding fridge item:', error);
    return NextResponse.json(
      { error: 'Failed to add fridge item' },
      { status: 500 }
    );
  }
} 