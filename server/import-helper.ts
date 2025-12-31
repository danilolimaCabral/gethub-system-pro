import * as XLSX from 'xlsx';
import * as db from './db';

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: string[];
}

export async function importExcelData(
  tenantId: number,
  userId: number,
  fileBuffer: Buffer,
  fileName: string,
  importType: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    totalRows: 0,
    successRows: 0,
    errorRows: 0,
    errors: [],
  };

  try {
    // Criar log de importação
    const logResult = await db.createImportLog({
      tenantId,
      userId,
      fileName,
      importType,
      status: 'Processando',
      totalRows: 0,
      successRows: 0,
      errorRows: 0,
    });

    const logId = (logResult as any).insertId;

    // Ler arquivo Excel
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Processar baseado no tipo de importação
    switch (importType) {
      case 'products':
        await importProducts(tenantId, workbook, result);
        break;
      case 'customers':
        await importCustomers(tenantId, workbook, result);
        break;
      case 'suppliers':
        await importSuppliers(tenantId, workbook, result);
        break;
      case 'receivables':
        await importReceivables(tenantId, workbook, result);
        break;
      case 'payables':
        await importPayables(tenantId, workbook, result);
        break;
      default:
        result.errors.push(`Tipo de importação não suportado: ${importType}`);
    }

    // Atualizar log
    await db.updateImportLog(logId, {
      status: result.errorRows === 0 ? 'Sucesso' : result.successRows > 0 ? 'Parcial' : 'Erro',
      totalRows: result.totalRows,
      successRows: result.successRows,
      errorRows: result.errorRows,
      errorDetails: result.errors.join('\n'),
      completedAt: new Date(),
    });

    result.success = result.successRows > 0;
  } catch (error) {
    result.errors.push(`Erro ao processar arquivo: ${error}`);
  }

  return result;
}

async function importProducts(tenantId: number, workbook: XLSX.WorkBook, result: ImportResult) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  result.totalRows = data.length;

  for (const row of data as any[]) {
    try {
      await db.createProduct({
        tenantId,
        sku: row.SKU || row.sku || `PROD-${Date.now()}`,
        name: row.Nome || row.name || row.Produto || 'Produto sem nome',
        description: row.Descrição || row.description || row.Descricao || '',
        category: row.Categoria || row.category || '',
        costPrice: (row['Preço Custo'] || row.costPrice || row['Preco Custo'] || 0).toString(),
        salePrice: (row['Preço Venda'] || row.salePrice || row['Preco Venda'] || 0).toString(),
        currentStock: parseInt(row.Estoque || row.stock || row.currentStock || 0),
        minStock: parseInt(row['Estoque Mínimo'] || row.minStock || row['Estoque Minimo'] || 0),
        active: true,
      });
      result.successRows++;
    } catch (error) {
      result.errorRows++;
      result.errors.push(`Erro na linha ${result.successRows + result.errorRows}: ${error}`);
    }
  }
}

async function importCustomers(tenantId: number, workbook: XLSX.WorkBook, result: ImportResult) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  result.totalRows = data.length;

  for (const row of data as any[]) {
    try {
      await db.createCustomer({
        tenantId,
        name: row.Nome || row.name || row.Cliente || 'Cliente sem nome',
        document: row.CPF || row.CNPJ || row.document || row.Documento || '',
        contact: row.Contato || row.contact || '',
        email: row.Email || row.email || '',
        phone: row.Telefone || row.phone || row.Fone || '',
        active: true,
      });
      result.successRows++;
    } catch (error) {
      result.errorRows++;
      result.errors.push(`Erro na linha ${result.successRows + result.errorRows}: ${error}`);
    }
  }
}

async function importSuppliers(tenantId: number, workbook: XLSX.WorkBook, result: ImportResult) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  result.totalRows = data.length;

  for (const row of data as any[]) {
    try {
      await db.createSupplier({
        tenantId,
        name: row.Nome || row.name || row.Fornecedor || 'Fornecedor sem nome',
        cnpj: row.CNPJ || row.cnpj || '',
        contact: row.Contato || row.contact || '',
        email: row.Email || row.email || '',
        phone: row.Telefone || row.phone || row.Fone || '',
        active: true,
      });
      result.successRows++;
    } catch (error) {
      result.errorRows++;
      result.errors.push(`Erro na linha ${result.successRows + result.errorRows}: ${error}`);
    }
  }
}

async function importReceivables(tenantId: number, workbook: XLSX.WorkBook, result: ImportResult) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  result.totalRows = data.length;

  for (const row of data as any[]) {
    try {
      const expectedDate = parseExcelDate(row['Data Prevista'] || row.expectedDate || row['Data']);
      
      await db.createReceivable({
        tenantId,
        referenceId: row.ID || row.Referencia || '',
        customerName: row.Cliente || row.customer || row.customerName || 'Cliente',
        channel: row.Canal || row.channel || 'Direto',
        accountCode: row.Conta || row.accountCode || '',
        amount: (row.Valor || row.amount || 0).toString(),
        expectedDate,
        type: row.Tipo || row.type || 'Venda',
        notes: row.Observação || row.notes || row.Obs || '',
        status: 'Previsto',
        daysOverdue: 0,
      });
      result.successRows++;
    } catch (error) {
      result.errorRows++;
      result.errors.push(`Erro na linha ${result.successRows + result.errorRows}: ${error}`);
    }
  }
}

async function importPayables(tenantId: number, workbook: XLSX.WorkBook, result: ImportResult) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  result.totalRows = data.length;

  for (const row of data as any[]) {
    try {
      const dueDate = parseExcelDate(row.Vencimento || row.dueDate || row['Data']);
      
      await db.createPayable({
        tenantId,
        referenceId: row.ID || row.Referencia || '',
        beneficiary: row.Favorecido || row.beneficiary || row.Fornecedor || 'Fornecedor',
        category: row.Categoria || row.category || 'Despesa',
        costCenter: row['Centro Custo'] || row.costCenter || '',
        amount: (row.Valor || row.amount || 0).toString(),
        dueDate,
        costType: (row['Tipo Custo'] || row.costType || 'VARIÁVEL') as any,
        paymentMethod: row['Forma Pagamento'] || row.paymentMethod || '',
        channel: row.Canal || row.channel || '',
        notes: row.Observação || row.notes || row.Obs || '',
        status: 'Aberto',
      });
      result.successRows++;
    } catch (error) {
      result.errorRows++;
      result.errors.push(`Erro na linha ${result.successRows + result.errorRows}: ${error}`);
    }
  }
}

function parseExcelDate(value: any): Date {
  if (!value) return new Date();
  
  if (value instanceof Date) {
    return value;
  }
  
  // Excel serial date
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return new Date(date.y, date.m - 1, date.d);
  }
  
  // String date
  if (typeof value === 'string') {
    return new Date(value);
  }
  
  return new Date();
}
