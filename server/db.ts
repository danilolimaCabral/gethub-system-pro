import { eq, and, desc, asc, gte, lte, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  tenants, InsertTenant, Tenant,
  tenantUsers, InsertTenantUser,
  companies, InsertCompany,
  categories, InsertCategory,
  marketplaces, InsertMarketplace,
  suppliers, InsertSupplier,
  customers, InsertCustomer,
  products, InsertProduct,
  cashFlow, InsertCashFlow,
  receivables, InsertReceivable,
  payables, InsertPayable,
  marketplaceBalances, InsertMarketplaceBalance,
  stockMovements, InsertStockMovement,
  systemParameters, InsertSystemParameter,
  importLogs, InsertImportLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER MANAGEMENT ====================

export async function createUser(user: InsertUser): Promise<number> {
  if (!user.email || !user.password) {
    throw new Error("Email and password are required");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(users).values(user);
    return Number(result[0].insertId);
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function updateUser(userId: number, data: { name?: string; email?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function updateUserPassword(userId: number, hashedPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
}

// ==================== TENANT MANAGEMENT ====================

export async function createTenant(data: InsertTenant): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tenants).values(data);
  return Number(result[0].insertId);
}

export async function getTenantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTenantBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserTenants(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      tenant: tenants,
      role: tenantUsers.role,
    })
    .from(tenantUsers)
    .innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
    .where(and(
      eq(tenantUsers.userId, userId),
      eq(tenants.active, true)
    ))
    .orderBy(desc(tenantUsers.createdAt));
  
  return result;
}

export async function addUserToTenant(data: InsertTenantUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(tenantUsers).values(data);
}

// Alias para compatibilidade
export const createTenantUser = addUserToTenant;
export const listUserTenants = getUserTenants;

export async function getUserTenantRole(userId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(tenantUsers)
    .where(and(
      eq(tenantUsers.userId, userId),
      eq(tenantUsers.tenantId, tenantId)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// ==================== COMPANIES ====================

export async function createCompany(data: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(companies).values(data);
}

export async function getCompanies(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(companies).where(eq(companies.tenantId, tenantId)).orderBy(asc(companies.name));
}

export async function getCompanyById(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(companies).where(and(eq(companies.id, id), eq(companies.tenantId, tenantId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCompany(id: number, tenantId: number, data: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(companies).set(data).where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)));
}

export async function deleteCompany(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(companies).where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)));
}

// ==================== CATEGORIES ====================

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(categories).values(data);
}

export async function getCategories(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(categories).where(eq(categories.tenantId, tenantId)).orderBy(asc(categories.name));
}

export async function updateCategory(id: number, tenantId: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(categories).set(data).where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));
}

export async function deleteCategory(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));
}

// ==================== MARKETPLACES ====================

export async function createMarketplace(data: InsertMarketplace) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(marketplaces).values(data);
}

export async function getMarketplaces(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(marketplaces).where(eq(marketplaces.tenantId, tenantId)).orderBy(asc(marketplaces.name));
}

export async function updateMarketplace(id: number, tenantId: number, data: Partial<InsertMarketplace>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(marketplaces).set(data).where(and(eq(marketplaces.id, id), eq(marketplaces.tenantId, tenantId)));
}

export async function deleteMarketplace(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(marketplaces).where(and(eq(marketplaces.id, id), eq(marketplaces.tenantId, tenantId)));
}

// ==================== SUPPLIERS ====================

export async function createSupplier(data: InsertSupplier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(suppliers).values(data);
}

export async function getSuppliers(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(suppliers).where(eq(suppliers.tenantId, tenantId)).orderBy(asc(suppliers.name));
}

export async function updateSupplier(id: number, tenantId: number, data: Partial<InsertSupplier>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(suppliers).set(data).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)));
}

export async function deleteSupplier(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)));
}

// ==================== CUSTOMERS ====================

export async function createCustomer(data: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(customers).values(data);
}

export async function getCustomers(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(customers).where(eq(customers.tenantId, tenantId)).orderBy(asc(customers.name));
}

export async function updateCustomer(id: number, tenantId: number, data: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(customers).set(data).where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)));
}

export async function deleteCustomer(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(customers).where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)));
}

// ==================== PRODUCTS ====================

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(products).values(data);
}

export async function getProducts(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(products).where(eq(products.tenantId, tenantId)).orderBy(asc(products.name));
}

export const listProducts = getProducts;

export async function getProductById(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(products).where(and(eq(products.id, id), eq(products.tenantId, tenantId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProduct(id: number, tenantId: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products).set(data).where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
}

export async function deleteProduct(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(products).where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
}

// ==================== CASH FLOW ====================

export async function createCashFlow(data: InsertCashFlow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(cashFlow).values(data);
}

export async function getCashFlowByDateRange(tenantId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cashFlow)
    .where(and(
      eq(cashFlow.tenantId, tenantId),
      gte(cashFlow.date, startDate),
      lte(cashFlow.date, endDate)
    ))
    .orderBy(asc(cashFlow.date));
}

export async function getLatestCashFlow(tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(cashFlow)
    .where(eq(cashFlow.tenantId, tenantId))
    .orderBy(desc(cashFlow.date))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCashFlow(id: number, tenantId: number, data: Partial<InsertCashFlow>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(cashFlow).set(data).where(and(eq(cashFlow.id, id), eq(cashFlow.tenantId, tenantId)));
}

// ==================== RECEIVABLES ====================

export async function createReceivable(data: InsertReceivable) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(receivables).values(data);
}

export async function getReceivables(tenantId: number, filters?: { status?: string; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(receivables.tenantId, tenantId)];
  
  if (filters?.status) {
    conditions.push(eq(receivables.status, filters.status as any));
  }
  if (filters?.startDate) {
    conditions.push(gte(receivables.expectedDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(receivables.expectedDate, filters.endDate));
  }
  
  return await db.select().from(receivables)
    .where(and(...conditions))
    .orderBy(desc(receivables.expectedDate));
}

export async function updateReceivable(id: number, tenantId: number, data: Partial<InsertReceivable>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(receivables).set(data).where(and(eq(receivables.id, id), eq(receivables.tenantId, tenantId)));
}

export async function deleteReceivable(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(receivables).where(and(eq(receivables.id, id), eq(receivables.tenantId, tenantId)));
}

// ==================== PAYABLES ====================

export async function createPayable(data: InsertPayable) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(payables).values(data);
}

export async function getPayables(tenantId: number, filters?: { status?: string; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(payables.tenantId, tenantId)];
  
  if (filters?.status) {
    conditions.push(eq(payables.status, filters.status as any));
  }
  if (filters?.startDate) {
    conditions.push(gte(payables.dueDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(payables.dueDate, filters.endDate));
  }
  
  return await db.select().from(payables)
    .where(and(...conditions))
    .orderBy(desc(payables.dueDate));
}

export async function updatePayable(id: number, tenantId: number, data: Partial<InsertPayable>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(payables).set(data).where(and(eq(payables.id, id), eq(payables.tenantId, tenantId)));
}

export async function deletePayable(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(payables).where(and(eq(payables.id, id), eq(payables.tenantId, tenantId)));
}

// ==================== MARKETPLACE BALANCES ====================

export async function createMarketplaceBalance(data: InsertMarketplaceBalance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(marketplaceBalances).values(data);
}

export async function getMarketplaceBalances(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    balance: marketplaceBalances,
    marketplace: marketplaces
  })
  .from(marketplaceBalances)
  .innerJoin(marketplaces, eq(marketplaceBalances.marketplaceId, marketplaces.id))
  .where(eq(marketplaceBalances.tenantId, tenantId))
  .orderBy(desc(marketplaceBalances.date));
}

// ==================== STOCK MOVEMENTS ====================

export async function createStockMovement(data: InsertStockMovement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(stockMovements).values(data);
}

export async function getStockMovements(tenantId: number, productId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(stockMovements.tenantId, tenantId)];
  if (productId) {
    conditions.push(eq(stockMovements.productId, productId));
  }
  
  return await db.select({
    movement: stockMovements,
    product: products
  })
  .from(stockMovements)
  .innerJoin(products, eq(stockMovements.productId, products.id))
  .where(and(...conditions))
  .orderBy(desc(stockMovements.date));
}

// ==================== SYSTEM PARAMETERS ====================

export async function getSystemParameters(tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(systemParameters).where(eq(systemParameters.tenantId, tenantId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSystemParameters(tenantId: number, data: Partial<InsertSystemParameter>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSystemParameters(tenantId);
  
  if (existing) {
    await db.update(systemParameters).set(data).where(eq(systemParameters.tenantId, tenantId));
  } else {
    await db.insert(systemParameters).values({ tenantId, ...data } as InsertSystemParameter);
  }
}

// ==================== IMPORT LOGS ====================

export async function createImportLog(data: InsertImportLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(importLogs).values(data);
  return result;
}

export async function getImportLogs(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(importLogs)
    .where(eq(importLogs.tenantId, tenantId))
    .orderBy(desc(importLogs.createdAt));
}

export async function updateImportLog(id: number, data: Partial<InsertImportLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(importLogs).set(data).where(eq(importLogs.id, id));
}

// ==================== DASHBOARD ====================

export async function getDashboardSummary(tenantId: number) {
  const db = await getDb();
  if (!db) return {
    totalCashFlow: "0",
    totalReceivables: "0",
    totalPayables: "0",
    netProjection: "0",
    overdueReceivables: 0,
    overduePayables: 0,
  };

  // Buscar último fluxo de caixa
  const cashFlowResult = await db.select()
    .from(cashFlow)
    .where(eq(cashFlow.tenantId, tenantId))
    .orderBy(desc(cashFlow.date))
    .limit(1);
  
  const latestCashFlow = cashFlowResult.length > 0 ? cashFlowResult[0] : null;

  // Buscar recebíveis
  const receivablesResult = await db.select()
    .from(receivables)
    .where(and(
      eq(receivables.tenantId, tenantId),
      eq(receivables.status, "Previsto")
    ));

  // Buscar pagáveis
  const payablesResult = await db.select()
    .from(payables)
    .where(and(
      eq(payables.tenantId, tenantId),
      eq(payables.status, "Aberto")
    ));

  // Calcular totais
  const totalReceivables = receivablesResult.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const totalPayables = payablesResult.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const netProjection = totalReceivables - totalPayables;

  // Contar atrasados
  const now = new Date();
  const overdueReceivables = receivablesResult.filter(r => new Date(r.expectedDate) < now).length;
  const overduePayables = payablesResult.filter(p => new Date(p.dueDate) < now).length;

  return {
    totalCashFlow: latestCashFlow?.closingBalance || "0",
    totalReceivables: totalReceivables.toFixed(2),
    totalPayables: totalPayables.toFixed(2),
    netProjection: netProjection.toFixed(2),
    overdueReceivables,
    overduePayables,
  };
}

// Aliases para compatibilidade com routers
export const listCustomers = getCustomers;
export const listCashFlow = getCashFlowByDateRange;
export const listReceivables = getReceivables;
export const listPayables = getPayables;
export const listCompanies = getCompanies;
export const listCategories = getCategories;
export const listMarketplaces = getMarketplaces;
export const listSuppliers = getSuppliers;
