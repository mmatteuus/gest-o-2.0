
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://blayaierawkdesstthuf.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsYXlhaWVyYXdrZGVzc3R0aHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMzAxOSwiZXhwIjoyMDcxODA5MDE5fQ.6Hw5xVF6g7nV2lBsvCs5uGQTPT52JG7_LEj0qKOoFew';

const supabase = createClient(supabaseUrl, serviceKey);

async function createTablesDirectly() {
  console.log('🚀 Executando criação de tabelas via Supabase...');
  
  try {
    // Criar tabela profiles
    console.log('1. Criando tabela profiles...');
    const { data: profilesData, error: profilesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'MASTER')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (profilesError && !profilesError.message.includes('already exists')) {
      console.log('Erro profiles:', profilesError.message);
    } else {
      console.log('✅ Tabela profiles OK');
    }

    // Criar tabela clients
    console.log('2. Criando tabela clients...');
    const { data: clientsData, error: clientsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS clients (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
        );
      `
    });
    
    if (clientsError && !clientsError.message.includes('already exists')) {
      console.log('Erro clients:', clientsError.message);
    } else {
      console.log('✅ Tabela clients OK');
    }

    // Habilitar RLS
    console.log('3. Habilitando RLS...');
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.log('Erro RLS:', rlsError.message);
    } else {
      console.log('✅ RLS OK');
    }

    // Criar função para novos usuários
    console.log('4. Criando função handle_new_user...');
    const { data: funcData, error: funcError } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER SET search_path = public
        AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, name, role)
          VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'name',
            CASE 
              WHEN NEW.email = 'mtsf26@gmail.com' THEN 'MASTER'
              ELSE 'USER'
            END
          );
          RETURN NEW;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
      `
    });
    
    if (funcError) {
      console.log('Erro função:', funcError.message);
    } else {
      console.log('✅ Função handle_new_user OK');
    }

    console.log('🎉 Configuração básica do banco concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createTablesDirectly();
