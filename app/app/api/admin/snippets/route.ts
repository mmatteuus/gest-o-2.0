
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

// GET - Listar todos os snippets do usuário
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateMaster();
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas usuários MASTER podem acessar snippets.' },
        { status: 403 }
      );
    }

    const { supabase } = auth;

    const { data: snippets, error } = await supabase
      .from('snippets')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao carregar snippets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ snippets });
  } catch (error) {
    console.error('Erro ao listar snippets:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo snippet
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateMaster();
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas usuários MASTER podem criar snippets.' },
        { status: 403 }
      );
    }

    const { user, supabase } = auth;
    const body = await req.json();
    const { title, kind, code }: { title: string; kind: SnippetKind; code: string } = body;

    // Validações
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

    if (title.trim().length < 3) {
      return NextResponse.json(
        { error: 'Título deve ter pelo menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (code.trim().length < 1) {
      return NextResponse.json(
        { error: 'Código não pode estar vazio' },
        { status: 400 }
      );
    }

    // Criar snippet
    const { data: snippet, error } = await supabase
      .from('snippets')
      .insert({
        title: title.trim(),
        kind,
        code: code.trim(),
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao criar snippet' },
        { status: 500 }
      );
    }

    // Log da criação
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_snippet',
      snippet_id: snippet.id,
      result: JSON.stringify({ title: snippet.title, kind: snippet.kind }),
    });

    return NextResponse.json({ snippet });
  } catch (error) {
    console.error('Erro ao criar snippet:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
