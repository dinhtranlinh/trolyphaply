import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// POST /api/admin/style-guides/[id]/examples - Create new example
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { before, after } = body

    // Validation
    if (!before?.trim() || !after?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Before and after text are required' },
        { status: 400 }
      )
    }

    // Verify style guide exists
    const supabase = createClient()
    const { data: guide, error: guideError } = await supabase
      .from('style_guides')
      .select('id')
      .eq('id', id)
      .single()

    if (guideError || !guide) {
      return NextResponse.json(
        { success: false, error: 'Style guide not found' },
        { status: 404 }
      )
    }

    // Create example
    const { data: example, error: createError } = await supabase
      .from('style_guide_examples')
      .insert({
        style_guide_id: id,
        before: before.trim(),
        after: after.trim()
      })
      .select()
      .single()

    if (createError) {
      console.error('Create example error:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create example' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: example,
      message: 'Example created successfully'
    })
  } catch (error: any) {
    console.error('POST /api/admin/style-guides/[id]/examples error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
