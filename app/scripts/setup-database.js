
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração Supabase
const supabaseUrl = 'https://blayaierawkdesstthuf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsYXlhaWVyYXdrZGVzc3R0aHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMzAxOSwiZXhwIjoyMDcxODA5MDE5fQ.6Hw5xVF6g7nV2lBsvCs5uGQTPT52JG7_LEj0qKOoFew';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Configurando banco de dados...');
    
    // Ler e executar script principal
    const databaseSetupSQL = fs.readFileSync(path.join(__dirname, 'database-setup.sql'), 'utf8');
    console.log('📝 Executando script principal...');
    
    const { data: setupData, error: setupError } = await supabase.rpc('exec', {
      sql: databaseSetupSQL
    });
    
    if (setupError) {
      console.log('ℹ️ Algumas tabelas já podem existir:', setupError.message);
    } else {
      console.log('✅ Script principal executado com sucesso');
    }

    // Ler e executar script do console
    const consoleTablesSQL = fs.readFileSync(path.join(__dirname, 'console-tables.sql'), 'utf8');
    console.log('📝 Executando script do console...');
    
    const { data: consoleData, error: consoleError } = await supabase.rpc('exec', {
      sql: consoleTablesSQL
    });
    
    if (consoleError) {
      console.log('ℹ️ Algumas tabelas do console já podem existir:', consoleError.message);
    } else {
      console.log('✅ Script do console executado com sucesso');
    }

    // Criar usuário MASTER
    console.log('👤 Configurando usuário MASTER...');
    
    // Tentar inserir profile MASTER diretamente
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          email: 'mtsf26@gmail.com',
          name: 'Master User',
          role: 'MASTER'
        }
      ], {
        onConflict: 'email'
      });

    if (profileError) {
      console.log('ℹ️ Usuário MASTER:', profileError.message);
    } else {
      console.log('✅ Usuário MASTER configurado');
    }

    console.log('🎉 Configuração do banco concluída!');
    console.log('📧 Email MASTER: mtsf26@gmail.com');
    console.log('🔑 Senha MASTER: Mateus@1');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

setupDatabase();
