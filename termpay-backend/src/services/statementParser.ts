import Papa from 'papaparse'

export interface ParsedTransaction {
  date: string
  senderName: string
  amount: number
  narration: string
  rawRow: Record<string, string>
}

export interface ParseResult {
  bank: string
  transactions: ParsedTransaction[]
  totalRows: number
  creditRows: number
  skippedRows: number
  errors: string[]
}

// ─── BANK FORMAT DEFINITIONS ──────────────────────────────────────────────────
const BANK_FORMATS = {
  gtbank: {
    name: 'GTBank',
    identifierColumns: ['Transaction Date', 'Debit', 'Credit', 'Balance', 'Remarks'],
    dateCol: 'Transaction Date',
    creditCol: 'Credit',
    debitCol: 'Debit',
    senderCol: 'Remarks',
    narrationCol: 'Remarks',
    isCreditRow: (row: Record<string, string>) => {
      const credit = row['Credit']?.replace(/,/g, '').trim()
      return credit !== undefined && credit !== '' && credit !== '0' && !isNaN(Number(credit))
    }
  },
  access: {
    name: 'Access Bank',
    identifierColumns: ['Date', 'Trans Type', 'Description', 'DR Amount', 'CR Amount'],
    dateCol: 'Date',
    creditCol: 'CR Amount',
    debitCol: 'DR Amount',
    senderCol: 'Description',
    narrationCol: 'Description',
    isCreditRow: (row: Record<string, string>) => {
      const transType = row['Trans Type']?.trim().toUpperCase()
      const crAmount = row['CR Amount']?.replace(/,/g, '').trim()
      return transType === 'CR' ||
        (crAmount !== undefined && crAmount !== '' && crAmount !== '0' && !isNaN(Number(crAmount)))
    }
  },
  zenith: {
    name: 'Zenith Bank',
    identifierColumns: ['Value Date', 'Transaction Details', 'Withdrawal', 'Deposit', 'Balance'],
    dateCol: 'Value Date',
    creditCol: 'Deposit',
    debitCol: 'Withdrawal',
    senderCol: 'Transaction Details',
    narrationCol: 'Transaction Details',
    isCreditRow: (row: Record<string, string>) => {
      const deposit = row['Deposit']?.replace(/,/g, '').trim()
      return deposit !== undefined && deposit !== '' && deposit !== '0' && !isNaN(Number(deposit))
    }
  },
  firstbank: {
    name: 'First Bank',
    identifierColumns: ['Date', 'Transaction Details', 'Outflow', 'Inflow', 'Balance'],
    dateCol: 'Date',
    creditCol: 'Inflow',
    debitCol: 'Outflow',
    senderCol: 'Transaction Details',
    narrationCol: 'Transaction Details',
    isCreditRow: (row: Record<string, string>) => {
      const inflow = row['Inflow']?.replace(/,/g, '').trim()
      return inflow !== undefined && inflow !== '' && inflow !== '0' && !isNaN(Number(inflow))
    }
  },
  uba: {
    name: 'UBA',
    identifierColumns: ['Trans. Date', 'Narration', 'Trans Type', 'CR Amount', 'DR Amount'],
    dateCol: 'Trans. Date',
    creditCol: 'CR Amount',
    debitCol: 'DR Amount',
    senderCol: 'Narration',
    narrationCol: 'Narration',
    isCreditRow: (row: Record<string, string>) => {
      const transType = row['Trans Type']?.trim().toUpperCase()
      const crAmount = row['CR Amount']?.replace(/,/g, '').trim()
      return transType === 'CR' ||
        (crAmount !== undefined && crAmount !== '' && crAmount !== '0' && !isNaN(Number(crAmount)))
    }
  }
}

type BankFormat = typeof BANK_FORMATS[keyof typeof BANK_FORMATS]

// ─── MAIN PARSER CLASS ────────────────────────────────────────────────────────
export class StatementParser {

  // Detect bank format from CSV headers
  detectBankFormat(headers: string[]): BankFormat | null {
    const normalizedHeaders = headers.map(h => h.trim())

    for (const [key, format] of Object.entries(BANK_FORMATS)) {
      const matchCount = format.identifierColumns.filter(col =>
        normalizedHeaders.some(h =>
          h.toLowerCase() === col.toLowerCase()
        )
      ).length

      // Must match at least 4 out of 5 identifier columns
      if (matchCount >= 4) {
        return format
      }
    }

    return null
  }

  // Parse amount string to number
  parseAmount(amountStr: string): number {
    if (!amountStr) return 0
    const cleaned = amountStr
      .replace(/,/g, '')
      .replace(/₦/g, '')
      .replace(/NGN/g, '')
      .trim()
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  // Parse date to ISO format
  parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0]

    // Handle DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Handle DD-MM-YYYY format
    const ddmmyyyyDash = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
    if (ddmmyyyyDash) {
      const [, day, month, year] = ddmmyyyyDash
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Handle YYYY-MM-DD format (already ISO)
    const yyyymmdd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (yyyymmdd) return dateStr

    // Try native Date parsing as fallback
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }

    return new Date().toISOString().split('T')[0]
  }

  // Clean sender name
  cleanSenderName(name: string): string {
    if (!name) return 'UNKNOWN'
    return name
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\.]/g, '')
      .substring(0, 100)
  }

  // Main parse method
  parse(fileContent: string): ParseResult {
    const errors: string[] = []
    let totalRows = 0
    let creditRows = 0
    let skippedRows = 0

    // Remove BOM if present
    const cleanContent = fileContent.replace(/^\uFEFF/, '')

    // Parse CSV
    const parsed = Papa.parse(cleanContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parsed.errors.length > 0) {
      parsed.errors.forEach(e => errors.push(`CSV parse error: ${e.message}`))
    }

    const rows = parsed.data as Record<string, string>[]
    const headers = parsed.meta.fields || []

    // Detect bank format
    const format = this.detectBankFormat(headers)

    if (!format) {
      return {
        bank: 'Unknown',
        transactions: [],
        totalRows: rows.length,
        creditRows: 0,
        skippedRows: rows.length,
        errors: [
          `Unrecognized bank statement format. Detected columns: ${headers.join(', ')}. ` +
          `Supported banks: GTBank, Access Bank, Zenith Bank, First Bank, UBA.`
        ]
      }
    }

    totalRows = rows.length
    const transactions: ParsedTransaction[] = []

    // Process each row
    for (const row of rows) {
      try {
        // Check if this is a credit row
        if (!format.isCreditRow(row)) {
          skippedRows++
          continue
        }

        // Extract amount
        const amountStr = row[format.creditCol]?.replace(/,/g, '').trim()
        const amount = this.parseAmount(amountStr)

        if (amount <= 0) {
          skippedRows++
          continue
        }

        // Extract other fields
        const dateStr = row[format.dateCol]?.trim()
        const senderName = this.cleanSenderName(row[format.senderCol])
        const narration = row[format.narrationCol]?.trim() || ''

        transactions.push({
          date: this.parseDate(dateStr),
          senderName,
          amount,
          narration,
          rawRow: row
        })

        creditRows++

      } catch (err) {
        errors.push(`Error processing row: ${JSON.stringify(row)} — ${err}`)
        skippedRows++
      }
    }

    return {
      bank: format.name,
      transactions,
      totalRows,
      creditRows,
      skippedRows,
      errors
    }
  }

  // Parse from buffer (for uploaded files)
  parseFromBuffer(buffer: Buffer): ParseResult {
    const fileContent = buffer.toString('utf-8')
    return this.parse(fileContent)
  }
}

export const statementParser = new StatementParser()
