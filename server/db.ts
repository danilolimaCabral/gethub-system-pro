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
  importLogs, InsertImportLog,
  passwordResetTokens,
  clientCompanies,
  licenses
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

export async function getTenantByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tenantUsers).where(eq(tenantUsers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
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

export async function updateUserPermissions(userId: number, permissions: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ permissions }).where(eq(users.id, userId));
}

export async function getUserPermissions(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db.select({ permissions: users.permissions }).from(users).where(eq(users.id, userId)).limit(1);
  return user[0]?.permissions || [];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    permissions: users.permissions,
    createdAt: users.createdAt
  }).from(users);
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


// ==================== DRE (DEMONSTRATIVO DE RESULTADOS) ====================

export async function getDREData(tenantId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Data range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get receivables (Receitas)
  const receivablesData = await db
    .select({
      total: sql<number>`SUM(CAST(${receivables.amount} AS DECIMAL(15,2)))`,
    })
    .from(receivables)
    .where(
      and(
        eq(receivables.tenantId, tenantId),
        gte(receivables.expectedDate, startDate),
        lte(receivables.expectedDate, endDate),
        eq(receivables.status, "Recebido")
      )
    );

  // Get payables (Despesas)
  const payablesData = await db
    .select({
      total: sql<number>`SUM(CAST(${payables.amount} AS DECIMAL(15,2)))`,
    })
    .from(payables)
    .where(
      and(
        eq(payables.tenantId, tenantId),
        gte(payables.dueDate, startDate),
        lte(payables.dueDate, endDate),
        eq(payables.status, "Pago")
      )
    );

  const totalReceitas = parseFloat(receivablesData[0]?.total?.toString() || "0");
  const totalDespesas = parseFloat(payablesData[0]?.total?.toString() || "0");

  return {
    month,
    year,
    receitas: totalReceitas,
    despesas: totalDespesas,
    margemBruta: totalReceitas - totalDespesas,
    margemLiquida: ((totalReceitas - totalDespesas) / totalReceitas) * 100 || 0,
  };
}

export async function getDREComparative(tenantId: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const months = [];
  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const receivablesData = await db
      .select({
        total: sql<number>`SUM(CAST(${receivables.amount} AS DECIMAL(15,2)))`,
      })
      .from(receivables)
      .where(
        and(
          eq(receivables.tenantId, tenantId),
          gte(receivables.expectedDate, startDate),
          lte(receivables.expectedDate, endDate),
          eq(receivables.status, "Recebido")
        )
      );

    const payablesData = await db
      .select({
        total: sql<number>`SUM(CAST(${payables.amount} AS DECIMAL(15,2)))`,
      })
      .from(payables)
      .where(
        and(
          eq(payables.tenantId, tenantId),
          gte(payables.dueDate, startDate),
          lte(payables.dueDate, endDate),
          eq(payables.status, "Pago")
        )
      );

    const totalReceitas = parseFloat(receivablesData[0]?.total?.toString() || "0");
    const totalDespesas = parseFloat(payablesData[0]?.total?.toString() || "0");

    months.push({
      month,
      receitas: totalReceitas,
      despesas: totalDespesas,
      lucro: totalReceitas - totalDespesas,
    });
  }

  return months;
}


// Export tables and functions for use in other modules
export { eq, and, or, desc, asc, gte, lte, sql };
export { passwordResetTokens };


// ==================== LICENSING MANAGEMENT ====================

export async function generateLicenseKey(): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 4;
  const segmentLength = 4;
  
  const parts = [];
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(segment);
  }
  
  return parts.join('-');
}

export async function createClientCompany(data: {
  companyName: string;
  cnpj?: string;
  contactName: string;
  email: string;
  phone?: string;
  plan: 'monthly' | 'annual' | 'lifetime';
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Criar tenant para o cliente
  const [tenant] = await db.insert(tenants).values({
    name: data.companyName,
    slug: data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
    ownerId: 1, // Admin do sistema
    active: true,
  });

  const tenantId = Number(tenant.insertId);

  // Criar registro do cliente
  const [client] = await db.insert(clientCompanies).values({
    companyName: data.companyName,
    cnpj: data.cnpj,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    tenantId,
  });

  const clientCompanyId = Number(client.insertId);

  // Gerar licença
  const licenseKey = await generateLicenseKey();
  
  // Calcular data de expiração
  let expiresAt: Date;
  if (data.plan === 'lifetime') {
    expiresAt = new Date('2099-12-31');
  } else if (data.plan === 'annual') {
    expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  await db.insert(licenses).values({
    licenseKey,
    clientCompanyId,
    tenantId,
    status: 'active',
    plan: data.plan,
    expiresAt,
  });

  return { clientCompanyId, tenantId, licenseKey };
}

export async function listClientCompanies() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select({
      id: clientCompanies.id,
      companyName: clientCompanies.companyName,
      cnpj: clientCompanies.cnpj,
      contactName: clientCompanies.contactName,
      email: clientCompanies.email,
      phone: clientCompanies.phone,
      tenantId: clientCompanies.tenantId,
      createdAt: clientCompanies.createdAt,
      licenseKey: licenses.licenseKey,
      licenseStatus: licenses.status,
      plan: licenses.plan,
      expiresAt: licenses.expiresAt,
      activatedAt: licenses.activatedAt,
    })
    .from(clientCompanies)
    .leftJoin(licenses, eq(clientCompanies.id, licenses.clientCompanyId))
    .orderBy(desc(clientCompanies.createdAt));

  return results;
}

export async function validateLicenseKey(licenseKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [license] = await db
    .select({
      id: licenses.id,
      clientCompanyId: licenses.clientCompanyId,
      tenantId: licenses.tenantId,
      status: licenses.status,
      plan: licenses.plan,
      expiresAt: licenses.expiresAt,
      companyName: clientCompanies.companyName,
      cnpj: clientCompanies.cnpj,
      email: clientCompanies.email,
    })
    .from(licenses)
    .leftJoin(clientCompanies, eq(licenses.clientCompanyId, clientCompanies.id))
    .where(eq(licenses.licenseKey, licenseKey))
    .limit(1);

  if (!license) {
    throw new Error("Código de licença inválido");
  }

  if (license.status !== 'active') {
    throw new Error(`Licença ${license.status === 'expired' ? 'expirada' : 'cancelada'}`);
  }

  if (new Date(license.expiresAt) < new Date()) {
    // Atualizar status para expirada
    await db
      .update(licenses)
      .set({ status: 'expired' })
      .where(eq(licenses.id, license.id));
    
    throw new Error("Licença expirada");
  }

  return license;
}

export async function activateLicense(licenseKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(licenses)
    .set({ activatedAt: new Date() })
    .where(eq(licenses.licenseKey, licenseKey));
}

export async function renewLicense(clientCompanyId: number, months: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.clientCompanyId, clientCompanyId))
    .limit(1);

  if (!license) {
    throw new Error("Licença não encontrada");
  }

  const newExpiresAt = new Date(license.expiresAt);
  newExpiresAt.setMonth(newExpiresAt.getMonth() + months);

  await db
    .update(licenses)
    .set({ 
      expiresAt: newExpiresAt,
      status: 'active'
    })
    .where(eq(licenses.id, license.id));

  return { expiresAt: newExpiresAt };
}

export async function cancelLicense(clientCompanyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(licenses)
    .set({ status: 'cancelled' })
    .where(eq(licenses.clientCompanyId, clientCompanyId));
}

export async function checkLicenseStatus(tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.tenantId, tenantId))
    .limit(1);

  if (!license) {
    return { valid: false, reason: 'no_license' };
  }

  if (license.status !== 'active') {
    return { valid: false, reason: license.status };
  }

  const now = new Date();
  const expiresAt = new Date(license.expiresAt);
  
  if (expiresAt < now) {
    // Atualizar status
    await db
      .update(licenses)
      .set({ status: 'expired' })
      .where(eq(licenses.id, license.id));
    
    return { valid: false, reason: 'expired' };
  }

  // Verificar se está próximo de expirar (7 dias)
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const warning = daysUntilExpiry <= 7;

  return { 
    valid: true, 
    warning, 
    daysUntilExpiry,
    expiresAt: license.expiresAt,
    plan: license.plan
  };
}
