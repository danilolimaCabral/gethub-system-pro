import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exportar dados para Excel
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Dados') {
  // Criar workbook
  const wb = XLSX.utils.book_new();
  
  // Criar worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Salvar arquivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Exportar dados para PDF
 */
export function exportToPDF(
  data: any[],
  columns: { header: string; dataKey: string }[],
  filename: string,
  title: string
) {
  // Criar documento PDF
  const doc = new jsPDF();
  
  // Adicionar título
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  // Adicionar data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
  
  // Adicionar tabela
  autoTable(doc, {
    startY: 30,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey] || '')),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });
  
  // Salvar PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Formatar valor monetário para exportação
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formatar data para exportação
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}
