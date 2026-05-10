import { StatementParser } from '../services/statementParser'
import path from 'path'
import fs from 'fs'

const parser = new StatementParser()
const samplesDir = path.join(__dirname, '../database/samples')

const readSample = (fileName: string) => fs.readFileSync(path.join(samplesDir, fileName), 'utf-8')

describe('StatementParser', () => {

  describe('detectBankFormat', () => {
    it('detects GTBank format', () => {
      const headers = ['Transaction Date', 'Debit', 'Credit', 'Balance', 'Remarks']
      const format = parser.detectBankFormat(headers)
      expect(format?.name).toBe('GTBank')
    })

    it('detects Access Bank format', () => {
      const headers = ['Date', 'Trans Type', 'Description', 'DR Amount', 'CR Amount', 'Balance']
      const format = parser.detectBankFormat(headers)
      expect(format?.name).toBe('Access Bank')
    })

    it('detects Zenith Bank format', () => {
      const headers = ['Value Date', 'Transaction Details', 'Withdrawal', 'Deposit', 'Balance']
      const format = parser.detectBankFormat(headers)
      expect(format?.name).toBe('Zenith Bank')
    })

    it('detects First Bank format', () => {
      const headers = ['Date', 'Transaction Details', 'Outflow', 'Inflow', 'Balance']
      const format = parser.detectBankFormat(headers)
      expect(format?.name).toBe('First Bank')
    })

    it('detects UBA format', () => {
      const headers = ['Trans. Date', 'Narration', 'Trans Type', 'CR Amount', 'DR Amount', 'Balance']
      const format = parser.detectBankFormat(headers)
      expect(format?.name).toBe('UBA')
    })

    it('returns null for unknown format', () => {
      const headers = ['Date', 'Description', 'Amount', 'Unknown']
      const format = parser.detectBankFormat(headers)
      expect(format).toBeNull()
    })
  })

  describe('parseAmount', () => {
    it('parses plain numbers', () => {
      expect(parser.parseAmount('85000')).toBe(85000)
    })

    it('parses numbers with commas', () => {
      expect(parser.parseAmount('85,000')).toBe(85000)
    })

    it('parses numbers with Naira symbol', () => {
      expect(parser.parseAmount('₦85,000')).toBe(85000)
    })

    it('returns 0 for empty string', () => {
      expect(parser.parseAmount('')).toBe(0)
    })
  })

  describe('parseDate', () => {
    it('parses DD/MM/YYYY format', () => {
      expect(parser.parseDate('15/03/2026')).toBe('2026-03-15')
    })

    it('parses DD-MM-YYYY format', () => {
      expect(parser.parseDate('15-03-2026')).toBe('2026-03-15')
    })

    it('returns ISO string unchanged', () => {
      expect(parser.parseDate('2026-03-15')).toBe('2026-03-15')
    })
  })

  describe('GTBank CSV parsing', () => {
    it('parses GTBank sample correctly', () => {
      const content = readSample('gtbank_sample.csv')
      const result = parser.parse(content)
      expect(result.bank).toBe('GTBank')
      expect(result.errors.length).toBe(0)
    })

    it('extracts only credit transactions', () => {
      const content = readSample('gtbank_sample.csv')
      const result = parser.parse(content)
      // Should have 9 credits (rows with Credit column filled)
      // Should skip 1 debit (BANK CHARGES row)
      expect(result.transactions.every(tx => tx.amount > 0)).toBe(true)
    })

    it('correctly extracts sender names', () => {
      const content = readSample('gtbank_sample.csv')
      const result = parser.parse(content)
      const names = result.transactions.map(tx => tx.senderName)
      expect(names).toContain('ADEWALE OGUNDIMU')
    })

    it('correctly parses amounts', () => {
      const content = readSample('gtbank_sample.csv')
      const result = parser.parse(content)
      const amounts = result.transactions.map(tx => tx.amount)
      expect(amounts).toContain(85000)
      expect(amounts).toContain(45000)
    })
  })

  describe('Access Bank CSV parsing', () => {
    it('parses Access Bank sample correctly', () => {
      const content = readSample('access_sample.csv')
      const result = parser.parse(content)
      expect(result.bank).toBe('Access Bank')
      expect(result.transactions.length).toBeGreaterThan(0)
    })

    it('skips debit rows', () => {
      const content = readSample('access_sample.csv')
      const result = parser.parse(content)
      // ATM WITHDRAWAL row should be skipped
      const names = result.transactions.map(tx => tx.senderName)
      expect(names).not.toContain('ATM WITHDRAWAL')
    })
  })

  describe('Error handling', () => {
    it('returns error for unknown bank format', () => {
      // Create a temp file with unknown format
      const result = parser.detectBankFormat(['Unknown', 'Columns', 'Here'])
      expect(result).toBeNull()
    })
  })
})
