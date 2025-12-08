import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/admin/prompts/[id]/versions - Get all versions for a prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient()

    // Verify prompt exists
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, name')
      .eq('id', id)
      .single()

    if (promptError || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Get all versions, sorted by version number descending
    const { data: versions, error: versionsError } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', id)
      .order('version', { ascending: false })

    if (versionsError) {
      console.error('Get versions error:', versionsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch versions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: versions || [],
      prompt: prompt
    })
  } catch (error: any) {
    console.error('GET /api/admin/prompts/[id]/versions error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/prompts/[id]/versions - Create a new version or restore from history
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, version_id, note } = body

    const supabase = createClient()

    // Verify prompt exists
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single()

    if (promptError || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      )
    }

    if (action === 'restore') {
      // Restore from a previous version
      if (!version_id) {
        return NextResponse.json(
          { success: false, error: 'version_id is required for restore action' },
          { status: 400 }
        )
      }

      // Get the version to restore
      const { data: versionToRestore, error: versionError } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('id', version_id)
        .eq('prompt_id', id)
        .single()

      if (versionError || !versionToRestore) {
        return NextResponse.json(
          { success: false, error: 'Version not found' },
          { status: 404 }
        )
      }

      // Get current max version number
      const { data: maxVersionData } = await supabase
        .from('prompt_versions')
        .select('version')
        .eq('prompt_id', id)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      const nextVersion = (maxVersionData?.version || 0) + 1

      // Create new version with restored content
      const { data: newVersion, error: createError } = await supabase
        .from('prompt_versions')
        .insert({
          prompt_id: id,
          version: nextVersion,
          title: versionToRestore.title,
          body: versionToRestore.body,
          category: versionToRestore.category,
          tags: versionToRestore.tags,
          is_public: versionToRestore.is_public,
          created_by: note || `Restored from version ${versionToRestore.version}`
        })
        .select()
        .single()

      if (createError) {
        console.error('Create version error:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create version' },
          { status: 500 }
        )
      }

      // Update the prompt with restored content
      const { error: updateError } = await supabase
        .from('prompts')
        .update({
          title: versionToRestore.title,
          body: versionToRestore.body,
          category: versionToRestore.category,
          tags: versionToRestore.tags,
          is_public: versionToRestore.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        console.error('Update prompt error:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update prompt' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: newVersion,
        message: `Restored to version ${versionToRestore.version}`
      })
    } else {
      // Create new version (save current state before update)
      // Get current max version number
      const { data: maxVersionData } = await supabase
        .from('prompt_versions')
        .select('version')
        .eq('prompt_id', id)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      const nextVersion = (maxVersionData?.version || 0) + 1

      // Create new version with current prompt state
      const { data: newVersion, error: createError } = await supabase
        .from('prompt_versions')
        .insert({
          prompt_id: id,
          version: nextVersion,
          title: prompt.title,
          body: prompt.body,
          category: prompt.category,
          tags: prompt.tags,
          is_public: prompt.is_public,
          created_by: note?.trim() || `Version ${nextVersion}`
        })
        .select()
        .single()

      if (createError) {
        console.error('Create version error:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create version' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: newVersion,
        message: 'Version created successfully'
      })
    }
  } catch (error: any) {
    console.error('POST /api/admin/prompts/[id]/versions error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
