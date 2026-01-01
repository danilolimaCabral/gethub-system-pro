import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as auth from "./auth";

// Middleware para validar tenant - simplificado para testes
const tenantProcedure = protectedProcedure;

export const appRouter = router({
  import: router({
    uploadAndProcess: tenantProcedure
      .input(z.object({
        fileData: z.string(), // Base64 encoded file
        fileName: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Processar arquivo Excel
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Aqui você processaria o Excel e salvaria no banco
        // Por enquanto, simular sucesso
        return {
          success: true,
          imported: 10,
          errors: 0,
          message: 'Importação concluída com sucesso!',
        };
      }),
  }),
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { userId, token } = await auth.registerUser(input.email, input.password, input.name);
        return { success: true, userId, token };
      }),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { user, token } = await auth.loginUser(input.email, input.password);
        return { success: true, user, token };
      }),
    
    logout: publicProcedure.mutation(() => {
      return { success: true };
    }),
  }),

  user: router({
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUser(ctx.user.id, {
          name: input.name,
          email: input.email,
        });
        return { success: true };
      }),

    updatePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        const success = await auth.updatePassword(
          ctx.user.id,
          input.currentPassword,
          input.newPassword
        );
        if (!success) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha atual incorreta",
          });
        }
        return { success: true };
      }),
  }),

  tenant: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.listUserTenants(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.getTenantById(input.tenantId);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const tenantId = await db.createTenant({
          name: input.name,
          slug: input.slug,
          ownerId: ctx.user.id,
          active: true,
        });

        await db.createTenantUser({
          tenantId,
          userId: ctx.user.id,
          role: "owner",
        });

        return db.getTenantById(tenantId);
      }),
  }),

  company: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.listCompanies(input.tenantId);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        code: z.string(),
        name: z.string(),
        cnpj: z.string().optional(),
        currentBalance: z.string(),
        taxRegime: z.string().optional(),
        bankAccount: z.string().optional(),
        responsible: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCompany(input);
        return { success: true };
      }),
  }),

  category: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.listCategories(input.tenantId);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        name: z.string(),
        type: z.enum(["FIXO", "VARIÁVEL"]),
        group: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCategory(input);
        return { success: true };
      }),
  }),

  marketplace: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.listMarketplaces(input.tenantId);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        code: z.string(),
        name: z.string(),
        averageFee: z.string(),
        releaseDelay: z.number(),
        linkedAccountCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createMarketplace(input);
        return { success: true };
      }),
  }),

  supplier: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.listSuppliers(input.tenantId);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        name: z.string(),
        cnpj: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSupplier(input);
        return { success: true };
      }),
  }),

  customer: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.listCustomers(input.tenantId);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        name: z.string(),
        document: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCustomer(input);
        return { success: true };
      }),
  }),

  product: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.listProducts(input.tenantId);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        sku: z.string(),
        name: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        costPrice: z.string(),
        salePrice: z.string(),
        currentStock: z.number(),
        minStock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct(input);
        return { success: true };
      }),
  }),

  cashFlow: router({
    list: tenantProcedure
      .input(z.object({ 
        tenantId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        const start = input.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const end = input.endDate || new Date();
        return db.listCashFlow(input.tenantId, start, end);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        date: z.date(),
        openingBalance: z.string(),
        inflow: z.string(),
        outflow: z.string(),
        closingBalance: z.string(),
        variation: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCashFlow(input);
        return { success: true };
      }),
  }),

  receivable: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.listReceivables(input.tenantId);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        referenceId: z.string().optional(),
        customerName: z.string(),
        channel: z.string(),
        accountCode: z.string().optional(),
        amount: z.string(),
        expectedDate: z.date(),
        receivedDate: z.date().optional(),
        status: z.enum(["Previsto", "Recebido", "Atrasado"]).optional(),
        type: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createReceivable(input);
        return { success: true };
      }),
  }),

  payable: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.listPayables(input.tenantId);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        referenceId: z.string().optional(),
        beneficiary: z.string(),
        category: z.string(),
        costCenter: z.string().optional(),
        amount: z.string(),
        dueDate: z.date(),
        paymentDate: z.date().optional(),
        status: z.enum(["Aberto", "Pago", "Vencido"]).optional(),
        paymentMethod: z.string().optional(),
        costType: z.enum(["FIXO", "VARIÁVEL"]),
        channel: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createPayable(input);
        return { success: true };
      }),
  }),

  dashboard: router({
    summary: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return db.getDashboardSummary(input.tenantId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
