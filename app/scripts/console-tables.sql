
-- Script para criar tabelas do Console de Código
-- Execute este script no Supabase SQL Editor

-- Criar enum para tipos de snippets
DO $$ BEGIN
    CREATE TYPE snippet_kind AS ENUM ('task-js', 'report-sql', 'ui-mdx');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela snippets para armazenar códigos
CREATE TABLE IF NOT EXISTS snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  kind snippet_kind NOT NULL,
  code TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela audit_logs para registrar execuções
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  snippet_id UUID REFERENCES snippets(id) ON DELETE CASCADE,
  execution_time INTEGER, -- em milliseconds
  result TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_snippets_updated_at 
    BEFORE UPDATE ON snippets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - apenas MASTER/ADMIN podem acessar
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para snippets: apenas usuários com role MASTER podem fazer qualquer operação
CREATE POLICY "Only MASTER can manage snippets" ON snippets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'MASTER'
  )
);

-- Política para audit_logs: apenas usuários com role MASTER podem visualizar
CREATE POLICY "Only MASTER can view audit logs" ON audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'MASTER'
  )
);

-- Política para audit_logs: permitir inserção para operações do sistema
CREATE POLICY "Allow audit log creation" ON audit_logs
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'MASTER'
  )
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_snippets_created_by ON snippets(created_by);
CREATE INDEX IF NOT EXISTS idx_snippets_kind ON snippets(kind);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_snippet_id ON audit_logs(snippet_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Comentários para documentação
COMMENT ON TABLE snippets IS 'Armazena snippets de código (JS, SQL, MDX) do Console de Código';
COMMENT ON TABLE audit_logs IS 'Registra todas as execuções e ações do Console de Código';
COMMENT ON COLUMN snippets.kind IS 'Tipo do snippet: task-js (JavaScript), report-sql (SQL), ui-mdx (MDX)';
COMMENT ON COLUMN audit_logs.execution_time IS 'Tempo de execução em milliseconds';
