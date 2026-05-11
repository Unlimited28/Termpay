import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { getReceiptSignedUrl, generateAndStoreReceipt } from '../services/receiptGenerator'

export async function getParentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { studentIds, schoolId } = req.parent!

    const studentsData = await Promise.all(
      studentIds.map(async (studentId) => {

        const { data: student } = await supabaseAdmin
          .from('students')
          .select(`
            id,
            full_name,
            admission_number,
            class_id,
            classes (
              name
            )
          `)
          .eq('id', studentId)
          .single()

        const { data: term } = await supabaseAdmin
          .from('terms')
          .select('id, name, session')
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .single()

        const { data: bill } = await supabaseAdmin
          .from('fee_bills')
          .select(`
            id,
            total_amount,
            amount_paid,
            status,
            payment_reference
          `)
          .eq('student_id', studentId)
          .eq('term_id', term?.id || '')
          .single()

        // Get fee items for this specific class
        const { data: feeItems } = await supabaseAdmin
          .from('fee_items')
          .select('name, amount')
          .eq('term_id', term?.id || '')
          .eq('school_id', schoolId)
          .eq('class_id', (student as any)?.class_id || '')
          .eq('is_compulsory', true)

        const { data: payments } = await supabaseAdmin
          .from('payments')
          .select('id, amount, payment_date, receipt_number, receipt_url')
          .eq('student_id', studentId)
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })

        const { data: school } = await supabaseAdmin
          .from('schools')
          .select('name, bank_name, bank_account_number, bank_account_name')
          .eq('id', schoolId)
          .single()

        return {
          studentId,
          studentName: (student as any)?.full_name,
          admissionNumber: (student as any)?.admission_number,
          className: (student as any)?.classes?.name,
          termName: term?.name,
          session: term?.session,
          bill: bill ? {
            id: bill.id,
            totalAmount: Number(bill.total_amount),
            amountPaid: Number(bill.amount_paid),
            balance: Number(bill.total_amount) - Number(bill.amount_paid),
            status: bill.status,
            paymentReference: bill.payment_reference
          } : null,
          feeItems: (feeItems && feeItems.length > 0)
            ? feeItems.map(f => ({
                name: f.name,
                amount: Number(f.amount)
              }))
            : bill ? [{ name: 'School Fees', amount: Number(bill.total_amount) }] : [],
          paymentHistory: payments?.map(p => ({
            id: p.id,
            amount: Number(p.amount),
            paymentDate: p.payment_date,
            receiptNumber: p.receipt_number,
            hasReceipt: !!p.receipt_url
          })) || [],
          bankDetails: (bill?.status !== 'paid') ? {
            bankName: school?.bank_name,
            accountNumber: school?.bank_account_number,
            accountName: school?.bank_account_name,
            paymentReference: bill?.payment_reference
          } : null
        }
      })
    )

    res.json({
      success: true,
      data: studentsData
    })

  } catch (error) {
    console.error('Parent status error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment status',
      code: 'PARENT_STATUS_ERROR'
    })
  }
}

export async function downloadParentReceipt(req: Request, res: Response): Promise<void> {
  try {
    const { studentIds, schoolId } = req.parent!
    const { paymentId } = req.params

    // Verify payment belongs to one of parent's students
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('id, receipt_number, receipt_url, student_id')
      .eq('id', paymentId)
      .eq('school_id', schoolId)
      .in('student_id', studentIds)
      .single()

    if (error || !payment) {
      res.status(404).json({
        success: false,
        error: 'Receipt not found',
        code: 'RECEIPT_NOT_FOUND'
      })
      return
    }

    let receiptUrl = payment.receipt_url

    // Generate if missing
    if (!receiptUrl) {
      const result = await generateAndStoreReceipt(paymentId, schoolId)
      receiptUrl = result.receiptUrl
    }

    if (!receiptUrl) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate receipt',
        code: 'RECEIPT_GENERATION_FAILED'
      })
      return
    }

    const signedUrl = await getReceiptSignedUrl(receiptUrl)

    res.json({
      success: true,
      data: {
        receiptNumber: payment.receipt_number,
        downloadUrl: signedUrl,
        expiresIn: '1 hour'
      }
    })

  } catch (error) {
    console.error('Parent receipt download error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to download receipt',
      code: 'DOWNLOAD_ERROR'
    })
  }
}
