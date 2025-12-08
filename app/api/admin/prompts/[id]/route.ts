import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/admin/prompts/[id] - Get single prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient()

    const { data: prompt, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: prompt
    })
  } catch (error: any) {
    console.error('GET /api/admin/prompts/[id] error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/prompts/[id] - Update prompt
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, body: promptBody, category, tags, is_public, save_version, version_note } = body

    const supabase = createClient()

    // Get current prompt state
    const { data: currentPrompt, error: fetchError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentPrompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // If save_version is true, create a version before updating
    if (save_version) {
      // Get current max version number
      const { data: maxVersionData } = await supabase
        .from('prompt_versions')
        .select('version')
        .eq('prompt_id', id)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      const nextVersion = (maxVersionData?.version || 0) + 1

      // Create version with current state
      await supabase
        .from('prompt_versions')
        .insert({
          prompt_id: id,
          version: nextVersion,
          title: currentPrompt.title,
          body: currentPrompt.body,
          category: currentPrompt.category,
          tags: currentPrompt.tags,
          is_public: currentPrompt.is_public,
          created_by: version_note || `Version ${nextVersion}`
        })
    }

    // Build update object
    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (promptBody !== undefined) updateData.body = promptBody.trim()
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags
    if (is_public !== undefined) updateData.is_public = is_public
    updateData.updated_at = new Date().toISOString()

    // Update prompt
    const { data: updated, error: updateError } = await supabase
      .from('prompts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update prompt error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update prompt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Prompt updated successfully'
    })
  } catch (error: any) {
    console.error('PATCH /api/admin/prompts/[id] error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/prompts/[id] - Delete prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient()

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete prompt error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete prompt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully'
    })
  } catch (error: any) {
    console.error('DELETE /api/admin/prompts/[id] error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
