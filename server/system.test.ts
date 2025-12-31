import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    email: "test@example.com",
    password: "hashed",
    name: "Test User",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Sistema ERP - Testes Completos", () => {
  let testTenantId: number;
  let testUserId: number = 1;

  describe("1. Tenant Management", () => {
    it("deve criar um novo tenant", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tenant.create({
        name: "Empresa Teste",
        slug: "empresa-teste",
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe("Empresa Teste");
      testTenantId = result!.id;
    });

    it("deve listar tenants do usuário", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const tenants = await caller.tenant.list();
      expect(Array.isArray(tenants)).toBe(true);
      expect(tenants.length).toBeGreaterThan(0);
    });
  });

  describe("2. Company Management", () => {
    it("deve criar uma empresa/CNPJ", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.company.create({
        tenantId: testTenantId,
        code: "EMP001",
        name: "Empresa Principal LTDA",
        cnpj: "12.345.678/0001-90",
        currentBalance: "50000.00",
        taxRegime: "Simples Nacional",
        bankAccount: "Banco do Brasil - Ag 1234 CC 56789-0",
        responsible: "João Silva",
      });

      expect(result.success).toBe(true);
    });

    it("deve listar empresas do tenant", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const companies = await caller.company.list({ tenantId: testTenantId });
      expect(Array.isArray(companies)).toBe(true);
      expect(companies.length).toBeGreaterThan(0);
    });
  });

  describe("3. Category Management", () => {
    it("deve criar categorias financeiras", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const categories = [
        { name: "Vendas", type: "VARIÁVEL" as const, group: "Receitas" },
        { name: "Aluguel", type: "FIXO" as const, group: "Despesas" },
        { name: "Marketing", type: "VARIÁVEL" as const, group: "Despesas" },
      ];

      for (const category of categories) {
        const result = await caller.category.create({
          tenantId: testTenantId,
          ...category,
        });
        expect(result.success).toBe(true);
      }
    });

    it("deve listar categorias", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const categories = await caller.category.list({ tenantId: testTenantId });
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("4. Marketplace Management", () => {
    it("deve criar marketplaces", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketplace.create({
        tenantId: testTenantId,
        code: "MKT001",
        name: "Mercado Livre",
        averageFee: "12.5",
        releaseDelay: 14,
        linkedAccountCode: "EMP001",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("5. Supplier Management", () => {
    it("deve criar fornecedores", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.supplier.create({
        tenantId: testTenantId,
        name: "Fornecedor ABC LTDA",
        cnpj: "98.765.432/0001-10",
        contact: "Maria Santos",
        email: "contato@fornecedorabc.com",
        phone: "(11) 98765-4321",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("6. Customer Management", () => {
    it("deve criar clientes", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.customer.create({
        tenantId: testTenantId,
        name: "Cliente XYZ Comércio",
        document: "12.345.678/0001-99",
        contact: "Pedro Oliveira",
        email: "contato@clientexyz.com",
        phone: "(11) 91234-5678",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("7. Product Management", () => {
    it("deve criar produtos", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.product.create({
        tenantId: testTenantId,
        sku: "PROD001",
        name: "Produto Teste 1",
        description: "Descrição do produto teste",
        category: "Eletrônicos",
        costPrice: "50.00",
        salePrice: "100.00",
        currentStock: 100,
        minStock: 10,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("8. Cash Flow Management", () => {
    it("deve criar registro de fluxo de caixa", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cashFlow.create({
        tenantId: testTenantId,
        date: new Date(),
        openingBalance: "50000.00",
        inflow: "15000.00",
        outflow: "8000.00",
        closingBalance: "57000.00",
        variation: "7000.00",
        notes: "Movimentação do dia",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("9. Receivables Management", () => {
    it("deve criar recebíveis", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.receivable.create({
        tenantId: testTenantId,
        referenceId: "VND001",
        customerName: "Cliente XYZ",
        channel: "Mercado Livre",
        accountCode: "EMP001",
        amount: "5000.00",
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "Previsto",
        type: "Venda",
        notes: "Venda marketplace",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("10. Payables Management", () => {
    it("deve criar pagáveis", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payable.create({
        tenantId: testTenantId,
        referenceId: "PAG001",
        beneficiary: "Fornecedor ABC",
        category: "Estoque",
        costCenter: "Compras",
        amount: "3000.00",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: "Aberto",
        paymentMethod: "Boleto",
        costType: "VARIÁVEL",
        channel: "Direto",
        notes: "Compra de mercadorias",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("11. Dashboard Summary", () => {
    it("deve retornar resumo do dashboard", async () => {
      const ctx = createTestContext(testUserId);
      const caller = appRouter.createCaller(ctx);

      const summary = await caller.dashboard.summary({ tenantId: testTenantId });
      
      expect(summary).toBeDefined();
      expect(summary.totalCashFlow).toBeDefined();
      expect(summary.totalReceivables).toBeDefined();
      expect(summary.totalPayables).toBeDefined();
    });
  });
});
