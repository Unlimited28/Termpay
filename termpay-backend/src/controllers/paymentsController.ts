import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { generateAndStoreReceipt } from '../services/receiptGenerator'
import { notificationService } from '../services/notificationService'

// ─── LIST PAYMENTS ────────────────────────────────────────────────────────────
export async function listPayments(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const {
      search,
      classId,
      dateFrom,
      dateTo,
      page = '1',
      limit = '20'
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    let query = supabaseAdmin
      .from('payments')
      .select(`
        id,
        amount,
        payment_date,
        receipt_number,
        receipt_url,
        whatsapp_sent,
        created_at,
        students (
          id,
          full_name,
          parent_phone,
          classes (
            id,
            name
          )
        ),
        terms (
          name,
          session
        )
      `, { count: 'exact' })
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (dateFrom) {
      query = query.gte('payment_date', dateFrom as string)
    }

    if (dateTo) {
      query = query.lte('payment_date', dateTo as string)
    }

    // Add class filter via a subquery on student IDs
    if (classId) {
      const { data: classStudents } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('class_id', classId as string)
        .eq('school_id', schoolId)

      const studentIds = classStudents?.map(s => s.id) || []
      query = query.in('student_id', studentIds)
    }

    // Apply pagination at the database level
    query = query.range(offset, offset + limitNum - 1)

    const { data: payments, error, count } = await query

    if (error) throw new Error(error.message)

    let formatted = payments?.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      paymentDate: p.payment_date,
      receiptNumber: p.receipt_number,
      hasReceiptFile: !!p.receipt_url,
      whatsappSent: p.whatsapp_sent,
      studentId: (p.students as any)?.id,
      studentName: (p.students as any)?.full_name,
      parentPhone: (p.students as any)?.parent_phone,
      classId: (p.students as any)?.classes?.id,
      className: (p.students as any)?.classes?.name,
      termName: (p.terms as any)?.name,
      session: (p.terms as any)?.session,
      createdAt: p.created_at
    })) || []

    // Filter by search in-memory (for small page sizes)
    if (search) {
      const searchStr = (search as string).toLowerCase()
      formatted = formatted.filter(p =>
        p.studentName?.toLowerCase().includes(searchStr) ||
        p.receiptNumber?.toLowerCase().includes(searchStr)
      )
    }

    // Calculate summary
    const totalAmount = formatted.reduce((sum, p) => sum + p.amount, 0)
    const whatsappSentCount = formatted.filter(p => p.whatsappSent).length

    res.json({
      success: true,
      data: formatted,
      summary: {
        totalPayments: count || 0,
        totalAmount,
        whatsappSent: whatsappSentCount
      },
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    })

  } catch (error) {
    console.error('List payments error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments',
      code: 'LIST_PAYMENTS_ERROR'
    })
  }
}

// ─── RECORD MANUAL PAYMENT ────────────────────────────────────────────────────
export async function recordManualPayment(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const {
      studentId,
      amount,
      paymentDate,
      paymentMethod,
      note
    } = req.body

    if (!studentId || !amount || !paymentDate) {
      res.status(400).json({
        success: false,
        error: 'Student ID, amount, and payment date are required',
        code: 'MISSING_REQUIRED_FIELDS'
      })
      return
    }

    // Verify student belongs to school
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        full_name,
        parent_name,
        parent_phone,
        classes ( name )
      `)
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

    // Get active term
    const { data: term } = await supabaseAdmin
      .from('terms')
      .select('id, name, session')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    if (!term) {
      res.status(400).json({
        success: false,
        error: 'No active term found',
        code: 'NO_ACTIVE_TERM'
      })
      return
    }

    // Get student fee bill
    const { data: bill } = await supabaseAdmin
      .from('fee_bills')
      .select('id, total_amount, amount_paid, status')
      .eq('student_id', studentId)
      .eq('term_id', term.id)
      .single()

    if (!bill) {
      res.status(400).json({
        success: false,
        error: 'No fee bill found for this student in the active term',
        code: 'NO_FEE_BILL'
      })
      return
    }

    // Generate receipt number
    // TODO: Replace with PostgreSQL sequence for atomic receipt numbering at scale
    // Current count-based approach is safe for single-session confirmation flows
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

    const { count: todayCount } = await supabaseAdmin
      .from('payments')
      .select('id', { count: 'exact' })
      .eq('school_id', schoolId)
      .gte('created_at', today.toISOString().split('T')[0])

    const receiptNumber = `RCT-${dateStr}-${String((todayCount || 0) + 1).padStart(4, '0')}`

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        bill_id: bill.id,
        term_id: term.id,
        amount: Number(amount),
        payment_date: paymentDate,
        receipt_number: receiptNumber,
        whatsapp_sent: false
      })
      .select()
      .single()

    if (paymentError) throw new Error(paymentError.message)

    // Update fee bill
    const newAmountPaid = Number(bill.amount_paid) + Number(amount)
    const newStatus = newAmountPaid >= Number(bill.total_amount)
      ? 'paid'
      : 'partial'

    await supabaseAdmin
      .from('fee_bills')
      .update({
        amount_paid: newAmountPaid,
        status: newStatus
      })
      .eq('id', bill.id)

    // Get school details
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('name')
      .eq('id', schoolId)
      .single()

    // Fire and forget receipt generation
    generateAndStoreReceipt(payment.id, schoolId).catch(err => {
      console.error('Manual payment receipt generation failed:', err)
    })

    // Fire and forget notification
    ;(async () => {
      try {
        await notificationService.sendPaymentNotification(
          {
            parentPhone: (student as any).parent_phone,
            parentName: (student as any).parent_name || 'Parent',
            studentName: (student as any).full_name,
            className: (student as any).classes?.name || '',
            amount: Number(amount),
            termName: term.name,
            session: term.session,
            balance: Number(bill.total_amount) - newAmountPaid,
            receiptNumber,
            paymentDate,
            schoolName: school?.name || ''
          },
          schoolId,
          payment.id,
          studentId
        )
      } catch (err) {
        console.error('Manual payment notification failed:', err)
      }
    })()

    res.status(201).json({
      success: true,
      message: 'Manual payment recorded successfully',
      data: {
        paymentId: payment.id,
        receiptNumber,
        amount: Number(amount),
        studentName: (student as any).full_name,
        newStatus,
        totalPaid: newAmountPaid,
        balance: Number(bill.total_amount) - newAmountPaid
      }
    })

  } catch (error) {
    console.error('Manual payment error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record manual payment',
      code: 'MANUAL_PAYMENT_ERROR'
    })
  }
}

// ─── RESEND NOTIFICATION ──────────────────────────────────────────────────────
export async function resendNotification(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params

    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        amount,
        payment_date,
        receipt_number,
        school_id,
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
      .eq('id', id)
      .eq('school_id', schoolId)
      .single()

    if (error || !payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      })
      return
    }

    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('name')
      .eq('id', schoolId)
      .single()

    const student = payment.students as any
    const bill = payment.fee_bills as any
    const term = payment.terms as any

    await notificationService.sendPaymentNotification(
      {
        parentPhone: student?.parent_phone,
        parentName: student?.parent_name || 'Parent',
        studentName: student?.full_name,
        className: student?.classes?.name || '',
        amount: Number(payment.amount),
        termName: term?.name || '',
        session: term?.session || '',
        balance: Number(bill?.total_amount || 0) - Number(bill?.amount_paid || 0),
        receiptNumber: payment.receipt_number!,
        paymentDate: payment.payment_date,
        schoolName: school?.name || ''
      },
      schoolId,
      payment.id,
      student?.id
    )

    res.json({
      success: true,
      message: `Notification resent to ${student?.parent_phone}`
    })

  } catch (error) {
    console.error('Resend notification error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to resend notification',
      code: 'RESEND_ERROR'
    })
  }
}

// ─── GET SINGLE PAYMENT ───────────────────────────────────────────────────────
export async function getPayment(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params

    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        amount,
        payment_date,
        receipt_number,
        receipt_url,
        whatsapp_sent,
        created_at,
        students (
          id,
          full_name,
          admission_number,
          parent_name,
          parent_phone,
          classes ( name )
        ),
        fee_bills (
          total_amount,
          amount_paid,
          status
        ),
        terms (
          name,
          session
        )
      `)
      .eq('id', id)
      .eq('school_id', schoolId)
      .single()

    if (error || !payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      })
      return
    }

    const student = payment.students as any
    const bill = payment.fee_bills as any
    const term = payment.terms as any

    res.json({
      success: true,
      data: {
        id: payment.id,
        amount: Number(payment.amount),
        paymentDate: payment.payment_date,
        receiptNumber: payment.receipt_number,
        whatsappSent: payment.whatsapp_sent,
        studentName: student?.full_name,
        admissionNumber: student?.admission_number,
        parentName: student?.parent_name,
        parentPhone: student?.parent_phone,
        className: student?.classes?.name,
        termName: term?.name,
        session: term?.session,
        totalBill: Number(bill?.total_amount || 0),
        amountPaid: Number(bill?.amount_paid || 0),
        balance: Number(bill?.total_amount || 0) - Number(bill?.amount_paid || 0),
        billStatus: bill?.status,
        createdAt: payment.created_at
      }
    })

  } catch (error) {
    console.error('Get payment error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment',
      code: 'GET_PAYMENT_ERROR'
    })
  }
}
