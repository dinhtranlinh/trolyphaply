import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/documents
 * List all legal documents with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || 'active';
    let query = supabase
      .from('legal_documents')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,doc_number.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ documents: data || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/documents
 * Create new legal document
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      docNumber,
      type,
      authority,
      issueDate,
      effectiveDate,
      summary,
      content,
      tags,
      category,
      status = 'active',
    } = body;

    // Validation
    if (!title || !type || !authority || !issueDate || !effectiveDate || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create document
    const { data, error } = await supabase
      .from('legal_documents')
      .insert({
        title,
        doc_number: docNumber || null,
        type,
        authority,
        issue_date: issueDate,
        effective_date: effectiveDate,
        summary: summary || null,
        content: content || {},
        tags: tags || [],
        category,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ document: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
