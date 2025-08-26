
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { SnippetKind, ExecutionResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Rate limiter simples em memória
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimits = rateLimitMap.get(userId);
  
  if (!userLimits || now > userLimits.resetTime) {
    // Reset ou primeira execução
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minuto
    return true;
  }
  
  if (userLimits.count >= 10) {
    return false; // Excedeu limite
  }
  
  userLimits.count++;
  return true;
}

// Middleware de autenticação MASTER
async function authenticateMaster(req: NextRequest) {
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

// Executar JavaScript de forma limitada (apenas para demonstração)
function executeJavaScript(code: string): ExecutionResult {
  const startTime = Date.now();
  
  try {
    // IMPORTANTE: Esta é uma implementação simplificada para demonstração
    // Em produção, seria necessário usar um sandbox mais robusto
    
    // Verificar se contém código perigoso
    const dangerousPatterns = [
      'require', 'import', 'process', 'global', '__dirname', '__filename',
      'fs', 'child_process', 'eval', 'Function', 'setTimeout', 'setInterval'
    ];
    
    for (const pattern of dangerousPatterns) {
      if (code.includes(pattern)) {
        return {
          success: false,
          error: `Uso de '${pattern}' não é permitido`,
          execution_time: Date.now() - startTime,
        };
      }
    }

    // Simular um ambiente básico
    const mockConsole = {
      log: (...args: any[]) => console.log('[SANDBOX]', ...args),
      error: (...args: any[]) => console.error('[SANDBOX]', ...args),
    };

    // Esta é uma implementação muito básica - apenas para demonstração
    // Em produção real, seria necessário usar Worker threads ou vm2 adequado
    let result: any;
    try {
      // Simular execução (muito limitada)
      result = `Execução simulada do código:\n${code.substring(0, 100)}${code.length > 100 ? '...' : ''}`;
    } catch (execError: any) {
      throw new Error(execError.message);
    }

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      result: result,
      execution_time: executionTime,
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    return {
      success: false,
      error: error.message || 'Erro desconhecido na execução',
      execution_time: executionTime,
    };
  }
}

// Executar SQL de forma segura (apenas SELECT)
async function executeSQLReport(code: string, supabase: any): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    // Validar se é apenas SELECT
    const trimmedCode = code.trim().toLowerCase();
    if (!trimmedCode.startsWith('select')) {
      return {
        success: false,
        error: 'Apenas consultas SELECT são permitidas',
        execution_time: Date.now() - startTime,
      };
    }

    // Verificar se contém comandos perigosos
    const dangerousKeywords = [
      'insert', 'update', 'delete', 'drop', 'create', 'alter', 
      'truncate', 'grant', 'revoke', 'exec', 'execute'
    ];

    for (const keyword of dangerousKeywords) {
      if (trimmedCode.includes(keyword)) {
        return {
          success: false,
          error: `Comando '${keyword}' não é permitido`,
          execution_time: Date.now() - startTime,
        };
      }
    }

    // Executar via RPC segura (se configurada) ou query direta
    const { data, error } = await supabase.rpc('execute_safe_select', {
      query: code
    });

    if (error) {
      return {
        success: false,
        error: error.message,
        execution_time: Date.now() - startTime,
      };
    }

    return {
      success: true,
      result: data,
      execution_time: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro na execução SQL',
      execution_time: Date.now() - startTime,
    };
  }
}

// Validar MDX
function validateMDX(code: string): ExecutionResult {
  const startTime = Date.now();

  try {
    // Validações básicas de MDX
    if (!code.trim()) {
      return {
        success: false,
        error: 'Código MDX não pode estar vazio',
        execution_time: Date.now() - startTime,
      };
    }

    // Verificar se contém tags JSX válidas
    const hasValidJSX = /<[A-Za-z][A-Za-z0-9]*[^>]*>/.test(code) || 
                       /^#\s+/.test(code) || // Markdown headers
                       /^\*\s+/.test(code) || // Markdown lists  
                       /^-\s+/.test(code);   // Markdown lists

    if (!hasValidJSX && !code.includes('```')) {
      return {
        success: false,
        error: 'Código MDX deve conter pelo menos um elemento válido',
        execution_time: Date.now() - startTime,
      };
    }

    return {
      success: true,
      result: 'MDX validado com sucesso',
      execution_time: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro na validação MDX',
      execution_time: Date.now() - startTime,
    };
  }
}

// Registrar execução no audit log
async function logExecution(
  supabase: any,
  userId: string,
  action: string,
  snippetId: string | null,
  result: ExecutionResult
) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      snippet_id: snippetId,
      execution_time: result.execution_time,
      result: result.success ? JSON.stringify(result.result) : null,
      error: result.error || null,
    });
  } catch (error) {
    console.error('Erro ao registrar audit log:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Autenticação
    const auth = await authenticateMaster(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas usuários MASTER podem executar código.' },
        { status: 403 }
      );
    }

    const { user, supabase } = auth;

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Limite de execuções excedido. Tente novamente em um minuto.' },
        { status: 429 }
      );
    }

    // Parse do body
    const body = await req.json();
    const { code, kind, snippetId }: { code: string; kind: SnippetKind; snippetId?: string } = body;

    // Validações básicas
    if (!code || !kind) {
      return NextResponse.json(
        { error: 'Código e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['task-js', 'report-sql', 'ui-mdx'].includes(kind)) {
      return NextResponse.json(
        { error: 'Tipo de snippet inválido' },
        { status: 400 }
      );
    }

    // Executar baseado no tipo
    let result: ExecutionResult;

    switch (kind) {
      case 'task-js':
        result = executeJavaScript(code);
        break;

      case 'report-sql':
        result = await executeSQLReport(code, supabase);
        break;

      case 'ui-mdx':
        result = validateMDX(code);
        break;

      default:
        result = {
          success: false,
          error: 'Tipo de execução não suportado',
        };
    }

    // Registrar no audit log
    await logExecution(supabase, user.id, `execute_${kind}`, snippetId || null, result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Erro na API de execução:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
