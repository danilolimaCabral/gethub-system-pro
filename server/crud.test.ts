import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "local",
    role: "admin",
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

describe("CRUD Operations", () => {
  const ctx = createTestContext();
  const caller = appRouter.createCaller(ctx);

  it("should create and list companies", async () => {
    const company = await caller.company.create({
      tenantId: 1,
      name: "Test Company",
      code: "TESTCO",
      cnpj: "12345678000190",
      email: "company@test.com",
      phone: "11999999999",
      currentBalance: "10000.00",
    });

    expect(company).toBeDefined();
    expect(company.name).toBe("Test Company");

    const list = await caller.company.list({ tenantId: 1 });
    expect(list.length).toBeGreaterThan(0);
  });

  it("should create and list products", async () => {
    const product = await caller.product.create({
      tenantId: 1,
      name: "Test Product",
      sku: "TEST-001",
      costPrice: "50.00",
      salePrice: "99.90",
      currentStock: 100,
    });

    expect(product).toBeDefined();
    expect(product.name).toBe("Test Product");

    const list = await caller.product.list({ tenantId: 1 });
    expect(list.length).toBeGreaterThan(0);
  });

  it("should create and list categories", async () => {
    const category = await caller.category.create({
      tenantId: 1,
      name: "Test Category",
      type: "FIXO",
    });

    expect(category).toBeDefined();
    expect(category.name).toBe("Test Category");

    const list = await caller.category.list({ tenantId: 1 });
    expect(list.length).toBeGreaterThan(0);
  });

  it("should create and list suppliers", async () => {
    const supplier = await caller.supplier.create({
      tenantId: 1,
      name: "Test Supplier",
      cnpj: "98765432000100",
      email: "supplier@test.com",
      phone: "11888888888",
    });

    expect(supplier).toBeDefined();
    expect(supplier.name).toBe("Test Supplier");

    const list = await caller.supplier.list({ tenantId: 1 });
    expect(list.length).toBeGreaterThan(0);
  });

  it("should create and list customers", async () => {
    const customer = await caller.customer.create({
      tenantId: 1,
      name: "Test Customer",
      email: "customer@test.com",
      phone: "11777777777",
      cpfCnpj: "12345678900",
    });

    expect(customer).toBeDefined();
    expect(customer.name).toBe("Test Customer");

    const list = await caller.customer.list({ tenantId: 1 });
    expect(list.length).toBeGreaterThan(0);
  });
});
