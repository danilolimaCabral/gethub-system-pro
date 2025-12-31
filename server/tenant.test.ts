import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Tenant Management", () => {
  it("should list user tenants", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tenant.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new tenant", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const slug = `test-tenant-${Date.now()}`;
    
    const result = await caller.tenant.create({
      name: "Test Tenant",
      slug,
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Test Tenant");
    expect(result.slug).toBe(slug);
  });

  it("should not create tenant with duplicate slug", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const slug = `duplicate-${Date.now()}`;
    
    await caller.tenant.create({
      name: "First Tenant",
      slug,
    });

    await expect(
      caller.tenant.create({
        name: "Second Tenant",
        slug,
      })
    ).rejects.toThrow();
  });
});

describe("Company Management", () => {
  it("should create a company", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.company.create({
      tenantId: 1,
      code: `COMP-${Date.now()}`,
      name: "Test Company",
      cnpj: "12.345.678/0001-90",
      currentBalance: "10000.00",
    });

    expect(result.success).toBe(true);
  });

  it("should list companies for tenant", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.company.list({
      tenantId: 1,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Product Management", () => {
  it("should create a product", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.product.create({
      tenantId: 1,
      sku: `SKU-${Date.now()}`,
      name: "Test Product",
      costPrice: "100.00",
      salePrice: "150.00",
      currentStock: 10,
    });

    expect(result.success).toBe(true);
  });

  it("should list products for tenant", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.product.list({
      tenantId: 1,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("Financial Operations", () => {
  it("should create a receivable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.receivable.create({
      tenantId: 1,
      customerName: "Test Customer",
      channel: "Direct",
      amount: "1000.00",
      expectedDate: new Date(),
    });

    expect(result.success).toBe(true);
  });

  it("should create a payable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.payable.create({
      tenantId: 1,
      beneficiary: "Test Supplier",
      category: "Services",
      amount: "500.00",
      dueDate: new Date(),
      costType: "VARIÁVEL",
    });

    expect(result.success).toBe(true);
  });

  it("should get dashboard summary", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.summary({
      tenantId: 1,
    });

    expect(result).toBeDefined();
    expect(result.currentBalance).toBeDefined();
    expect(result.totalReceivables).toBeDefined();
    expect(result.totalPayables).toBeDefined();
  });
});
