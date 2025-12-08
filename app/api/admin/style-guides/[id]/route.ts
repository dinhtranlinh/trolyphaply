import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/admin/style-guides/[id] - Get a single style guide
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

    // Fetch style guide
    const { data: styleGuide, error: sgError } = await supabase
      .from('style_guides')
      .select('*')
      .eq('id', id)
      .single();

    if (sgError || !styleGuide) {
      return NextResponse.json(
        { success: false, error: 'Style guide not found' },
        { status: 404 }
      );
    }

    // Fetch examples
    const { data: examples, error: exError } = await supabase
      .from('style_guide_examples')
      .select('*')
      .eq('style_guide_id', id)
      .order('created_at', { ascending: true });

    if (exError) {
      throw exError;
    }

    return NextResponse.json({
      success: true,
      data: { ...styleGuide, examples: examples || [] },
    });
  } catch (error) {
    console.error('Error fetching style guide:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch style guide',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/style-guides/[id] - Update a style guide
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();
    const { name, description, characteristics, tone, language, isDefault } = body;

    // Check if style guide exists
    const { data: existing, error: checkError } = await supabase
      .from('style_guides')
      .select('id, is_default')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Style guide not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset all other defaults
    if (isDefault && !existing.is_default) {
      await supabase
        .from('style_guides')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    // Build update object
    const updateData: any = { updated_at: new Date().toISOString() };
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (characteristics) updateData.characteristics = characteristics;
    if (tone) updateData.tone = tone;
    if (language) updateData.language = language;
    if (isDefault !== undefined) updateData.is_default = isDefault;

    // Update style guide
    const { data: updated, error: updateError } = await supabase
      .from('style_guides')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Fetch examples
    const { data: examples } = await supabase
      .from('style_guide_examples')
      .select('*')
      .eq('style_guide_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      success: true,
      data: { ...updated, examples: examples || [] },
      message: 'Style guide updated successfully',
    });
  } catch (error) {
    console.error('Error updating style guide:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update style guide',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/style-guides/[id] - Delete a style guide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

    // Check if style guide exists and is default
    const { data: existing, error: checkError } = await supabase
      .from('style_guides')
      .select('id, is_default')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Style guide not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the default style guide unless it's the only one
    if (existing.is_default) {
      const { count } = await supabase
        .from('style_guides')
        .select('*', { count: 'exact', head: true });

      if (count && count > 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot delete the default style guide. Please set another style guide as default first.',
          },
          { status: 400 }
        );
      }
    }

    // Delete style guide (examples will be cascade deleted by database)
    const { error: deleteError } = await supabase
      .from('style_guides')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Style guide deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting style guide:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete style guide',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
