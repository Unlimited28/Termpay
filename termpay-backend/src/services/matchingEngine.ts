import { distance } from 'fastest-levenshtein'
import { supabaseAdmin } from '../config/supabase'

export interface MatchResult {
  transactionId: string
  matchedStudentId: string | null
  matchedBillId: string | null
  confidence: 'HIGH' | 'MEDIUM' | 'NEEDS_REVIEW' | 'UNMATCHED'
  score: number
  reason: string
}

export interface MatchingSummary {
  total: number
  high: number
  medium: number
  needsReview: number
  unmatched: number
}

// ─── SCORING CONSTANTS ────────────────────────────────────────────────────────
const CONFIDENCE_THRESHOLDS = {
  HIGH: 85,
  MEDIUM: 60,
  NEEDS_REVIEW: 40
}

// ─── MAIN MATCHING ENGINE ─────────────────────────────────────────────────────
export class MatchingEngine {

  // ─── NAME NORMALIZER ──────────────────────────────────────────────────────────
  private normalizeName(name: string): string {
    return name
      .toUpperCase()
      .trim()
      .replace(/[^A-Z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // ─── TOKEN OVERLAP SCORING ────────────────────────────────────────────────────
  // Handles reversed names and partial names common on Nigerian bank statements
  // Example: "OGUNDIMU ADEWALE" matches "Adewale Ogundimu" = high token overlap
  private tokenOverlapScore(name1: string, name2: string): number {
    const tokens1 = this.normalizeName(name1).split(' ').filter(t => t.length > 1)
    const tokens2 = this.normalizeName(name2).split(' ').filter(t => t.length > 1)

    if (tokens1.length === 0 || tokens2.length === 0) return 0

    let matchCount = 0

    for (const token1 of tokens1) {
      for (const token2 of tokens2) {
        // Exact token match
        if (token1 === token2) {
          matchCount++
          break
        }
        // One token contains the other (handles abbreviations)
        // e.g. "CHUKWUEMEKA" contains "EMEKA"
        if (token1.includes(token2) || token2.includes(token1)) {
          if (Math.min(token1.length, token2.length) >= 4) {
            matchCount += 0.8
            break
          }
        }
      }
    }

    const totalTokens = Math.max(tokens1.length, tokens2.length)
    return (matchCount / totalTokens) * 100
  }

  // ─── LEVENSHTEIN SCORE ────────────────────────────────────────────────────────
  private levenshteinScore(name1: string, name2: string): number {
    const n1 = this.normalizeName(name1)
    const n2 = this.normalizeName(name2)

    if (n1 === n2) return 100
    if (n1.length === 0 || n2.length === 0) return 0

    const maxLen = Math.max(n1.length, n2.length)
    const dist = distance(n1, n2)

    return ((maxLen - dist) / maxLen) * 100
  }

  // ─── CALCULATE MATCH SCORE ────────────────────────────────────────────────────
  private calculateMatchScore(
    transactionSenderName: string,
    studentFullName: string,
    parentName: string | null
  ): number {
    // Score against student name
    const studentTokenScore = this.tokenOverlapScore(transactionSenderName, studentFullName)
    const studentLevenScore = this.levenshteinScore(transactionSenderName, studentFullName)
    const studentScore = (studentTokenScore * 0.6) + (studentLevenScore * 0.4)

    // Score against parent name
    let parentScore = 0
    if (parentName) {
      const parentTokenScore = this.tokenOverlapScore(transactionSenderName, parentName)
      const parentLevenScore = this.levenshteinScore(transactionSenderName, parentName)
      parentScore = (parentTokenScore * 0.6) + (parentLevenScore * 0.4)
    }

    // Return the higher of the two scores
    return Math.round(Math.max(studentScore, parentScore))
  }

  // ─── CHECK PAYMENT REFERENCE ──────────────────────────────────────────────────
  private containsPaymentReference(
    narration: string,
    paymentReference: string | null
  ): boolean {
    if (!paymentReference || !narration) return false
    return narration.toUpperCase().includes(paymentReference.toUpperCase())
  }

  async matchTransactions(
    uploadId: string,
    schoolId: string
  ): Promise<MatchingSummary> {

    // Get all unmatched transactions for this upload
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('bank_transactions')
      .select('id, sender_name, amount, narration')
      .eq('upload_id', uploadId)
      .eq('school_id', schoolId)
      .eq('is_matched', false)

    if (txError) throw new Error(txError.message)
    if (!transactions || transactions.length === 0) {
      return { total: 0, high: 0, medium: 0, needsReview: 0, unmatched: 0 }
    }

    // Get active term
    const { data: term } = await supabaseAdmin
      .from('terms')
      .select('id')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    if (!term) throw new Error('No active term found')

    // Get all active fee bills with student info for this school
    const { data: bills, error: billsError } = await supabaseAdmin
      .from('fee_bills')
      .select(`
        id,
        total_amount,
        amount_paid,
        status,
        payment_reference,
        student_id,
        students (
          id,
          full_name,
          parent_name
        )
      `)
      .eq('school_id', schoolId)
      .eq('term_id', term.id)
      .neq('status', 'paid')

    if (billsError) throw new Error(billsError.message)
    if (!bills || bills.length === 0) {
      // No bills to match against — mark everything as unmatched
      await this.bulkUpdateConfidence(
        transactions.map(tx => tx.id),
        'UNMATCHED',
        null,
        null,
        schoolId
      )
      return {
        total: transactions.length,
        high: 0,
        medium: 0,
        needsReview: 0,
        unmatched: transactions.length
      }
    }

    const results: MatchResult[] = []

    // Process each transaction
    for (const tx of transactions) {
      const result = this.matchSingleTransaction(tx, bills)
      results.push(result)
    }

    // Save all match results to database
    await this.saveMatchResults(results, schoolId)

    // Calculate summary
    const summary: MatchingSummary = {
      total: results.length,
      high: results.filter(r => r.confidence === 'HIGH').length,
      medium: results.filter(r => r.confidence === 'MEDIUM').length,
      needsReview: results.filter(r => r.confidence === 'NEEDS_REVIEW').length,
      unmatched: results.filter(r => r.confidence === 'UNMATCHED').length
    }

    // Update upload record with counts
    await supabaseAdmin
      .from('bank_statement_uploads')
      .update({
        matched_count: summary.high + summary.medium,
        unmatched_count: summary.unmatched,
        status: 'ready'
      })
      .eq('id', uploadId)

    return summary
  }

  private matchSingleTransaction(
    tx: { id: string; sender_name: string | null; amount: number; narration: string | null },
    bills: any[]
  ): MatchResult {

    const senderName = tx.sender_name || ''
    const narration = tx.narration || ''
    const txAmount = Number(tx.amount)

    // Step 1: Find amount-matching bills
    // Match exact full payment OR partial payment amount
    const amountMatchedBills = bills.filter(bill => {
      const totalAmount = Number(bill.total_amount)
      const amountPaid = Number(bill.amount_paid)
      const balance = totalAmount - amountPaid

      // Exact full payment match
      if (txAmount === totalAmount) return true

      // Partial payment — transaction covers the remaining balance
      if (txAmount === balance && balance > 0) return true

      // Transaction is less than total but more than 0
      // (could be an instalment payment)
      if (txAmount > 0 && txAmount < totalAmount && txAmount <= balance) return true

      return false
    })

    // No amount match at all — unmatched
    if (amountMatchedBills.length === 0) {
      return {
        transactionId: tx.id,
        matchedStudentId: null,
        matchedBillId: null,
        confidence: 'UNMATCHED',
        score: 0,
        reason: `No fee bill found matching amount ₦${txAmount.toLocaleString()}`
      }
    }

    // Step 2: Check for payment reference in narration
    for (const bill of amountMatchedBills) {
      if (this.containsPaymentReference(narration, bill.payment_reference)) {
        return {
          transactionId: tx.id,
          matchedStudentId: (bill.students as any)?.id,
          matchedBillId: bill.id,
          confidence: 'HIGH',
          score: 100,
          reason: `Payment reference ${bill.payment_reference} found in narration`
        }
      }
    }

    // Step 3: Score name similarity against all amount-matched bills
    let bestScore = 0
    let bestBill: any = null

    // NOTE: If multiple bills have the same best score, we accept the first one encountered.
    for (const bill of amountMatchedBills) {
      const student = bill.students as any
      if (!student) continue

      const score = this.calculateMatchScore(
        senderName,
        student.full_name || '',
        student.parent_name
      )

      if (score > bestScore) {
        bestScore = score
        bestBill = bill
      }
    }

    // Step 4: Assign confidence based on score
    if (bestScore >= CONFIDENCE_THRESHOLDS.HIGH) {
      return {
        transactionId: tx.id,
        matchedStudentId: (bestBill.students as any)?.id,
        matchedBillId: bestBill.id,
        confidence: 'HIGH',
        score: bestScore,
        reason: `Name similarity score: ${bestScore}%`
      }
    }

    if (bestScore >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      return {
        transactionId: tx.id,
        matchedStudentId: (bestBill.students as any)?.id,
        matchedBillId: bestBill.id,
        confidence: 'MEDIUM',
        score: bestScore,
        reason: `Name similarity score: ${bestScore}% (medium confidence)`
      }
    }

    if (bestScore >= CONFIDENCE_THRESHOLDS.NEEDS_REVIEW) {
      return {
        transactionId: tx.id,
        matchedStudentId: bestBill ? (bestBill.students as any)?.id : null,
        matchedBillId: bestBill?.id || null,
        confidence: 'NEEDS_REVIEW',
        score: bestScore,
        reason: `Low name similarity score: ${bestScore}% — manual review required`
      }
    }

    return {
      transactionId: tx.id,
      matchedStudentId: null,
      matchedBillId: null,
      confidence: 'NEEDS_REVIEW',
      score: bestScore,
      reason: `Name could not be matched with confidence`
    }
  }

  private async saveMatchResults(
    results: MatchResult[],
    schoolId: string
  ): Promise<void> {
    for (const result of results) {
      await supabaseAdmin
        .from('bank_transactions')
        .update({
          match_confidence: result.confidence,
          matched_student_id: result.matchedStudentId,
          matched_bill_id: result.matchedBillId
        })
        .eq('id', result.transactionId)
        .eq('school_id', schoolId)
    }
  }

  private async bulkUpdateConfidence(
    transactionIds: string[],
    confidence: string,
    studentId: string | null,
    billId: string | null,
    schoolId: string
  ): Promise<void> {
    for (const id of transactionIds) {
      await supabaseAdmin
        .from('bank_transactions')
        .update({
          match_confidence: confidence,
          matched_student_id: studentId,
          matched_bill_id: billId
        })
        .eq('id', id)
        .eq('school_id', schoolId)
    }
  }
}

export const matchingEngine = new MatchingEngine()
