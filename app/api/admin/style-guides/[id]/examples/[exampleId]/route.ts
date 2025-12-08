import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// PATCH /api/admin/style-guides/[id]/examples/[exampleId] - Update example
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; exampleId: string }> }
) {
  try {
    const { id, exampleId } = await params
    const body = await request.json()
    const { before, after } = body

    // Validation
    if (!before?.trim() && !after?.trim()) {
      return NextResponse.json(
        { success: false, error: 'At least one field (before or after) is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify example belongs to this style guide
    const { data: existing, error: checkError } = await supabase
      .from('style_guide_examples')
      .select('id, style_guide_id')
      .eq('id', exampleId)
      .eq('style_guide_id', id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Example not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: any = {}
    if (before?.trim()) updateData.before = before.trim()
    if (after?.trim()) updateData.after = after.trim()

    // Update example
    const { data: updated, error: updateError } = await supabase
      .from('style_guide_examples')
      .update(updateData)
      .eq('id', exampleId)
      .select()
      .single()

    if (updateError) {
      console.error('Update example error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update example' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Example updated successfully'
    })
  } catch (error: any) {
    console.error('PATCH /api/admin/style-guides/[id]/examples/[exampleId] error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/style-guides/[id]/examples/[exampleId] - Delete example
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; exampleId: string }> }
) {
  try {
    const { id, exampleId } = await params
    const supabase = createClient()

    // Verify example belongs to this style guide
    const { data: existing, error: checkError } = await supabase
      .from('style_guide_examples')
      .select('id, style_guide_id')
      .eq('id', exampleId)
      .eq('style_guide_id', id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Example not found' },
        { status: 404 }
      )
    }

    // Delete example
    const { error: deleteError } = await supabase
      .from('style_guide_examples')
      .delete()
      .eq('id', exampleId)

    if (deleteError) {
      console.error('Delete example error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete example' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Example deleted successfully'
    })
  } catch (error: any) {
    console.error('DELETE /api/admin/style-guides/[id]/examples/[exampleId] error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
