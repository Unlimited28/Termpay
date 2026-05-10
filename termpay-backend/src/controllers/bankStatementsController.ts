import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { statementParser } from '../services/statementParser'

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
