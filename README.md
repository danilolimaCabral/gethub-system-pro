# ERP Financeiro Administrativo

Sistema web completo multi-tenant para gestão financeira e administrativa de empresas, com controle de caixa, recebíveis, pagáveis, estoque e dashboard executivo.

## 🚀 Características

- **Multi-Tenant**: Suporte para múltiplas empresas em uma única instalação
- **Dashboard Executivo**: Visão consolidada com KPIs e indicadores financeiros
- **Gestão Financeira Completa**: Controle de caixa, recebíveis, pagáveis e projeções
- **Controle de Estoque**: Movimentações e valorização de produtos
- **Importação de Planilhas**: Importação em lote de dados via Excel
- **Interface Moderna**: Design responsivo com tema dark
- **Testes Automatizados**: Cobertura de testes com Vitest
- **Dados de Demonstração**: Seed completo para testes

## 📋 Pré-requisitos

- Node.js 22+
- MySQL/TiDB (ou PostgreSQL com adaptações)
- pnpm 10+

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd erp-financeiro
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=mysql://usuario:senha@host:3306/database
JWT_SECRET=sua-chave-secreta-aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=seu-open-id
OWNER_NAME=Seu Nome
```

### 4. Execute as migrações do banco de dados

```bash
pnpm db:push
```

### 5. (Opcional) Popule o banco com dados de teste

```bash
npx tsx seed-data.mjs
```

### 6. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`

## 🏗️ Estrutura do Projeto

```
erp-financeiro/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas do sistema
│   │   ├── lib/           # Utilitários e configurações
│   │   └── App.tsx        # Configuração de rotas
├── server/                # Backend tRPC
│   ├── db.ts             # Helpers de banco de dados
│   ├── routers.ts        # Routers tRPC
│   ├── import-helper.ts  # Processamento de importações
│   └── _core/            # Infraestrutura do servidor
├── drizzle/              # Schema e migrações
│   └── schema.ts         # Definição das tabelas
├── seed-data.mjs         # Script de seed
└── todo.md               # Lista de funcionalidades
```

## 📊 Módulos do Sistema

### Cadastros
- **Empresas/CNPJs**: Gerenciamento de contas e empresas
- **Categorias**: Categorias financeiras (fixas e variáveis)
- **Marketplaces**: Configuração de marketplaces e taxas
- **Fornecedores**: Cadastro de fornecedores
- **Clientes**: Cadastro de clientes
- **Produtos**: Gestão de produtos e estoque

### Financeiro
- **Caixa Real**: Controle de movimentações diárias
- **Recebíveis**: Contas a receber com status e projeções
- **Pagáveis**: Contas a pagar com classificação de custos
- **Projeção de Caixa**: Projeções automáticas D+7, D+15, D+30
- **DRE Simplificada**: Demonstração de resultados mensal

### Operacional
- **Estoque**: Movimentações e controle de produtos
- **Saldos de Marketplaces**: Controle de valores em marketplaces
- **Dashboard CEO**: Visão executiva com KPIs

## 🔧 Tecnologias Utilizadas

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- tRPC Client
- Wouter (roteamento)
- shadcn/ui (componentes)
- Lucide Icons

### Backend
- Node.js
- Express
- tRPC 11
- Drizzle ORM
- MySQL/TiDB
- Zod (validação)

### Testes
- Vitest

## 🚢 Deploy

### Render

1. Crie um novo Web Service no Render
2. Conecte seu repositório
3. Configure as variáveis de ambiente
4. Build Command: `pnpm install && pnpm build`
5. Start Command: `pnpm start`

### Railway

1. Crie um novo projeto no Railway
2. Adicione um serviço MySQL
3. Conecte seu repositório
4. Configure as variáveis de ambiente
5. Railway detectará automaticamente os comandos

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...
OWNER_OPEN_ID=...
OWNER_NAME=...
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento

# Build
pnpm build            # Compila para produção

# Produção
pnpm start            # Inicia servidor de produção

# Banco de Dados
pnpm db:push          # Aplica migrações

# Testes
pnpm test             # Executa testes

# Qualidade de Código
pnpm check            # Verifica TypeScript
pnpm format           # Formata código
```

## 🔐 Autenticação

O sistema utiliza OAuth via Manus para autenticação. Cada usuário pode:
- Criar múltiplos tenants (empresas)
- Ter diferentes roles em cada tenant (owner, admin, user)
- Acessar apenas os dados do tenant selecionado

## 📦 Importação de Dados

O sistema suporta importação de planilhas Excel para:
- Produtos
- Clientes
- Fornecedores
- Recebíveis
- Pagáveis

Formato esperado: primeira linha com cabeçalhos, dados a partir da segunda linha.

## 🧪 Testes

Execute os testes com:

```bash
pnpm test
```

Os testes cobrem:
- Autenticação e logout
- Gerenciamento de tenants
- CRUD de entidades
- Operações financeiras
- Dashboard e relatórios

## 📈 Dados de Demonstração

O script de seed cria:
- 1 tenant de demonstração
- 2 empresas
- 13 categorias financeiras
- 5 marketplaces
- 3 fornecedores
- 3 clientes
- 15 produtos variados
- 30 registros de fluxo de caixa
- 20 recebíveis
- 20 pagáveis

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é licenciado sob a MIT License.

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.

## 🎯 Roadmap

- [ ] Módulo de DRE completo
- [ ] Gráficos e visualizações avançadas
- [ ] Exportação de relatórios em PDF
- [ ] Integração com APIs de bancos
- [ ] Notificações por email
- [ ] App mobile

## 👥 Autores

Desenvolvido com ❤️ para gestão financeira eficiente.
