import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env file
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

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

async function seedLegalLibrary() {
  console.log('🌱 Starting Legal Library seeding...\n')

  // Read JSON file
  const jsonPath = path.join(process.cwd(), 'data', 'legal-library.json')
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
  const data = JSON.parse(jsonContent)

  let docsImported = 0
  let docsSkipped = 0
  let procsImported = 0
  let procsSkipped = 0

  // Seed Documents
  if (data.legalLibraryItems && data.legalLibraryItems.length > 0) {
    console.log(`📄 Seeding ${data.legalLibraryItems.length} documents...`)
    
    for (const item of data.legalLibraryItems as ImportDocument[]) {
      try {
        // Check if exists
        const { data: existing } = await supabase
          .from('legal_documents')
          .select('id')
          .eq('title', item.title)
          .single()

        if (existing) {
          console.log(`  ⏭️  Skipped: ${item.title} (already exists)`)
          docsSkipped++
          continue
        }

        // Transform and insert
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
          console.error(`  ❌ Error: ${item.title} - ${error.message}`)
        } else {
          console.log(`  ✅ Imported: ${item.title}`)
          docsImported++
        }
      } catch (err: any) {
        console.error(`  ❌ Error: ${item.title} - ${err.message}`)
      }
    }
  }

  // Seed Procedures
  if (data.procedures && data.procedures.length > 0) {
    console.log(`\n📋 Seeding ${data.procedures.length} procedures...`)
    
    for (const proc of data.procedures as ImportProcedure[]) {
      try {
        // Check if exists
        const { data: existing } = await supabase
          .from('procedures')
          .select('id')
          .eq('title', proc.title)
          .single()

        if (existing) {
          console.log(`  ⏭️  Skipped: ${proc.title} (already exists)`)
          procsSkipped++
          continue
        }

        // Transform and insert
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
          console.error(`  ❌ Error: ${proc.title} - ${error.message}`)
        } else {
          console.log(`  ✅ Imported: ${proc.title}`)
          procsImported++
        }
      } catch (err: any) {
        console.error(`  ❌ Error: ${proc.title} - ${err.message}`)
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 SEEDING SUMMARY')
  console.log('='.repeat(50))
  console.log(`Documents: ✅ ${docsImported} imported, ⏭️  ${docsSkipped} skipped`)
  console.log(`Procedures: ✅ ${procsImported} imported, ⏭️  ${procsSkipped} skipped`)
  console.log('='.repeat(50))
  console.log('\n✨ Seeding completed!')
}

// Run
seedLegalLibrary().catch(console.error)
