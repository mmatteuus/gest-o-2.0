
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://blayaierawkdesstthuf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsYXlhaWVyYXdrZGVzc3R0aHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMzAxOSwiZXhwIjoyMDcxODA5MDE5fQ.6Hw5xVF6g7nV2lBsvCs5uGQTPT52JG7_LEj0qKOoFew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🧪 Testando conexão com Supabase...');
  
  try {
    // Testar com uma consulta simples
    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1);

    if (error) {
      console.log('⚠️ Erro na consulta de teste:', error.message);
      console.log('ℹ️ Isso é normal se não houver usuários ainda');
    } else {
      console.log('✅ Conexão estabelecida com sucesso!');
    }

    console.log('🔍 Verificando tabelas existentes...');
    
    // Tentar criar uma tabela simples para testar
    const { data: createData, error: createError } = await supabase.rpc('create_test_table');
    
    if (createError) {
      console.log('ℹ️ RPC create_test_table não existe (normal)');
    }
    
    console.log('✅ Teste de conexão concluído!');
    console.log('');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/blayaierawkdesstthuf');
    console.log('2. Vá em SQL Editor');
    console.log('3. Execute o conteúdo do arquivo scripts/database-setup.sql');
    console.log('4. Execute o conteúdo do arquivo scripts/console-tables.sql');
    console.log('5. O sistema estará pronto para uso!');
    console.log('');
    console.log('🔐 CREDENCIAIS MASTER:');
    console.log('Email: mtsf26@gmail.com');
    console.log('Senha: Mateus@1');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
