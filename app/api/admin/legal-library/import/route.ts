import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

interface ImportDocument {
  id?: string
  title: string
  slug: string
  type: string
  documentNumber?: string
  issuedBy: string
  issuedDate: string
  effectiveDate: string
  category: string
  tags: string[]
  summary?: string
  content: string
  chapters?: string[]
  source_urls?: string[]
}

interface ImportProcedure {
  id?: string
  title: string
  slug: string
  category: string
  authority: string
  level?: string
  description?: string
  estimatedTime: string
  fees?: string
  tags: string[]
  steps: any[]
}

interface ImportData {
  legalLibraryItems?: ImportDocument[]
  procedures?: ImportProcedure[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportData = await request.json()
    const supabase = createClient()

    const results = {
      documents: { imported: 0, skipped: 0, errors: [] as string[] },
      procedures: { imported: 0, skipped: 0, errors: [] as string[] }
    }

    // Import Documents
    if (body.legalLibraryItems && body.legalLibraryItems.length > 0) {
      for (const item of body.legalLibraryItems) {
        try {
          // Check if document already exists by slug
          const { data: existing } = await supabase
            .from('legal_documents')
            .select('id')
            .eq('title', item.title)
            .single()

          if (existing) {
            results.documents.skipped++
            continue
          }

          // Transform JSON format to database format
          const documentData = {
            title: item.title,
            doc_number: item.documentNumber || null,
            type: item.type,
            authority: item.issuedBy,
            issue_date: item.issuedDate,
            effective_date: item.effectiveDate,
            category: item.category,
            tags: item.tags,
            summary: item.summary || null,
            content: {
              raw: item.content,
              chapters: item.chapters || [],
              source_urls: item.source_urls || []
            },
            status: 'active'
          }

          const { error } = await supabase
            .from('legal_documents')
            .insert(documentData)

          if (error) {
            results.documents.errors.push(`${item.title}: ${error.message}`)
          } else {
            results.documents.imported++
          }
        } catch (err: any) {
          results.documents.errors.push(`${item.title}: ${err.message}`)
        }
      }
    }

    // Import Procedures
    if (body.procedures && body.procedures.length > 0) {
      for (const proc of body.procedures) {
        try {
          // Check if procedure already exists
          const { data: existing } = await supabase
            .from('procedures')
            .select('id')
            .eq('title', proc.title)
            .single()

          if (existing) {
            results.procedures.skipped++
            continue
          }

          // Transform JSON format to database format
          const procedureData = {
            title: proc.title,
            authority: proc.authority,
            time_est: proc.estimatedTime,
            category: proc.category,
            steps: proc.steps,
            documents: [], // Extract from steps if needed
            fees: proc.fees || null,
            notes: proc.description || null,
            tags: proc.tags,
            status: 'active'
          }

          const { error } = await supabase
            .from('procedures')
            .insert(procedureData)

          if (error) {
            results.procedures.errors.push(`${proc.title}: ${error.message}`)
          } else {
            results.procedures.imported++
          }
        } catch (err: any) {
          results.procedures.errors.push(`${proc.title}: ${err.message}`)
        }
      }
    }

    // Build response message
    const messages: string[] = []
    if (results.documents.imported > 0) {
      messages.push(`Imported ${results.documents.imported} documents`)
    }
    if (results.documents.skipped > 0) {
      messages.push(`Skipped ${results.documents.skipped} existing documents`)
    }
    if (results.procedures.imported > 0) {
      messages.push(`Imported ${results.procedures.imported} procedures`)
    }
    if (results.procedures.skipped > 0) {
      messages.push(`Skipped ${results.procedures.skipped} existing procedures`)
    }

    const hasErrors = results.documents.errors.length > 0 || results.procedures.errors.length > 0

    return NextResponse.json({
      success: !hasErrors || (results.documents.imported + results.procedures.imported) > 0,
      message: messages.join(', '),
      results,
      errors: hasErrors ? {
        documents: results.documents.errors,
        procedures: results.procedures.errors
      } : undefined
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Import failed' },
      { status: 500 }
    )
  }
}
