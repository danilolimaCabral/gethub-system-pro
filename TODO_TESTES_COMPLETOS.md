# Plano de Testes Completos - ERP Financeiro

**Data:** 01/01/2026  
**Objetivo:** Testar todos os módulos do sistema de forma sistemática

---

## 1. Módulos de Cadastros

### Empresas (/companies)
- [ ] Listar empresas existentes
- [ ] Criar nova empresa
- [ ] Editar empresa existente
- [ ] Deletar empresa
- [ ] Validar campos obrigatórios

### Categorias (/categories)
- [ ] Listar categorias existentes
- [ ] Criar nova categoria (FIXO/VARIÁVEL)
- [ ] Editar categoria existente
- [ ] Deletar categoria
- [ ] Validar tipo de categoria

### Fornecedores (/suppliers)
- [ ] Listar fornecedores existentes
- [ ] Criar novo fornecedor
- [ ] Editar fornecedor existente
- [ ] Deletar fornecedor
- [ ] Validar CNPJ/CPF

### Clientes (/customers)
- [ ] Listar clientes existentes
- [ ] Criar novo cliente
- [ ] Editar cliente existente
- [ ] Deletar cliente
- [ ] Validar dados de contato

### Produtos (/products)
- [ ] Listar produtos existentes
- [ ] Criar novo produto
- [ ] Editar produto existente
- [ ] Deletar produto
- [ ] Validar estoque e preços

---

## 2. Módulos Financeiros

### Caixa (/cash-flow)
- [ ] Listar registros de caixa
- [ ] Visualizar evolução diária
- [ ] Filtrar por período
- [ ] Validar cálculos (saldo, variação)
- [ ] Exportar relatório

### Recebíveis (/receivables)
- [ ] Listar recebíveis
- [ ] Criar novo recebível
- [ ] Editar recebível
- [ ] Marcar como recebido
- [ ] Filtrar por status (Previsto, Recebido, Atrasado)
- [ ] Validar cálculos de totais

### Pagáveis (/payables)
- [ ] Listar pagáveis
- [ ] Criar novo pagável
- [ ] Editar pagável
- [ ] Marcar como pago
- [ ] Filtrar por status (Aberto, Pago, Vencido)
- [ ] Validar cálculos de totais

---

## 3. Dashboard CEO

### Cards de Indicadores
- [ ] Verificar Receita Total (últimos 6 meses)
- [ ] Verificar Despesas Totais (últimos 6 meses)
- [ ] Verificar Lucro e Margem
- [ ] Verificar Saldo Atual e Runway

### Gráficos
- [ ] Gráfico de Evolução de Caixa (6 meses)
- [ ] Gráfico de Recebíveis vs Pagáveis
- [ ] Gráfico de Top 8 Categorias

### Métricas Operacionais
- [ ] Burn Rate diário
- [ ] Runway (meses)
- [ ] Total Recebíveis
- [ ] Total Pagáveis
- [ ] Margem de Lucro

### **PROBLEMA IDENTIFICADO:**
- [ ] Investigar por que Receita/Despesas mostram R$ 0,00
- [ ] Verificar queries no backend
- [ ] Validar tenantId nas queries
- [ ] Corrigir cálculos

---

## 4. Módulo DRE

### Funcionalidades Básicas
- [ ] Selecionar período (mês/ano)
- [ ] Navegar entre meses (← →)
- [ ] Visualizar cards de indicadores
- [ ] Visualizar tabela detalhada

### Gráficos
- [ ] Gráfico de Receitas vs Despesas
- [ ] Gráfico de Evolução Mensal (ano)
- [ ] Validar dados exibidos

### Exportações
- [ ] Exportar para Excel (.xlsx)
- [ ] Exportar para PDF
- [ ] Validar conteúdo dos arquivos
- [ ] Verificar formatação

---

## 5. Sistema de Permissões

### Gerenciamento de Usuários (/users)
- [ ] Listar todos os usuários
- [ ] Visualizar permissões de cada usuário
- [ ] Editar permissões (checkboxes de módulos)
- [ ] Salvar alterações
- [ ] Validar que apenas admin acessa

### Proteção de Rotas
- [ ] Criar usuário de teste sem permissões
- [ ] Fazer login com usuário de teste
- [ ] Verificar que menu oculta itens sem permissão
- [ ] Tentar acessar rota sem permissão (deve bloquear)
- [ ] Validar mensagem de "Acesso negado"

---

## 6. Autenticação e Segurança

### Login/Logout
- [ ] Fazer login com credenciais corretas
- [ ] Tentar login com senha incorreta
- [ ] Validar redirecionamento após login
- [ ] Fazer logout
- [ ] Validar que sessão é limpa

### Recuperação de Senha
- [ ] Acessar "Esqueci minha senha"
- [ ] Solicitar reset com email válido
- [ ] Verificar notificação ao owner
- [ ] Acessar link de reset (se disponível)
- [ ] Redefinir senha
- [ ] Fazer login com nova senha

### Tutorial Interativo
- [ ] Verificar que tutorial aparece no primeiro acesso
- [ ] Navegar pelos 9 passos
- [ ] Pular tutorial
- [ ] Finalizar tutorial
- [ ] Verificar que não aparece novamente
- [ ] Reexibir tutorial via Configurações

---

## 7. Configurações (/settings)

### Dados Pessoais
- [ ] Visualizar dados atuais (nome, email)
- [ ] Editar nome
- [ ] Editar email
- [ ] Salvar alterações
- [ ] Validar que dados foram atualizados

### Segurança
- [ ] Alterar senha
- [ ] Validar senha atual
- [ ] Validar confirmação de senha
- [ ] Salvar nova senha
- [ ] Fazer login com nova senha

### Tutorial
- [ ] Clicar em "Reexibir Tutorial"
- [ ] Verificar que tutorial aparece novamente

---

## 8. Responsividade Mobile

### Testes em Diferentes Resoluções
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Elementos Mobile
- [ ] Menu hamburger funciona
- [ ] Tabelas com scroll horizontal
- [ ] Formulários responsivos
- [ ] Botões com touch target adequado
- [ ] Gráficos adaptam tamanho

---

## 9. PWA (Progressive Web App)

### Instalação
- [ ] Verificar manifest.json carrega
- [ ] Verificar service worker registra
- [ ] Testar instalação no Chrome (desktop)
- [ ] Testar instalação no Safari (iOS)
- [ ] Testar instalação no Chrome (Android)

### Funcionamento Offline
- [ ] Desconectar internet
- [ ] Verificar que app carrega
- [ ] Verificar que cache funciona
- [ ] Reconectar internet
- [ ] Validar sincronização

---

## 10. Performance e UX

### Tempos de Carregamento
- [ ] Tempo de login < 1s
- [ ] Tempo de carregamento de página < 2s
- [ ] Gráficos renderizam rapidamente
- [ ] Tabelas carregam sem lag

### Feedback Visual
- [ ] Loading states aparecem
- [ ] Mensagens de sucesso/erro
- [ ] Validações em tempo real
- [ ] Animações suaves

---

## Resumo de Testes

**Total de Testes:** ~100  
**Testes Concluídos:** 0  
**Testes Falhando:** 0  
**Problemas Identificados:** 1 (Dashboard zerado)

---

## Prioridades

### 🔴 Alta Prioridade
1. Investigar e corrigir Dashboard (Receitas/Despesas R$ 0,00)
2. Testar módulos financeiros (Caixa, Recebíveis, Pagáveis)
3. Validar sistema de permissões

### 🟡 Média Prioridade
4. Testar módulos de cadastros
5. Testar DRE e exportações
6. Validar responsividade mobile

### 🟢 Baixa Prioridade
7. Testar PWA instalação
8. Validar performance
9. Testar recuperação de senha
