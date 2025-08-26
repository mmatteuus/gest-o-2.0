
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { SnippetKind } from '@/lib/types';

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

// GET - Obter snippet específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateMaster();
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas usuários MASTER podem acessar snippets.' },
        { status: 403 }
      );
    }

    const { supabase } = auth;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do snippet é obrigatório' },
        { status: 400 }
      );
    }

    const { data: snippet, error } = await supabase
      .from('snippets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !snippet) {
      return NextResponse.json(
        { error: 'Snippet não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ snippet });
  } catch (error) {
    console.error('Erro ao obter snippet:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar snippet
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateMaster();
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas usuários MASTER podem editar snippets.' },
        { status: 403 }
      );
    }

    const { user, supabase } = auth;
    const { id } = params;
    const body = await req.json();
    const { title, kind, code }: { title: string; kind: SnippetKind; code: string } = body;

    // Validações
    if (!id) {
      return NextResponse.json(
        { error: 'ID do snippet é obrigatório' },
        { status: 400 }
      );
    }

    if (!title || !kind || !code) {
      return NextResponse.json(
        { error: 'Título, tipo e código são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['task-js', 'report-sql', 'ui-mdx'].includes(kind)) {
      return NextResponse.json(
        { error: 'Tipo de snippet inválido' },
        { status: 400 }
      );
    }

    // Verificar se o snippet existe
    const { data: existingSnippet, error: checkError } = await supabase
      .from('snippets')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingSnippet) {
      return NextResponse.json(
        { error: 'Snippet não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar snippet
    const { data: snippet, error } = await supabase
      .from('snippets')
      .update({
        title: title.trim(),
        kind,
        code: code.trim(),
        version: existingSnippet.version + 1,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao atualizar snippet' },
        { status: 500 }
      );
    }

    // Log da atualização
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update_snippet',
      snippet_id: snippet.id,
      result: JSON.stringify({ 
        title: snippet.title, 
        kind: snippet.kind,
        version: snippet.version 
      }),
    });

    return NextResponse.json({ snippet });
  } catch (error) {
    console.error('Erro ao atualizar snippet:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar snippet
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateMaster();
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas usuários MASTER podem deletar snippets.' },
        { status: 403 }
      );
    }

    const { user, supabase } = auth;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do snippet é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o snippet existe
    const { data: existingSnippet, error: checkError } = await supabase
      .from('snippets')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingSnippet) {
      return NextResponse.json(
        { error: 'Snippet não encontrado' },
        { status: 404 }
      );
    }

    // Deletar snippet
    const { error } = await supabase
      .from('snippets')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao deletar snippet' },
        { status: 500 }
      );
    }

    // Log da deleção
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'delete_snippet',
      snippet_id: id,
      result: JSON.stringify({ 
        title: existingSnippet.title, 
        kind: existingSnippet.kind 
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar snippet:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
