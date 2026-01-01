import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index, unique, json } from "drizzle-orm/mysql-core";

/**
 * Sistema ERP Financeiro Multi-Tenant
 * Estrutura de banco de dados completa para gestão financeira e administrativa
 */

// ==================== CORE TABLES ====================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  permissions: json("permissions").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  ownerId: int("ownerId").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerIdx: index("owner_idx").on(table.ownerId),
}));

export const tenantUsers = mysqlTable("tenant_users", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantUserIdx: unique("tenant_user_idx").on(table.tenantId, table.userId),
  tenantIdx: index("tenant_idx").on(table.tenantId),
  userIdx: index("user_idx").on(table.userId),
}));

// ==================== CADASTROS ====================

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  taxRegime: varchar("taxRegime", { length: 100 }),
  currentBalance: decimal("currentBalance", { precision: 15, scale: 2 }).default("0").notNull(),
  bankAccount: varchar("bankAccount", { length: 255 }),
  responsible: varchar("responsible", { length: 255 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantCodeIdx: unique("tenant_code_idx").on(table.tenantId, table.code),
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["FIXO", "VARIÁVEL"]).notNull(),
  group: varchar("group", { length: 255 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

export const marketplaces = mysqlTable("marketplaces", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  averageFee: decimal("averageFee", { precision: 5, scale: 2 }).default("0").notNull(),
  releaseDelay: int("releaseDelay").default(0).notNull(),
  linkedAccountCode: varchar("linkedAccountCode", { length: 50 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantCodeIdx: unique("tenant_code_idx").on(table.tenantId, table.code),
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  contact: varchar("contact", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  document: varchar("document", { length: 20 }),
  contact: varchar("contact", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 255 }),
  costPrice: decimal("costPrice", { precision: 15, scale: 2 }).default("0").notNull(),
  salePrice: decimal("salePrice", { precision: 15, scale: 2 }).default("0").notNull(),
  currentStock: int("currentStock").default(0).notNull(),
  minStock: int("minStock").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantSkuIdx: unique("tenant_sku_idx").on(table.tenantId, table.sku),
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

// ==================== FINANCEIRO ====================

export const cashFlow = mysqlTable("cash_flow", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  date: timestamp("date").notNull(),
  openingBalance: decimal("openingBalance", { precision: 15, scale: 2 }).default("0").notNull(),
  inflow: decimal("inflow", { precision: 15, scale: 2 }).default("0").notNull(),
  outflow: decimal("outflow", { precision: 15, scale: 2 }).default("0").notNull(),
  closingBalance: decimal("closingBalance", { precision: 15, scale: 2 }).default("0").notNull(),
  variation: decimal("variation", { precision: 5, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantDateIdx: unique("tenant_date_idx").on(table.tenantId, table.date),
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

export const receivables = mysqlTable("receivables", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  referenceId: varchar("referenceId", { length: 100 }),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  channel: varchar("channel", { length: 100 }).notNull(),
  accountCode: varchar("accountCode", { length: 50 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  expectedDate: timestamp("expectedDate").notNull(),
  receivedDate: timestamp("receivedDate"),
  status: mysqlEnum("status", ["Previsto", "Recebido", "Atrasado"]).default("Previsto").notNull(),
  daysOverdue: int("daysOverdue").default(0).notNull(),
  type: varchar("type", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  statusIdx: index("status_idx").on(table.status),
  expectedDateIdx: index("expected_date_idx").on(table.expectedDate),
}));

export const payables = mysqlTable("payables", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  referenceId: varchar("referenceId", { length: 100 }),
  beneficiary: varchar("beneficiary", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  costCenter: varchar("costCenter", { length: 255 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paymentDate: timestamp("paymentDate"),
  status: mysqlEnum("status", ["Aberto", "Pago", "Vencido"]).default("Aberto").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  costType: mysqlEnum("costType", ["FIXO", "VARIÁVEL"]).notNull(),
  channel: varchar("channel", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  statusIdx: index("status_idx").on(table.status),
  dueDateIdx: index("due_date_idx").on(table.dueDate),
}));

export const marketplaceBalances = mysqlTable("marketplace_balances", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  marketplaceId: int("marketplaceId").notNull(),
  date: timestamp("date").notNull(),
  pendingBalance: decimal("pendingBalance", { precision: 15, scale: 2 }).default("0").notNull(),
  availableBalance: decimal("availableBalance", { precision: 15, scale: 2 }).default("0").notNull(),
  expectedReleaseDate: timestamp("expectedReleaseDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  marketplaceIdx: index("marketplace_idx").on(table.marketplaceId),
}));

// ==================== ESTOQUE ====================

export const stockMovements = mysqlTable("stock_movements", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  productId: int("productId").notNull(),
  date: timestamp("date").notNull(),
  type: mysqlEnum("type", ["Entrada", "Saída"]).notNull(),
  quantity: int("quantity").notNull(),
  unitCost: decimal("unitCost", { precision: 15, scale: 2 }).default("0").notNull(),
  totalCost: decimal("totalCost", { precision: 15, scale: 2 }).default("0").notNull(),
  reference: varchar("reference", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  productIdx: index("product_idx").on(table.productId),
  dateIdx: index("date_idx").on(table.date),
}));

// ==================== PARÂMETROS ====================

export const systemParameters = mysqlTable("system_parameters", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  minCashBalance: decimal("minCashBalance", { precision: 15, scale: 2 }).default("50000").notNull(),
  minRunwayDays: int("minRunwayDays").default(30).notNull(),
  maxMarketplaceLockedPercent: decimal("maxMarketplaceLockedPercent", { precision: 5, scale: 2 }).default("30").notNull(),
  maxOverdueReceivablesPercent: decimal("maxOverdueReceivablesPercent", { precision: 5, scale: 2 }).default("10").notNull(),
  maxOverduePayablesAmount: decimal("maxOverduePayablesAmount", { precision: 15, scale: 2 }).default("10000").notNull(),
  minGrossMarginPercent: decimal("minGrossMarginPercent", { precision: 5, scale: 2 }).default("25").notNull(),
  negativeProjectionAlertDays: int("negativeProjectionAlertDays").default(7).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: unique("tenant_idx").on(table.tenantId),
}));

// ==================== IMPORTAÇÕES ====================

export const importLogs = mysqlTable("import_logs", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl"),
  importType: varchar("importType", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["Processando", "Sucesso", "Erro", "Parcial"]).default("Processando").notNull(),
  totalRows: int("totalRows").default(0).notNull(),
  successRows: int("successRows").default(0).notNull(),
  errorRows: int("errorRows").default(0).notNull(),
  errorDetails: text("errorDetails"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  userIdx: index("user_idx").on(table.userId),
}));

// ==================== TYPES ====================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = typeof tenantUsers.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Marketplace = typeof marketplaces.$inferSelect;
export type InsertMarketplace = typeof marketplaces.$inferInsert;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type CashFlow = typeof cashFlow.$inferSelect;
export type InsertCashFlow = typeof cashFlow.$inferInsert;

export type Receivable = typeof receivables.$inferSelect;
export type InsertReceivable = typeof receivables.$inferInsert;

export type Payable = typeof payables.$inferSelect;
export type InsertPayable = typeof payables.$inferInsert;

export type MarketplaceBalance = typeof marketplaceBalances.$inferSelect;
export type InsertMarketplaceBalance = typeof marketplaceBalances.$inferInsert;

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

export type SystemParameter = typeof systemParameters.$inferSelect;
export type InsertSystemParameter = typeof systemParameters.$inferInsert;

export type ImportLog = typeof importLogs.$inferSelect;
export type InsertImportLog = typeof importLogs.$inferInsert;


// ==================== ALERTAS FINANCEIROS ====================

export const financialAlerts = mysqlTable("financial_alerts", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  type: mysqlEnum("type", ["receita_baixa", "despesa_alta", "margem_baixa"]).notNull(),
  threshold: decimal("threshold", { precision: 15, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

export const alertHistory = mysqlTable("alert_history", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  alertId: int("alertId").notNull(),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  threshold: decimal("threshold", { precision: 15, scale: 2 }).notNull(),
  message: text("message").notNull(),
  notified: boolean("notified").default(false).notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  alertIdx: index("alert_idx").on(table.alertId),
  triggeredAtIdx: index("triggered_at_idx").on(table.triggeredAt),
}));
