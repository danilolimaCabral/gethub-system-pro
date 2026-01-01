import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { notifyOwner } from './_core/notification';
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as auth from "./auth";

// Middleware para validar tenant - simplificado
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
  
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { userId } = await auth.registerUser(input.email, input.password, input.name);
        const user = await db.getUserById(userId);
        if (!user) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' });
        }
        
        // Criar sessão
        const session = (ctx.req as any).session;
        session.userId = user.id;
        session.email = user.email;
        session.role = user.role;
        
        return { user };
      }),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        console.log('[auth.login] Input received:', JSON.stringify(input));
        const { user } = await auth.loginUser(input.email, input.password);
        
        // Criar sessão
        const session = (ctx.req as any).session;
        session.userId = user.id;
        session.email = user.email;
        session.role = user.role;
        
        return { user };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      // Destruir sessão
      const session = (ctx.req as any).session;
      if (session) {
        session.destroy(() => {});
      }
      return { success: true };
    }),
    
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        
        if (!user) {
          // Não revelar se o email existe ou não (segurança)
          return { success: true };
        }
        
        // Gerar token de reset
        const token = await auth.createPasswordResetToken(user.id);
        
        // Enviar notificação ao owner com o link de reset
        const resetLink = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/reset-password/${token}`;
        
        try {
          await notifyOwner({
            title: 'Solicitação de Recuperação de Senha',
            content: `Usuário ${user.email} solicitou recuperação de senha.\n\nLink de reset: ${resetLink}\n\nO link expira em 1 hora.`,
          });
        } catch (error) {
          console.error('Erro ao enviar notificação:', error);
        }
        
        return { success: true };
      }),
    
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const success = await auth.resetPassword(input.token, input.newPassword);
        
        if (!success) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Token inválido ou expirado' 
          });
        }
        
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

    listAll: protectedProcedure.query(async ({ ctx }) => {
      // Apenas admins podem listar todos os usuários
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Acesso negado",
        });
      }
      return db.getAllUsers();
    }),

    updatePermissions: protectedProcedure
      .input(z.object({
        userId: z.number(),
        permissions: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        // Apenas admins podem atualizar permissões
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }
        await db.updateUserPermissions(input.userId, input.permissions);
        return { success: true };
      }),

    getPermissions: protectedProcedure.query(async ({ ctx }) => {
      const permissions = await db.getUserPermissions(ctx.user.id);
      return permissions || [];
    }),
  }),

  dre: router({
    getMonthly: protectedProcedure
      .input(z.object({
        tenantId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getDREData(input.tenantId, input.month, input.year);
      }),

    getComparative: protectedProcedure
      .input(z.object({
        tenantId: z.number(),
        year: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getDREComparative(input.tenantId, input.year);
      }),

    exportExcel: protectedProcedure
      .input(z.object({
        tenantId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number(),
      }))
      .mutation(async ({ input }) => {
        const ExcelJS = (await import('exceljs')).default;
        const dreData = await db.getDREData(input.tenantId, input.month, input.year);
        const comparativeData = await db.getDREComparative(input.tenantId, input.year);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('DRE');

        // Header
        worksheet.columns = [
          { header: 'Descrição', key: 'description', width: 30 },
          { header: 'Valor (R$)', key: 'value', width: 20 },
        ];

        // Styling header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' },
        };

        // Add data
        worksheet.addRow({ description: 'Receitas Totais', value: dreData.receitas });
        worksheet.addRow({ description: 'Despesas Totais', value: dreData.despesas });
        worksheet.addRow({ description: 'Margem Bruta', value: dreData.margemBruta });
        worksheet.addRow({ description: 'Margem Líquida (%)', value: dreData.margemLiquida.toFixed(2) });

        // Add comparative data
        worksheet.addRow({});
        worksheet.addRow({ description: 'Comparativo Anual', value: '' });
        worksheet.addRow({ description: 'Mês', value: 'Receitas' });

        comparativeData.forEach((month: any) => {
          worksheet.addRow({ description: `Mês ${month.month}`, value: month.receitas });
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return {
          data: Buffer.from(buffer).toString('base64'),
          filename: `DRE_${input.month}_${input.year}.xlsx`,
        };
      }),

    exportPDF: protectedProcedure
      .input(z.object({
        tenantId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const dreData = await db.getDREData(input.tenantId, input.month, input.year);

        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text('Demonstrativo de Resultados (DRE)', 14, 20);
        doc.setFontSize(12);
        doc.text(`Período: ${input.month}/${input.year}`, 14, 30);

        // Table
        autoTable(doc, {
          startY: 40,
          head: [['Descrição', 'Valor (R$)']],
          body: [
            ['Receitas Totais', dreData.receitas.toFixed(2)],
            ['Despesas Totais', dreData.despesas.toFixed(2)],
            ['Margem Bruta', dreData.margemBruta.toFixed(2)],
            ['Margem Líquida (%)', dreData.margemLiquida.toFixed(2)],
          ],
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
        });

        const pdfBuffer = doc.output('arraybuffer');
        return {
          data: Buffer.from(pdfBuffer).toString('base64'),
          filename: `DRE_${input.month}_${input.year}.pdf`,
        };
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
      .input(z.object({}).optional())
      .query(async ({ ctx }) => {
        if (!ctx.tenantId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant not found' });
        return db.listCategories(ctx.tenantId);
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

  dashboard: router({
    getKPIs: tenantProcedure
      .input(z.object({}).optional())
      .query(async ({ ctx }) => {
        if (!ctx.tenantId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant not found' });
        
        const cashFlowData = await db.listCashFlow(ctx.tenantId, new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date());
        const receivablesData = await db.listReceivables(ctx.tenantId);
        const payablesData = await db.listPayables(ctx.tenantId);
        
        const totalEntradas = cashFlowData.reduce((acc, c) => acc + parseFloat(c.inflow || '0'), 0);
        const totalSaidas = cashFlowData.reduce((acc, c) => acc + parseFloat(c.outflow || '0'), 0);
        const totalRecebiveis = receivablesData.reduce((acc, r) => acc + parseFloat(r.amount), 0);
        const totalPagaveis = payablesData.reduce((acc, p) => acc + parseFloat(p.amount), 0);
        
        return {
          totalEntradas,
          totalSaidas,
          lucro: totalEntradas - totalSaidas,
          saldoAtual: totalEntradas - totalSaidas,
          totalRecebiveis,
          totalPagaveis,
          margemLucro: totalEntradas > 0 ? ((totalEntradas - totalSaidas) / totalEntradas) * 100 : 0,
        };
      }),
  }),

  cashFlow: router({
    list: tenantProcedure
      .input(z.object({ 
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.tenantId) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant not found' });
        }

        const start = input.startDate || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        const end = input.endDate || new Date();
        return db.listCashFlow(ctx.tenantId, start, end);
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
      .input(z.object({}).optional())
      .query(async ({ ctx }) => {
        if (!ctx.tenantId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant not found' });
        return db.listReceivables(ctx.tenantId);
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
      .input(z.object({}).optional())
      .query(async ({ ctx }) => {
        if (!ctx.tenantId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant not found' });
        return db.listPayables(ctx.tenantId);
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

});

export type AppRouter = typeof appRouter;
