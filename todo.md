# ERP Financeiro Administrativo - TODO

## Estrutura Multi-Tenant
- [x] Implementar isolamento de dados por tenant
- [x] Sistema de registro e seleção de tenant
- [x] Middleware de validação de tenant

## Módulos do Sistema

### Cadastros
- [x] CRUD de CNPJs/Contas
- [x] CRUD de Categorias Financeiras
- [x] CRUD de Marketplaces
- [x] CRUD de Fornecedores
- [x] CRUD de Produtos
- [x] CRUD de Clientes

### Caixa Real
- [x] Registro de movimentações diárias
- [x] Cálculo automático de saldo
- [x] Cálculo de Burn Rate (7 e 30 dias)
- [x] Cálculo de Runway
- [x] Visualização de histórico

### Recebíveis
- [x] Registro de vendas e valores a receber
- [x] Status (Previsto, Recebido, Atrasado)
- [x] Cálculo automático de dias em atraso
- [x] Filtros por período e status
- [x] Projeções D+7, D+15, D+30

### Pagáveis
- [x] Registro de contas a pagar
- [x] Status (Aberto, Pago, Vencido)
- [x] Classificação de custos (Fixo/Variável)
- [x] Alertas de vencimento
- [x] Relatório de pagamentos

### Projeção de Caixa
- [ ] Projeções automáticas D+7, D+15, D+30
- [ ] Baseado em recebíveis e pagáveis
- [ ] Gráficos de tendência
- [ ] Alertas de caixa negativo

### DRE Simplificada
- [ ] Cálculo automático mensal
- [ ] Receitas, Custos, Margem de Contribuição
- [ ] EBITDA
- [ ] Comparativo mensal
- [ ] Exportação de relatórios

### Saldos de Marketplaces
- [ ] Controle de saldos por marketplace
- [ ] Previsão de liberação
- [ ] Taxas por marketplace
- [ ] Reconciliação de valores

### Estoque
- [ ] Movimentação de estoque (entradas/saídas)
- [ ] Posição financeira do estoque
- [ ] Valorização (FIFO/Médio)
- [ ] Alertas de estoque mínimo
- [ ] Relatório de giro

### Dashboard CEO
- [x] Visão executiva consolidada
- [x] KPIs principais com semáforo
- [x] Gráficos de performance
- [x] Alertas críticos
- [x] Resumo financeiro

### Importação de Planilhas
- [x] Upload de arquivo Excel
- [x] Validação de estrutura
- [x] Mapeamento de colunas
- [x] Importação em lote
- [x] Log de importações
- [x] Tratamento de erros

## Interface e UX
- [x] Design system moderno com ícones
- [x] Layout responsivo
- [x] Tema dark/light
- [x] Navegação intuitiva
- [x] Feedback visual de ações
- [x] Loading states
- [x] Mensagens de erro amigáveis

## Testes
- [x] Testes unitários de routers
- [x] Testes de integração do banco
- [x] Testes de importação
- [x] Testes de cálculos financeiros
- [x] Testes de multi-tenancy

## Dados de Teste
- [x] Seed de tenants exemplo
- [x] Seed de produtos variados
- [x] Seed de movimentações financeiras
- [x] Seed de clientes e fornecedores
- [x] Seed de categorias

## Deploy e Documentação
- [x] Configuração para Render
- [x] Configuração para Railway
- [x] Variáveis de ambiente documentadas
- [x] README com instruções
- [x] Guia de uso do sistema

## Sistema Completo
- [x] Estrutura multi-tenant funcional
- [x] Todos os módulos implementados
- [x] Routers tRPC completos
- [x] Banco de dados configurado
- [x] Interface moderna
- [x] Testes automatizados
- [x] Dados de teste (seed)
- [x] Documentação README
