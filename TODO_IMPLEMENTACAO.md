# Implementação - Testes Vitest e Recuperação de Senha

## 1. Atualização de Testes Vitest

- [ ] Atualizar auth.test.ts para usar sessão ao invés de JWT
- [ ] Atualizar dre.test.ts para usar sessão
- [ ] Atualizar permissions.test.ts para usar sessão
- [ ] Executar pnpm test e verificar resultados
- [ ] Corrigir falhas se houver

## 2. Recuperação de Senha

### Backend
- [x] Criar tabela password_reset_tokens no schema
- [x] Aplicar migração no banco (pnpm db:push)
- [x] Implementar função generateResetToken em auth.ts
- [x] Implementar função validateResetToken em auth.ts
- [x] Criar endpoint auth.requestPasswordReset
- [x] Criar endpoint auth.resetPassword
- [x] Integrar com sistema de notificação do owner

### Frontend
- [x] Criar página ForgotPassword (/forgot-password)
- [x] Criar página ResetPassword (/reset-password/:token)
- [x] Adicionar link "Esqueci minha senha" na tela de login
- [x] Implementar formulário de solicitação
- [x] Implementar formulário de nova senha
- [x] Adicionar validação e feedback

### Testes
- [ ] Testar fluxo completo de recuperação
- [ ] Validar envio de notificação
- [ ] Validar expiração de token
