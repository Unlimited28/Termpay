import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { statementParser } from '../services/statementParser'
import { matchingEngine } from '../services/matchingEngine'
import { generateAndStoreReceipt } from '../services/receiptGenerator'
import { notificationService } from '../services/notificationService'

// ─── UPLOAD BANK STATEMENT ────────────────────────────────────────────────────
export async function uploadStatement(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
        code: 'NO_FILE'
      })
      return
    }

    const file = req.file
    const fileName = file.originalname

    // Parse the CSV file
    const parseResult = statementParser.parseFromBuffer(file.buffer)

    // Check if format was recognized
    if (parseResult.bank === 'Unknown') {
      res.status(400).json({
        success: false,
        error: parseResult.errors[0] || 'Unrecognized bank statement format',
        code: 'UNKNOWN_FORMAT'
      })
      return
    }

    // Upload file to Supabase Storage
    const storagePath = `${schoolId}/${Date.now()}_${fileName}`
    const { error: storageError } = await supabaseAdmin.storage
      .from('bank-statements')
      .upload(storagePath, file.buffer, {
        contentType: 'text/csv',
        upsert: false
      })

    if (storageError) {
      console.error('Storage upload error:', storageError)
      // Continue even if storage fails — data is more important
    }

    // Create upload record
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from('bank_statement_uploads')
      .insert({
        school_id: schoolId,
        file_name: fileName,
        file_url: storagePath,
        total_transactions: parseResult.creditRows,
        status: 'parsed'
      })
      .select()
      .single()

    if (uploadError) throw new Error(uploadError.message)

    // Save all parsed transactions to bank_transactions table
    if (parseResult.transactions.length > 0) {
      const transactionsToInsert = parseResult.transactions.map(tx => ({
        upload_id: upload.id,
        school_id: schoolId,
        transaction_date: tx.date,
        sender_name: tx.senderName,
        amount: tx.amount,
        narration: tx.narration,
        is_matched: false,
        match_confidence: null,
        matched_student_id: null,
        matched_bill_id: null
      }))

      const { error: txError } = await supabaseAdmin
        .from('bank_transactions')
        .insert(transactionsToInsert)

      if (txError) throw new Error(txError.message)
    }

    res.status(201).json({
      success: true,
      message: `Successfully parsed ${parseResult.creditRows} transactions from ${parseResult.bank} statement`,
      data: {
        uploadId: upload.id,
        bank: parseResult.bank,
        fileName,
        totalTransactions: parseResult.creditRows,
        totalRows: parseResult.totalRows,
        skippedRows: parseResult.skippedRows,
        parseErrors: parseResult.errors,
        status: 'parsed'
      }
    })

  } catch (error) {
    console.error('Upload statement error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload and parse bank statement',
      code: 'UPLOAD_ERROR'
    })
  }
}

// ─── RUN MATCHING ENGINE ──────────────────────────────────────────────────────
export async function runMatching(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params

    // Verify upload belongs to school
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from('bank_statement_uploads')
      .select('id, status, file_name')
      .eq('id', id)
      .eq('school_id', schoolId)
      .single()

    if (uploadError || !upload) {
      res.status(404).json({
        success: false,
        error: 'Upload not found',
        code: 'UPLOAD_NOT_FOUND'
      })
      return
    }

    // Run matching engine
    const summary = await matchingEngine.matchTransactions(id, schoolId)

    res.json({
      success: true,
      message: `Matching complete. ${summary.high} HIGH, ${summary.medium} MEDIUM, ${summary.needsReview} need review, ${summary.unmatched} unmatched.`,
      data: summary
    })

  } catch (error) {
    console.error('Run matching error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to run matching engine',
      code: 'MATCHING_ERROR'
    })
  }
}

// ─── CONFIRM SINGLE MATCH ─────────────────────────────────────────────────────
export async function confirmMatch(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id, txId } = req.params

    // Get transaction details
    const { data: tx, error: txError } = await supabaseAdmin
      .from('bank_transactions')
      .select('id, amount, matched_student_id, matched_bill_id, is_matched, school_id')
      .eq('id', txId)
      .eq('upload_id', id)
      .eq('school_id', schoolId)
      .single()

    if (txError || !tx) {
      res.status(404).json({
        success: false,
        error: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND'
      })
      return
    }

    if (tx.is_matched) {
      res.status(400).json({
        success: false,
        error: 'Transaction already confirmed',
        code: 'ALREADY_CONFIRMED'
      })
      return
    }

    if (!tx.matched_student_id || !tx.matched_bill_id) {
      res.status(400).json({
        success: false,
        error: 'Transaction has no matched student. Use override first.',
        code: 'NO_MATCH'
      })
      return
    }

    // Create payment record
    const paymentResult = await createPaymentRecord(
      tx,
      schoolId,
      req.user!.userId
    )

    res.status(201).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: paymentResult
    })

  } catch (error) {
    console.error('Confirm match error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to confirm match',
      code: 'CONFIRM_ERROR'
    })
  }
}

// ─── CONFIRM ALL HIGH CONFIDENCE ─────────────────────────────────────────────
export async function confirmAllHigh(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params

    // Get all HIGH confidence unconfirmed transactions for this upload
    const { data: transactions, error } = await supabaseAdmin
      .from('bank_transactions')
      .select('id, amount, matched_student_id, matched_bill_id, is_matched')
      .eq('upload_id', id)
      .eq('school_id', schoolId)
      .eq('match_confidence', 'HIGH')
      .eq('is_matched', false)

    if (error) throw new Error(error.message)

    if (!transactions || transactions.length === 0) {
      res.json({
        success: true,
        message: 'No HIGH confidence transactions to confirm',
        data: { confirmed: 0, payments: [] }
      })
      return
    }

    const confirmedPayments = []
    const failedTransactions = []

    for (const tx of transactions) {
      try {
        if (!tx.matched_student_id || !tx.matched_bill_id) continue

        const paymentResult = await createPaymentRecord(
          tx,
          schoolId,
          req.user!.userId
        )
        confirmedPayments.push(paymentResult)
      } catch (err) {
        console.error(`Failed to confirm transaction ${tx.id}:`, err)
        failedTransactions.push(tx.id)
      }
    }

    res.json({
      success: true,
      message: `${confirmedPayments.length} payments confirmed successfully`,
      data: {
        confirmed: confirmedPayments.length,
        failed: failedTransactions.length,
        payments: confirmedPayments
      }
    })

  } catch (error) {
    console.error('Confirm all high error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payments',
      code: 'CONFIRM_ALL_ERROR'
    })
  }
}

// ─── CREATE PAYMENT RECORD (shared helper) ────────────────────────────────────
async function createPaymentRecord(
  tx: {
    id: string
    amount: number
    matched_student_id: string
    matched_bill_id: string
  },
  schoolId: string,
  confirmedBy: string
): Promise<any> {

  // Generate receipt number
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

  const { count: todayCount } = await supabaseAdmin
    .from('payments')
    .select('id', { count: 'exact' })
    .eq('school_id', schoolId)
    .gte('created_at', today.toISOString().split('T')[0])

  const receiptNumber = `RCT-${dateStr}-${String((todayCount || 0) + 1).padStart(4, '0')}`

  // Get active term
  const { data: term } = await supabaseAdmin
    .from('terms')
    .select('id')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .single()

  // Create payment record
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      school_id: schoolId,
      student_id: tx.matched_student_id,
      bill_id: tx.matched_bill_id,
      transaction_id: tx.id,
      term_id: term?.id,
      amount: tx.amount,
      payment_date: new Date().toISOString().split('T')[0],
      receipt_number: receiptNumber,
      whatsapp_sent: false
    })
    .select()
    .single()

  if (paymentError) throw new Error(paymentError.message)

  // Update fee bill amount paid and status
  const { data: bill } = await supabaseAdmin
    .from('fee_bills')
    .select('total_amount, amount_paid')
    .eq('id', tx.matched_bill_id)
    .single()

  if (bill) {
    const newAmountPaid = Number(bill.amount_paid) + Number(tx.amount)
    const newStatus = newAmountPaid >= Number(bill.total_amount)
      ? 'paid'
      : newAmountPaid > 0
        ? 'partial'
        : 'unpaid'

    await supabaseAdmin
      .from('fee_bills')
      .update({
        amount_paid: newAmountPaid,
        status: newStatus
      })
      .eq('id', tx.matched_bill_id)
  }

  // Mark transaction as matched
  await supabaseAdmin
    .from('bank_transactions')
    .update({ is_matched: true })
    .eq('id', tx.id)

  // Fire and forget — do not await
  generateAndStoreReceipt(payment.id, schoolId).catch(err => {
    console.error(`Receipt generation failed for payment ${payment.id}:`, err)
  })

  // Get payment details for notification using a joined query
  // Fire and forget — do not await
  ;(async () => {
    try {
      const { data: paymentDetails } = await supabaseAdmin
        .from('payments')
        .select(`
          id,
          amount,
          payment_date,
          receipt_number,
          students (
            id,
            full_name,
            parent_name,
            parent_phone,
            classes ( name )
          ),
          fee_bills (
            total_amount,
            amount_paid
          ),
          terms (
            name,
            session
          )
        `)
        .eq('id', payment.id)
        .single()

      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('name')
        .eq('id', schoolId)
        .single()

      if (paymentDetails && school) {
        const student = (paymentDetails as any).students
        const bill = (paymentDetails as any).fee_bills
        const term = (paymentDetails as any).terms

        await notificationService.sendPaymentNotification(
          {
            parentPhone: student?.parent_phone,
            parentName: student?.parent_name || 'Parent',
            studentName: student?.full_name,
            className: student?.classes?.name || '',
            amount: Number(paymentDetails.amount),
            termName: term?.name || '',
            session: term?.session || '',
            balance: Number(bill?.total_amount || 0) - Number(bill?.amount_paid || 0),
            receiptNumber: paymentDetails.receipt_number!,
            paymentDate: paymentDetails.payment_date,
            schoolName: school.name
          },
          schoolId,
          paymentDetails.id,
          student?.id
        )
      }
    } catch (notifError) {
      console.error('Notification failed:', notifError)
    }
  })()

  return {
    paymentId: payment.id,
    receiptNumber: payment.receipt_number,
    amount: Number(payment.amount),
    studentId: tx.matched_student_id,
    billId: tx.matched_bill_id
  }
}

// ─── LIST UPLOADS ─────────────────────────────────────────────────────────────
export async function listUploads(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId

    const { data: uploads, error } = await supabaseAdmin
      .from('bank_statement_uploads')
      .select('*')
      .eq('school_id', schoolId)
      .order('upload_date', { ascending: false })

    if (error) throw new Error(error.message)

    const formatted = uploads?.map(u => ({
      id: u.id,
      fileName: u.file_name,
      uploadDate: u.upload_date,
      totalTransactions: u.total_transactions,
      matchedCount: u.matched_count,
      unmatchedCount: u.unmatched_count,
      status: u.status
    })) || []

    res.json({
      success: true,
      data: formatted
    })

  } catch (error) {
    console.error('List uploads error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch uploads',
      code: 'LIST_UPLOADS_ERROR'
    })
  }
}

// ─── GET UPLOAD TRANSACTIONS ──────────────────────────────────────────────────
export async function getUploadTransactions(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params
    const { tab } = req.query

    // Verify upload belongs to school
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from('bank_statement_uploads')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .single()

    if (uploadError || !upload) {
      res.status(404).json({
        success: false,
        error: 'Upload not found',
        code: 'UPLOAD_NOT_FOUND'
      })
      return
    }

    // Build query based on tab
    let query = supabaseAdmin
      .from('bank_transactions')
      .select(`
        id,
        transaction_date,
        sender_name,
        amount,
        narration,
        is_matched,
        match_confidence,
        matched_student_id,
        matched_bill_id,
        students (
          id,
          full_name,
          classes (
            name
          )
        )
      `)
      .eq('upload_id', id)
      .eq('school_id', schoolId)
      .order('transaction_date', { ascending: false })

    // Filter by tab
    if (tab === 'matched') {
      query = query.in('match_confidence', ['HIGH', 'MEDIUM'])
        .eq('is_matched', false)
    } else if (tab === 'review') {
      query = query.eq('match_confidence', 'NEEDS_REVIEW')
    } else if (tab === 'unmatched') {
      query = query.eq('match_confidence', 'UNMATCHED')
    } else if (tab === 'confirmed') {
      query = query.eq('is_matched', true)
    }

    const { data: transactions, error } = await query

    if (error) throw new Error(error.message)

    const formatted = transactions?.map(tx => ({
      id: tx.id,
      date: tx.transaction_date,
      senderName: tx.sender_name,
      amount: Number(tx.amount),
      narration: tx.narration,
      isMatched: tx.is_matched,
      confidence: tx.match_confidence,
      matchedStudentId: tx.matched_student_id,
      matchedStudentName: (tx.students as any)?.full_name,
      matchedClassName: (tx.students as any)?.classes?.name,
      matchedBillId: tx.matched_bill_id
    })) || []

    // Detect bank from transactions if available
    const bankName = transactions && transactions.length > 0 ?
      upload.file_name : // Fallback to filename for now as requested by instruction
      upload.file_name

    // Get counts for summary bar
    const { data: allTx } = await supabaseAdmin
      .from('bank_transactions')
      .select('match_confidence, is_matched')
      .eq('upload_id', id)

    const summary = {
      total: allTx?.length || 0,
      autoMatched: allTx?.filter(t =>
        ['HIGH', 'MEDIUM'].includes(t.match_confidence) && !t.is_matched
      ).length || 0,
      highConfidence: allTx?.filter(t =>
        t.match_confidence === 'HIGH' && !t.is_matched
      ).length || 0,
      needsReview: allTx?.filter(t =>
        t.match_confidence === 'NEEDS_REVIEW'
      ).length || 0,
      unmatched: allTx?.filter(t =>
        t.match_confidence === 'UNMATCHED'
      ).length || 0,
      confirmed: allTx?.filter(t => t.is_matched).length || 0
    }

    res.json({
      success: true,
      data: {
        upload: {
          id: upload.id,
          fileName: upload.file_name,
          uploadDate: upload.upload_date,
          bank: bankName,
          status: upload.status
        },
        summary,
        transactions: formatted
      }
    })

  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      code: 'GET_TRANSACTIONS_ERROR'
    })
  }
}

// ─── DISMISS TRANSACTION ──────────────────────────────────────────────────────
export async function dismissTransaction(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id, txId } = req.params

    const { error } = await supabaseAdmin
      .from('bank_transactions')
      .update({
        match_confidence: 'UNMATCHED',
        matched_student_id: null,
        matched_bill_id: null
      })
      .eq('id', txId)
      .eq('school_id', schoolId)
      .eq('upload_id', id)

    if (error) throw new Error(error.message)

    res.json({
      success: true,
      message: 'Transaction dismissed'
    })

  } catch (error) {
    console.error('Dismiss transaction error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to dismiss transaction',
      code: 'DISMISS_ERROR'
    })
  }
}

// ─── OVERRIDE MATCH ───────────────────────────────────────────────────────────
export async function overrideMatch(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id, txId } = req.params
    const { studentId } = req.body

    if (!studentId) {
      res.status(400).json({
        success: false,
        error: 'Student ID is required',
        code: 'MISSING_STUDENT_ID'
      })
      return
    }

    // Verify student belongs to school
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, full_name')
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .single()

    if (studentError || !student) {
      res.status(404).json({
        success: false,
        error: 'Student not found',
        code: 'STUDENT_NOT_FOUND'
      })
      return
    }

    // Get transaction amount to find matching bill
    const { data: tx } = await supabaseAdmin
      .from('bank_transactions')
      .select('amount')
      .eq('id', txId)
      .single()

    // Find active term bill for this student
    const { data: term } = await supabaseAdmin
      .from('terms')
      .select('id')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    const { data: bill } = await supabaseAdmin
      .from('fee_bills')
      .select('id')
      .eq('student_id', studentId)
      .eq('term_id', term?.id)
      .single()

    // Update transaction with manual override
    const { error: updateError } = await supabaseAdmin
      .from('bank_transactions')
      .update({
        matched_student_id: studentId,
        matched_bill_id: bill?.id || null,
        match_confidence: 'HIGH'
      })
      .eq('id', txId)
      .eq('school_id', schoolId)
      .eq('upload_id', id)

    if (updateError) throw new Error(updateError.message)

    res.json({
      success: true,
      message: `Transaction manually matched to ${student.full_name}`,
      data: {
        studentId: student.id,
        studentName: student.full_name,
        billId: bill?.id
      }
    })

  } catch (error) {
    console.error('Override match error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to override match',
      code: 'OVERRIDE_ERROR'
    })
  }
}
