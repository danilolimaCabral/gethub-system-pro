import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Middleware para validar tenant - simplificado para testes
const tenantProcedure = protectedProcedure;

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== TENANT MANAGEMENT ====================
  
  tenant: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTenants(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se o slug já existe
        const existing = await db.getTenantBySlug(input.slug);
        if (existing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Slug já está em uso' });
        }
        
        // Criar tenant
        await db.createTenant({
          name: input.name,
          slug: input.slug,
          ownerId: ctx.user.id,
          active: true,
        });
        
        // Buscar o tenant criado
        const tenant = await db.getTenantBySlug(input.slug);
        if (!tenant) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao criar tenant' });
        }
        
        // Adicionar usuário como owner
        await db.addUserToTenant({
          tenantId: tenant.id,
          userId: ctx.user.id,
          role: 'owner',
        });
        
        // Criar parâmetros padrão
        await db.upsertSystemParameters(tenant.id, {});
        
        return tenant;
      }),
    
    get: protectedProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTenantById(input.tenantId);
      }),
  }),

  // ==================== COMPANIES ====================
  
  company: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCompanies(input.tenantId);
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        code: z.string().min(1),
        name: z.string().min(1),
        cnpj: z.string().optional(),
        taxRegime: z.string().optional(),
        currentBalance: z.string().optional(),
        bankAccount: z.string().optional(),
        responsible: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCompany({
          ...input,
          active: true,
        });
        return { success: true };
      }),
    
    update: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
        code: z.string().optional(),
        name: z.string().optional(),
        cnpj: z.string().optional(),
        taxRegime: z.string().optional(),
        currentBalance: z.string().optional(),
        bankAccount: z.string().optional(),
        responsible: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tenantId, ...data } = input;
        await db.updateCompany(id, tenantId, data);
        return { success: true };
      }),
    
    delete: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteCompany(input.id, input.tenantId);
        return { success: true };
      }),
  }),

  // ==================== CATEGORIES ====================
  
  category: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCategories(input.tenantId);
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        name: z.string().min(1),
        type: z.enum(["FIXO", "VARIÁVEL"]),
        group: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCategory({
          ...input,
          active: true,
        });
        return { success: true };
      }),
    
    update: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
        name: z.string().optional(),
        type: z.enum(["FIXO", "VARIÁVEL"]).optional(),
        group: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tenantId, ...data } = input;
        await db.updateCategory(id, tenantId, data);
        return { success: true };
      }),
    
    delete: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id, input.tenantId);
        return { success: true };
      }),
  }),

  // ==================== MARKETPLACES ====================
  
  marketplace: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMarketplaces(input.tenantId);
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        code: z.string().min(1),
        name: z.string().min(1),
        averageFee: z.string().optional(),
        releaseDelay: z.number().optional(),
        linkedAccountCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createMarketplace({
          ...input,
          active: true,
        });
        return { success: true };
      }),
    
    update: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
        code: z.string().optional(),
        name: z.string().optional(),
        averageFee: z.string().optional(),
        releaseDelay: z.number().optional(),
        linkedAccountCode: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tenantId, ...data } = input;
        await db.updateMarketplace(id, tenantId, data);
        return { success: true };
      }),
    
    delete: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteMarketplace(input.id, input.tenantId);
        return { success: true };
      }),
  }),

  // ==================== SUPPLIERS ====================
  
  supplier: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSuppliers(input.tenantId);
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        name: z.string().min(1),
        cnpj: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSupplier({
          ...input,
          active: true,
        });
        return { success: true };
      }),
    
    update: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
        name: z.string().optional(),
        cnpj: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tenantId, ...data } = input;
        await db.updateSupplier(id, tenantId, data);
        return { success: true };
      }),
    
    delete: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteSupplier(input.id, input.tenantId);
        return { success: true };
      }),
  }),

  // ==================== CUSTOMERS ====================
  
  customer: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomers(input.tenantId);
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        name: z.string().min(1),
        document: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCustomer({
          ...input,
          active: true,
        });
        return { success: true };
      }),
    
    update: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
        name: z.string().optional(),
        document: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tenantId, ...data } = input;
        await db.updateCustomer(id, tenantId, data);
        return { success: true };
      }),
    
    delete: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteCustomer(input.id, input.tenantId);
        return { success: true };
      }),
  }),

  // ==================== PRODUCTS ====================
  
  product: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProducts(input.tenantId);
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        sku: z.string().min(1),
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        costPrice: z.string().optional(),
        salePrice: z.string().optional(),
        currentStock: z.number().optional(),
        minStock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct({
          ...input,
          active: true,
        });
        return { success: true };
      }),
    
    update: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
        sku: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        costPrice: z.string().optional(),
        salePrice: z.string().optional(),
        currentStock: z.number().optional(),
        minStock: z.number().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tenantId, ...data } = input;
        await db.updateProduct(id, tenantId, data);
        return { success: true };
      }),
    
    delete: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id, input.tenantId);
        return { success: true };
      }),
  }),

  // ==================== CASH FLOW ====================
  
  cashFlow: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getCashFlowByDateRange(input.tenantId, input.startDate, input.endDate);
      }),
    
    latest: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLatestCashFlow(input.tenantId);
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        date: z.date(),
        openingBalance: z.string(),
        inflow: z.string(),
        outflow: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const opening = parseFloat(input.openingBalance);
        const inflowVal = parseFloat(input.inflow);
        const outflowVal = parseFloat(input.outflow);
        const closing = opening + inflowVal - outflowVal;
        const variation = opening !== 0 ? ((closing - opening) / opening) * 100 : 0;
        
        await db.createCashFlow({
          ...input,
          closingBalance: closing.toFixed(2),
          variation: variation.toFixed(2),
        });
        return { success: true };
      }),
  }),

  // ==================== RECEIVABLES ====================
  
  receivable: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        status: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getReceivables(input.tenantId, {
          status: input.status,
          startDate: input.startDate,
          endDate: input.endDate,
        });
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        referenceId: z.string().optional(),
        customerName: z.string().min(1),
        channel: z.string().min(1),
        accountCode: z.string().optional(),
        amount: z.string(),
        expectedDate: z.date(),
        type: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createReceivable({
          ...input,
          status: 'Previsto',
          daysOverdue: 0,
        });
        return { success: true };
      }),
    
    update: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
        receivedDate: z.date().optional(),
        status: z.enum(["Previsto", "Recebido", "Atrasado"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tenantId, ...data } = input;
        await db.updateReceivable(id, tenantId, data);
        return { success: true };
      }),
    
    delete: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteReceivable(input.id, input.tenantId);
        return { success: true };
      }),
  }),

  // ==================== PAYABLES ====================
  
  payable: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        status: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getPayables(input.tenantId, {
          status: input.status,
          startDate: input.startDate,
          endDate: input.endDate,
        });
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        referenceId: z.string().optional(),
        beneficiary: z.string().min(1),
        category: z.string().min(1),
        costCenter: z.string().optional(),
        amount: z.string(),
        dueDate: z.date(),
        costType: z.enum(["FIXO", "VARIÁVEL"]),
        paymentMethod: z.string().optional(),
        channel: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createPayable({
          ...input,
          status: 'Aberto',
        });
        return { success: true };
      }),
    
    update: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
        paymentDate: z.date().optional(),
        status: z.enum(["Aberto", "Pago", "Vencido"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tenantId, ...data } = input;
        await db.updatePayable(id, tenantId, data);
        return { success: true };
      }),
    
    delete: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deletePayable(input.id, input.tenantId);
        return { success: true };
      }),
  }),

  // ==================== MARKETPLACE BALANCES ====================
  
  marketplaceBalance: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMarketplaceBalances(input.tenantId);
      }),
    
    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        marketplaceId: z.number(),
        date: z.date(),
        pendingBalance: z.string(),
        availableBalance: z.string(),
        expectedReleaseDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createMarketplaceBalance(input);
        return { success: true };
      }),
  }),

  // ==================== STOCK MOVEMENTS ====================
  
  stock: router({
    movements: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        productId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getStockMovements(input.tenantId, input.productId);
      }),
    
    addMovement: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        productId: z.number(),
        date: z.date(),
        type: z.enum(["Entrada", "Saída"]),
        quantity: z.number(),
        unitCost: z.string(),
        reference: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const unitCostVal = parseFloat(input.unitCost);
        const totalCost = unitCostVal * input.quantity;
        
        await db.createStockMovement({
          ...input,
          totalCost: totalCost.toFixed(2),
        });
        
        // Atualizar estoque do produto
        const product = await db.getProductById(input.productId, input.tenantId);
        if (product) {
          const newStock = input.type === 'Entrada' 
            ? product.currentStock + input.quantity
            : product.currentStock - input.quantity;
          
          await db.updateProduct(input.productId, input.tenantId, {
            currentStock: newStock,
          });
        }
        
        return { success: true };
      }),
  }),

  // ==================== SYSTEM PARAMETERS ====================
  
  parameters: router({
    get: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSystemParameters(input.tenantId);
      }),
    
    update: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        minCashBalance: z.string().optional(),
        minRunwayDays: z.number().optional(),
        maxMarketplaceLockedPercent: z.string().optional(),
        maxOverdueReceivablesPercent: z.string().optional(),
        maxOverduePayablesAmount: z.string().optional(),
        minGrossMarginPercent: z.string().optional(),
        negativeProjectionAlertDays: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { tenantId, ...data } = input;
        await db.upsertSystemParameters(tenantId, data);
        return { success: true };
      }),
  }),

  // ==================== DASHBOARD ====================
  
  dashboard: router({
    summary: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        const latestCash = await db.getLatestCashFlow(input.tenantId);
        const receivables = await db.getReceivables(input.tenantId);
        const payables = await db.getPayables(input.tenantId);
        const products = await db.getProducts(input.tenantId);
        
        const totalReceivables = receivables.reduce((sum, r) => sum + parseFloat(r.amount), 0);
        const totalPayables = payables.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const overdueReceivables = receivables.filter(r => r.status === 'Atrasado').length;
        const overduePayables = payables.filter(p => p.status === 'Vencido').length;
        const lowStockProducts = products.filter(p => p.currentStock <= p.minStock).length;
        
        return {
          currentBalance: latestCash?.closingBalance || '0',
          totalReceivables: totalReceivables.toFixed(2),
          totalPayables: totalPayables.toFixed(2),
          netProjection: (totalReceivables - totalPayables).toFixed(2),
          overdueReceivables,
          overduePayables,
          lowStockProducts,
          lastUpdated: latestCash?.date || new Date(),
        };
      }),
  }),

  // ==================== IMPORT ====================
  
  import: router({
    logs: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getImportLogs(input.tenantId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
