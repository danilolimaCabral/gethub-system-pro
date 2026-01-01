import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('DRE Endpoints', () => {
  let testUserId: number;
  let testTenantId: number;
  let testCompanyId: number;
  let testCategoryId: number;

  beforeAll(async () => {
    // Criar dados de teste
    testUserId = await db.createUser({
      email: `dre-test-${Date.now()}@example.com`,
      password: 'hashedpassword',
      name: 'DRE Test User',
      role: 'admin',
    });

    testTenantId = await db.createTenant({
      name: 'Test Tenant DRE',
      slug: `test-dre-${Date.now()}`,
      ownerId: testUserId,
    });

    await db.addUserToTenant(testUserId, testTenantId);

    testCompanyId = await db.createCompany({
      tenantId: testTenantId,
      name: 'Test Company DRE',
      cnpj: '12345678000199',
    });

    testCategoryId = await db.createCategory({
      tenantId: testTenantId,
      name: 'Test Category',
      type: 'receita',
    });

    // Criar algumas receitas e despesas de teste
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Receitas
    await db.createReceivable({
      tenantId: testTenantId,
      companyId: testCompanyId,
      categoryId: testCategoryId,
      description: 'Receita Teste 1',
      amount: '1000.00',
      dueDate: new Date(currentYear, currentMonth - 1, 15),
      status: 'recebido',
      receivedDate: new Date(currentYear, currentMonth - 1, 15),
    });

    await db.createReceivable({
      tenantId: testTenantId,
      companyId: testCompanyId,
      categoryId: testCategoryId,
      description: 'Receita Teste 2',
      amount: '2000.00',
      dueDate: new Date(currentYear, currentMonth - 1, 20),
      status: 'recebido',
      receivedDate: new Date(currentYear, currentMonth - 1, 20),
    });

    // Despesas
    const despesaCategoryId = await db.createCategory({
      tenantId: testTenantId,
      name: 'Test Category Despesa',
      type: 'despesa',
    });

    await db.createPayable({
      tenantId: testTenantId,
      companyId: testCompanyId,
      categoryId: despesaCategoryId,
      description: 'Despesa Teste 1',
      amount: '500.00',
      dueDate: new Date(currentYear, currentMonth - 1, 10),
      status: 'pago',
      paidDate: new Date(currentYear, currentMonth - 1, 10),
    });

    await db.createPayable({
      tenantId: testTenantId,
      companyId: testCompanyId,
      categoryId: despesaCategoryId,
      description: 'Despesa Teste 2',
      amount: '800.00',
      dueDate: new Date(currentYear, currentMonth - 1, 25),
      status: 'pago',
      paidDate: new Date(currentYear, currentMonth - 1, 25),
    });
  });

  afterAll(async () => {
    // Limpar dados de teste
    const database = await db.getDb();
    if (database) {
      await database.delete(db.receivables).where(db.eq(db.receivables.tenantId, testTenantId));
      await database.delete(db.payables).where(db.eq(db.payables.tenantId, testTenantId));
      await database.delete(db.categories).where(db.eq(db.categories.tenantId, testTenantId));
      await database.delete(db.companies).where(db.eq(db.companies.tenantId, testTenantId));
      await database.delete(db.tenantUsers).where(db.eq(db.tenantUsers.tenantId, testTenantId));
      await database.delete(db.tenants).where(db.eq(db.tenants.id, testTenantId));
      await database.delete(db.users).where(db.eq(db.users.id, testUserId));
    }
  });

  describe('dre.getMonthly', () => {
    it('deve retornar DRE mensal com dados corretos', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user, tenantId: testTenantId });

      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const result = await caller.dre.getMonthly({ month, year });

      expect(result).toBeDefined();
      expect(result.receitas).toBe(3000); // 1000 + 2000
      expect(result.despesas).toBe(1300); // 500 + 800
      expect(result.margemBruta).toBe(1700); // 3000 - 1300
      expect(result.margemLiquida).toBe(1700); // Sem impostos/deduções
      expect(result.percentualMargemBruta).toBeCloseTo(56.67, 1); // (1700/3000) * 100
      expect(result.percentualMargemLiquida).toBeCloseTo(56.67, 1);
    });

    it('deve retornar DRE vazio para mês sem movimentações', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user, tenantId: testTenantId });

      const result = await caller.dre.getMonthly({ month: 1, year: 2020 });

      expect(result).toBeDefined();
      expect(result.receitas).toBe(0);
      expect(result.despesas).toBe(0);
      expect(result.margemBruta).toBe(0);
      expect(result.margemLiquida).toBe(0);
    });

    it('deve falhar se usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null, tenantId: testTenantId });

      await expect(
        caller.dre.getMonthly({ month: 1, year: 2024 })
      ).rejects.toThrow();
    });
  });

  describe('dre.getComparative', () => {
    it('deve retornar comparativo anual com 12 meses', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user, tenantId: testTenantId });

      const currentYear = new Date().getFullYear();
      const result = await caller.dre.getComparative({ year: currentYear });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(12);

      // Verificar estrutura de cada mês
      result.forEach((monthData) => {
        expect(monthData).toHaveProperty('mes');
        expect(monthData).toHaveProperty('receitas');
        expect(monthData).toHaveProperty('despesas');
        expect(monthData).toHaveProperty('margemBruta');
        expect(monthData).toHaveProperty('margemLiquida');
        expect(monthData.mes).toMatch(/^\d{4}-\d{2}$/);
      });
    });

    it('deve falhar se usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null, tenantId: testTenantId });

      await expect(
        caller.dre.getComparative({ year: 2024 })
      ).rejects.toThrow();
    });
  });

  describe('dre.exportExcel', () => {
    it('deve exportar DRE para Excel', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user, tenantId: testTenantId });

      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const result = await caller.dre.exportExcel({ month, year });

      expect(result).toBeDefined();
      expect(result.filename).toContain('.xlsx');
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('deve falhar se usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null, tenantId: testTenantId });

      await expect(
        caller.dre.exportExcel({ month: 1, year: 2024 })
      ).rejects.toThrow();
    });
  });

  describe('dre.exportPDF', () => {
    it('deve exportar DRE para PDF', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user, tenantId: testTenantId });

      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const result = await caller.dre.exportPDF({ month, year });

      expect(result).toBeDefined();
      expect(result.filename).toContain('.pdf');
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('deve falhar se usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null, tenantId: testTenantId });

      await expect(
        caller.dre.exportPDF({ month: 1, year: 2024 })
      ).rejects.toThrow();
    });
  });
});
