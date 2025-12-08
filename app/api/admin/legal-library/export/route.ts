import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'documents' | 'procedures' | 'all'
    
    const supabase = createClient()
    const exportData: any = {}

    // Export Documents
    if (type === 'documents' || type === 'all' || !type) {
      const { data: documents, error: docsError } = await supabase
        .from('legal_documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (docsError) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch documents', details: docsError.message },
          { status: 500 }
        )
      }

      // Transform to export format
      exportData.legalLibraryItems = documents?.map(doc => ({
        id: doc.id,
        title: doc.title,
        slug: doc.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        type: doc.type,
        documentNumber: doc.doc_number,
        issuedBy: doc.authority,
        issuedDate: doc.issue_date,
        effectiveDate: doc.effective_date,
        category: doc.category,
        tags: doc.tags,
        summary: doc.summary,
        content: typeof doc.content === 'object' ? doc.content.raw || '' : doc.content,
        chapters: typeof doc.content === 'object' ? doc.content.chapters || [] : [],
        source_urls: typeof doc.content === 'object' ? doc.content.source_urls || [] : [],
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })) || []
    }

    // Export Procedures
    if (type === 'procedures' || type === 'all' || !type) {
      const { data: procedures, error: procsError } = await supabase
        .from('procedures')
        .select('*')
        .order('created_at', { ascending: false })

      if (procsError) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch procedures', details: procsError.message },
          { status: 500 }
        )
      }

      // Transform to export format
      exportData.procedures = procedures?.map(proc => ({
        id: proc.id,
        title: proc.title,
        slug: proc.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        category: proc.category,
        authority: proc.authority,
        level: 'commune', // default
        description: proc.notes,
        estimatedTime: proc.time_est,
        fees: proc.fees,
        tags: proc.tags,
        steps: proc.steps,
        created_at: proc.created_at,
        updated_at: proc.updated_at
      })) || []
    }

    // Return as downloadable JSON
    const filename = `legal-library-export-${new Date().toISOString().split('T')[0]}.json`
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Export failed' },
      { status: 500 }
    )
  }
}
