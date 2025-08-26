
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Profile, Snippet, SnippetKind, ExecutionResult } from '@/lib/types';
import {
  Play,
  Save,
  Plus,
  Trash2,
  Code,
  Database,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Terminal,
  List,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Monaco Editor importado dinamicamente para evitar problemas de SSR
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center border rounded-lg bg-muted">
        <div className="text-center">
          <Terminal className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Carregando editor...</p>
        </div>
      </div>
    ),
  }
);

interface CodeConsoleProps {
  user: Profile;
}

const SNIPPET_TYPES = [
  { 
    value: 'task-js', 
    label: 'JavaScript Task', 
    icon: Code, 
    language: 'javascript',
    description: 'Execute JavaScript com sandbox seguro'
  },
  { 
    value: 'report-sql', 
    label: 'SQL Report', 
    icon: Database, 
    language: 'sql',
    description: 'Consultas SQL (apenas SELECT permitido)'
  },
  { 
    value: 'ui-mdx', 
    label: 'UI MDX', 
    icon: FileText, 
    language: 'markdown',
    description: 'Componentes MDX para interface'
  },
] as const;

const DEFAULT_CODES = {
  'task-js': `// Exemplo de task JavaScript
const data = [1, 2, 3, 4, 5];
const result = data
  .map(x => x * 2)
  .filter(x => x > 5)
  .reduce((sum, x) => sum + x, 0);

console.log('Resultado:', result);
return result;`,
  'report-sql': `-- Exemplo de consulta SQL
SELECT 
  COUNT(*) as total_orders,
  SUM(total_value) as total_revenue,
  AVG(total_value) as avg_order_value
FROM orders 
WHERE status = 'COMPLETED'
AND created_at >= NOW() - INTERVAL '30 days';`,
  'ui-mdx': `# Relatório de Vendas

Este é um exemplo de componente MDX para relatórios.

## Métricas Principais

- **Total de Vendas**: R$ 15.000,00
- **Pedidos Processados**: 125
- **Ticket Médio**: R$ 120,00

## Gráfico de Performance

\`\`\`jsx
<Chart data={salesData} type="line" />
\`\`\`

> **Nota**: Este relatório é atualizado diariamente.`,
};

export function CodeConsole({ user }: CodeConsoleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Estados principais
  const [selectedType, setSelectedType] = useState<SnippetKind>('task-js');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState<Snippet | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // Estados de loading
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar snippets ao montar o componente
  useEffect(() => {
    loadSnippets();
    
    // Verificar se há um tipo específico na URL
    const typeParam = searchParams.get('type');
    if (typeParam && ['task-js', 'report-sql', 'ui-mdx'].includes(typeParam)) {
      setSelectedType(typeParam as SnippetKind);
    }
  }, [searchParams]);

  // Atualizar código quando o tipo muda
  useEffect(() => {
    if (!currentSnippet) {
      setCode(DEFAULT_CODES[selectedType]);
    }
  }, [selectedType, currentSnippet]);

  const loadSnippets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/snippets');
      if (response.ok) {
        const data = await response.json();
        setSnippets(data.snippets || []);
      }
    } catch (error) {
      console.error('Erro ao carregar snippets:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os snippets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeCode = async () => {
    if (!code.trim()) {
      toast({
        title: 'Erro',
        description: 'Código não pode estar vazio',
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/admin/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          kind: selectedType,
          snippetId: currentSnippet?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na execução');
      }

      setExecutionResult(result);
      toast({
        title: result.success ? 'Executado com sucesso!' : 'Erro na execução',
        description: result.success 
          ? `Executado em ${result.execution_time}ms`
          : result.error,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error: any) {
      const errorResult: ExecutionResult = {
        success: false,
        error: error.message || 'Erro desconhecido',
      };
      setExecutionResult(errorResult);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const saveSnippet = async () => {
    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'Título é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: 'Erro',
        description: 'Código não pode estar vazio',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const url = currentSnippet 
        ? `/api/admin/snippets/${currentSnippet.id}`
        : '/api/admin/snippets';
      
      const method = currentSnippet ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          kind: selectedType,
          code,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar');
      }

      const { snippet } = await response.json();
      setCurrentSnippet(snippet);
      
      toast({
        title: 'Snippet salvo!',
        description: `"${snippet.title}" foi ${currentSnippet ? 'atualizado' : 'criado'} com sucesso`,
      });

      // Recarregar lista
      await loadSnippets();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const createNewSnippet = () => {
    setCurrentSnippet(null);
    setTitle('');
    setCode(DEFAULT_CODES[selectedType]);
    setExecutionResult(null);
  };

  const loadSnippet = (snippet: Snippet) => {
    setCurrentSnippet(snippet);
    setTitle(snippet.title);
    setCode(snippet.code);
    setSelectedType(snippet.kind);
    setExecutionResult(null);
  };

  const deleteSnippet = async (snippetId: string) => {
    if (!confirm('Tem certeza que deseja deletar este snippet?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/snippets/${snippetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar');
      }

      toast({
        title: 'Snippet deletado!',
        description: 'O snippet foi removido com sucesso',
      });

      // Se era o snippet atual, limpar
      if (currentSnippet?.id === snippetId) {
        createNewSnippet();
      }

      // Recarregar lista
      await loadSnippets();
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const currentTypeInfo = SNIPPET_TYPES.find(t => t.value === selectedType);

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="h-7 w-7 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Console de Código</h1>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Execução Segura
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Execute JavaScript, consultas SQL e valide componentes MDX em ambiente controlado.
        </p>
      </div>

      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor" className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>Editor de Código</span>
          </TabsTrigger>
          <TabsTrigger value="snippets" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>Snippets Salvos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {/* Controls */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Título do snippet..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as SnippetKind)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de código" />
              </SelectTrigger>
              <SelectContent>
                {SNIPPET_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button onClick={executeCode} disabled={isExecuting} className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                {isExecuting ? 'Executando...' : 'Executar'}
              </Button>
              <Button onClick={saveSnippet} disabled={isSaving} variant="outline">
                <Save className="h-4 w-4" />
              </Button>
              <Button onClick={createNewSnippet} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Type Info */}
          {currentTypeInfo && (
            <Alert>
              <currentTypeInfo.icon className="h-4 w-4" />
              <AlertDescription>
                {currentTypeInfo.description}
              </AlertDescription>
            </Alert>
          )}

          {/* Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Editor de Código</span>
                {currentSnippet && (
                  <Badge variant="outline">
                    v{currentSnippet.version}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonacoEditor
                height="400px"
                language={currentTypeInfo?.language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </CardContent>
          </Card>

          {/* Results */}
          {executionResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {executionResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Resultado da Execução</span>
                  {executionResult.execution_time && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{executionResult.execution_time}ms</span>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <pre className="text-sm">
                    {executionResult.success 
                      ? JSON.stringify(executionResult.result, null, 2)
                      : executionResult.error
                    }
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="snippets">
          <Card>
            <CardHeader>
              <CardTitle>Snippets Salvos</CardTitle>
              <CardDescription>
                {isLoading ? 'Carregando...' : `${snippets.length} snippet(s) encontrado(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Terminal className="h-8 w-8 text-muted-foreground animate-pulse" />
                </div>
              ) : snippets.length === 0 ? (
                <div className="text-center h-32 flex items-center justify-center">
                  <p className="text-muted-foreground">Nenhum snippet salvo ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {snippets.map((snippet) => {
                    const typeInfo = SNIPPET_TYPES.find(t => t.value === snippet.kind);
                    const Icon = typeInfo?.icon || Code;
                    
                    return (
                      <div
                        key={snippet.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{snippet.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>{typeInfo?.label}</span>
                              <span>•</span>
                              <span>v{snippet.version}</span>
                              <span>•</span>
                              <span>{new Date(snippet.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadSnippet(snippet)}
                          >
                            Carregar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSnippet(snippet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
