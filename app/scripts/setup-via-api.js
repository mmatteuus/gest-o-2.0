
// Script para configurar o banco via API REST do Supabase
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://blayaierawkdesstthuf.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsYXlhaWVyYXdrZGVzc3R0aHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMzAxOSwiZXhwIjoyMDcxODA5MDE5fQ.6Hw5xVF6g7nV2lBsvCs5uGQTPT52JG7_LEj0qKOoFew';

async function executeSQL(sql) {
  try {
    console.log('Executando SQL via API...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql: sql
      })
    });

    console.log('Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Resposta de erro:', errorText);
    } else {
      console.log('✅ SQL executado com sucesso');
    }
    
    return response.ok;
  } catch (error) {
    console.error('Erro na execução SQL:', error.message);
    return false;
  }
}

async function createTables() {
  console.log('🚀 Criando tabelas básicas...');
  
  // Comandos SQL individuais para evitar problemas de parsing
  const commands = [
    `CREATE TABLE IF NOT EXISTS profiles (
      id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'MASTER')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS clients (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
    );`,
    
    `CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
    );`,
    
    `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE clients ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE products ENABLE ROW LEVEL SECURITY;`
  ];

  for (let i = 0; i < commands.length; i++) {
    console.log(`Executando comando ${i + 1}/${commands.length}...`);
    await executeSQL(commands[i]);
    // Pequena pausa entre comandos
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('✅ Tabelas básicas criadas');
}

// Executar
createTables().then(() => {
  console.log('🎉 Configuração concluída!');
}).catch(error => {
  console.error('❌ Erro:', error);
});
