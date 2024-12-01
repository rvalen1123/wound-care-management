import * as ExcelJS from 'exceljs';

interface ExportColumn {
  header: string;
  field: string;
  format?: 'currency' | 'date' | 'number';
}

interface ExportOptions {
  title: string;
  data: any[];
  columns: ExportColumn[];
}

export async function exportToExcel({ title, data, columns }: ExportOptions) {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Add columns to the worksheet
  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.field,
    width: 20
  }));

  // Add data to the worksheet
  data.forEach(item => {
    const row: Record<string, any> = {};
    columns.forEach(col => {
      const value = item[col.field];
      if (col.format === 'currency') {
        row[col.field] = formatCurrency(value);
      } else if (col.format === 'date') {
        row[col.field] = formatDate(value);
      } else {
        row[col.field] = value;
      }
    });
    worksheet.addRow(row);
  });

  // Save the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}
