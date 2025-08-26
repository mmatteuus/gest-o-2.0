
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Middleware de autenticação MASTER
async function authenticateMaster() {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile || profile.role !== 'MASTER') {
      return null;
    }

    return { user: profile, supabase };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// GET - Listar audit logs com paginação e filtros
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateMaster();
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas usuários MASTER podem visualizar audit logs.' },
        { status: 403 }
      );
    }

    const { supabase } = auth;
    const { searchParams } = new URL(req.url);
    
    // Parâmetros de query
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const snippetId = searchParams.get('snippet_id');

    // Calcular offset
    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase
      .from('audit_logs')
      .select('*, snippets(title, kind)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtros
    if (action) {
      query = query.eq('action', action);
    }

    if (snippetId) {
      query = query.eq('snippet_id', snippetId);
    }

    const { data: logs, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao carregar audit logs' },
        { status: 500 }
      );
    }

    // Metadados de paginação
    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Erro ao listar audit logs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
