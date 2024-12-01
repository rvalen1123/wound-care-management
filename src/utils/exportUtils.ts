import * as XLSX from 'xlsx'

interface ExportColumn {
  header: string
  field: string
  format?: 'currency' | 'date' | 'number'
}

interface ExportOptions {
  title: string
  data: any[]
  columns: ExportColumn[]
}

export async function exportToExcel({ title, data, columns }: ExportOptions) {
  // Format data for Excel
  const formattedData = data.map(item => {
    const row: Record<string, any> = {}
    columns.forEach(col => {
      const value = item[col.field]
      if (col.format === 'currency') {
        row[col.header] = formatCurrency(value)
      } else if (col.format === 'date') {
        row[col.header] = formatDate(value)
      } else {
        row[col.header] = value
      }
    })
    return row
  })

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(formattedData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Report')

  // Save the Excel file
  XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}
