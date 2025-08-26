
# Sistema de Gestão de Ordens de Serviço v2.0

Sistema completo para gerenciamento de ordens de serviço, clientes, produtos e serviços, agora com **Console de Código** exclusivo para usuários MASTER.

## 🚀 Funcionalidades

### Principais
- ✅ **Dashboard** com métricas e gráficos
- ✅ **Gestão de Clientes** (CRUD completo)
- ✅ **Catálogo de Produtos** (controle de estoque)
- ✅ **Catálogo de Serviços** (preços e durações)
- ✅ **Ordens de Serviço** (workflow completo)
- ✅ **Controle de Despesas** (categorização)

### Console de Código (MASTER) 🔥
- ✅ **Editor Monaco** com syntax highlighting
- ✅ **Execução JavaScript** com sandbox de segurança
- ✅ **Consultas SQL** (apenas SELECT permitido)
- ✅ **Validação MDX** para componentes de interface
- ✅ **Sistema de Snippets** (salvar/carregar códigos)
- ✅ **Rate Limiting** (10 execuções/minuto)
- ✅ **Audit Logs** (registro de todas as ações)
- ✅ **Controle de Versioning** nos snippets

## 🛠️ Tecnologias

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Shadcn/UI
- **Banco**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deploy**: Netlify / Vercel
- **Code Editor**: Monaco Editor
- **Charts**: Recharts
- **TypeScript**: Fully typed

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/mmatteuus/gest-o-2.0.git
cd gest-o-2.0/app

# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar o banco (SQL no Supabase)
# Execute o script: scripts/console-tables.sql no Supabase SQL Editor

# Iniciar desenvolvimento
yarn dev
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=seu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
NEXT_PUBLIC_MASTER_EMAIL=admin@exemplo.com
```

### Configuração do Banco de Dados
1. Acesse seu projeto no Supabase
2. Execute o script `scripts/console-tables.sql` no SQL Editor
3. Configure RLS (Row Level Security) conforme o script
4. Crie um usuário com role 'MASTER' para acessar o Console de Código

## 🔐 Sistema de Permissões

### Roles
- **USER**: Acesso padrão (dashboard, CRUD básico)
- **MASTER**: Acesso total + Console de Código

### Segurança do Console de Código
- ✅ Autenticação obrigatória (role MASTER)
- ✅ Rate limiting (10 execuções/minuto)
- ✅ Validação de código (patterns perigosos bloqueados)
- ✅ Sandbox JavaScript (limitado)
- ✅ SQL sanitization (apenas SELECT)
- ✅ Audit log completo
- ✅ Versionamento de snippets

## 🎯 Como Usar o Console de Código

1. **Acesso**: Faça login com conta MASTER → Menu "MASTER" → "Console de Código"

2. **Tipos de Código**:
   - **JavaScript Task**: Execute lógica de negócio com limitações de segurança
   - **SQL Report**: Consultas SELECT para relatórios personalizados
   - **UI MDX**: Validação de componentes MDX para interface

3. **Workflow**:
   - Selecione o tipo de código
   - Escreva no Monaco Editor
   - Execute (Ctrl+Enter ou botão "Executar")
   - Salve como snippet para reutilização
   - Visualize logs de auditoria

4. **Snippets Salvos**:
   - Lista com histórico de versões
   - Carregamento rápido
   - Sistema de busca
   - Backup automático

## 🏗️ Arquitetura

```
app/
├── api/
│   └── admin/           # APIs exclusivas MASTER
│       ├── exec/        # Execução de código
│       ├── snippets/    # CRUD snippets
│       └── audit-logs/  # Logs de auditoria
├── master/             # Área administrativa
│   ├── page.tsx        # Dashboard MASTER
│   └── code/           # Console de Código
├── components/
│   ├── master/         # Componentes MASTER
│   └── ui/             # Design System
└── lib/
    ├── types.ts        # Tipos TypeScript
    └── auth.ts         # Utilitários auth
```

## 🚀 Deploy

### Netlify
```bash
# Build automático via Git
git push origin main

# Ou manual
yarn build
# Upload pasta .next para Netlify
```

### Vercel
```bash
# Deploy via CLI
vercel

# Ou conecte o repositório GitHub
```

## 🔍 Monitoramento

### Logs Disponíveis
- Execuções de código (sucesso/erro)
- Criação/edição/deleção de snippets
- Tentativas de acesso não autorizado
- Rate limiting violations
- Tempo de execução das operações

### Métricas
- Número de execuções por usuário
- Tipos de código mais executados
- Taxa de erro por tipo
- Performance das consultas

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## 👨‍💻 Desenvolvido por

**Sistema de Gestão OS 2.0** - Sistema completo com Console de Código para execução segura de JavaScript, SQL e MDX.

---

⭐ **Principais Diferenciais**:
- Console de Código com Monaco Editor
- Sistema de execução segura multi-linguagem  
- Audit logs completos
- Rate limiting avançado
- Versionamento de snippets
- Interface moderna e responsiva

🔒 **Foco em Segurança**: Todas as execuções são loggeadas, limitadas e executadas em ambiente controlado.
