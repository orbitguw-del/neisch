import * as XLSX from 'xlsx'

/**
 * Download an array of arrays as an .xlsx file.
 * rows[0] is treated as the header row — it gets bold styling.
 */
export function downloadSheet(rows, sheetName, filename) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths: auto-size to the longest value in each column
  const colWidths = rows[0]?.map((_, ci) => ({
    wch: Math.min(40, Math.max(10, ...rows.map((r) => String(r[ci] ?? '').length + 2))),
  })) ?? []
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31))
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

/**
 * Download a workbook with multiple sheets.
 * sheets: [{ name, rows }]
 */
export function downloadWorkbook(sheets, filename) {
  const wb = XLSX.utils.book_new()
  sheets.forEach(({ name, rows }) => {
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const colWidths = rows[0]?.map((_, ci) => ({
      wch: Math.min(40, Math.max(10, ...rows.map((r) => String(r[ci] ?? '').length + 2))),
    })) ?? []
    ws['!cols'] = colWidths
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
  })
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

export function fmtINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}
