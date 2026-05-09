import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'

// ─── GET DASHBOARD STATS ─────────────────────────────────────────────────────
export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId

    // Get active term
    const { data: term, error: termError } = await supabaseAdmin
      .from('terms')
      .select('id, name, session')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    if (termError || !term) {
      res.status(404).json({
        success: false,
        error: 'No active term found',
        code: 'NO_ACTIVE_TERM'
      })
      return
    }

    // Get all fee bills for active term
    const { data: bills, error: billsError } = await supabaseAdmin
      .from('fee_bills')
      .select('id, total_amount, amount_paid, status')
      .eq('school_id', schoolId)
      .eq('term_id', term.id)

    if (billsError) throw new Error(billsError.message)

    const totalStudents = bills?.length || 0
    const paidBills = bills?.filter(b => b.status === 'paid') || []
    const partialBills = bills?.filter(b => b.status === 'partial') || []
    const unpaidBills = bills?.filter(b => b.status === 'unpaid') || []

    const totalExpected = bills?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0
    const totalCollected = bills?.reduce((sum, b) => sum + Number(b.amount_paid), 0) || 0
    const totalOutstanding = totalExpected - totalCollected

    const collectionRate = totalExpected > 0
      ? Math.round((totalCollected / totalExpected) * 100)
      : 0

    res.json({
      success: true,
      data: {
        term: {
          id: term.id,
          name: term.name,
          session: term.session
        },
        totalStudents,
        paidCount: paidBills.length,
        paidPercent: totalStudents > 0 ? Math.round((paidBills.length / totalStudents) * 100) : 0,
        partialCount: partialBills.length,
        partialPercent: totalStudents > 0 ? Math.round((partialBills.length / totalStudents) * 100) : 0,
        unpaidCount: unpaidBills.length,
        unpaidPercent: totalStudents > 0 ? Math.round((unpaidBills.length / totalStudents) * 100) : 0,
        totalExpected,
        totalCollected,
        totalOutstanding,
        collectionRate
      }
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      code: 'STATS_ERROR'
    })
  }
}

// ─── GET RECENT PAYMENTS ──────────────────────────────────────────────────────
export async function getRecentPayments(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const limit = parseInt(req.query.limit as string) || 10

    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        amount,
        payment_date,
        receipt_number,
        whatsapp_sent,
        created_at,
        students (
          id,
          full_name,
          classes (
            name
          )
        ),
        terms (
          name,
          session
        )
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)

    const formatted = payments?.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      paymentDate: p.payment_date,
      receiptNumber: p.receipt_number,
      whatsappSent: p.whatsapp_sent,
      studentId: (p.students as any)?.id,
      studentName: (p.students as any)?.full_name,
      className: (p.students as any)?.classes?.name,
      termName: (p.terms as any)?.name,
      session: (p.terms as any)?.session,
    })) || []

    res.json({
      success: true,
      data: formatted
    })

  } catch (error) {
    console.error('Recent payments error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent payments',
      code: 'RECENT_PAYMENTS_ERROR'
    })
  }
}

// ─── GET UNPAID STUDENTS ──────────────────────────────────────────────────────
export async function getUnpaidStudents(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId

    // Get active term
    const { data: term } = await supabaseAdmin
      .from('terms')
      .select('id')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    if (!term) {
      res.json({ success: true, data: [] })
      return
    }

    const { data: bills, error } = await supabaseAdmin
      .from('fee_bills')
      .select(`
        id,
        total_amount,
        amount_paid,
        status,
        payment_reference,
        students (
          id,
          full_name,
          parent_name,
          parent_phone,
          classes (
            name
          )
        )
      `)
      .eq('school_id', schoolId)
      .eq('term_id', term.id)
      .in('status', ['unpaid', 'partial'])
      .order('status', { ascending: true })

    if (error) throw new Error(error.message)

    const formatted = bills?.map(b => ({
      billId: b.id,
      totalAmount: Number(b.total_amount),
      amountPaid: Number(b.amount_paid),
      balance: Number(b.total_amount) - Number(b.amount_paid),
      status: b.status,
      paymentReference: b.payment_reference,
      studentId: (b.students as any)?.id,
      studentName: (b.students as any)?.full_name,
      parentName: (b.students as any)?.parent_name,
      parentPhone: (b.students as any)?.parent_phone,
      className: (b.students as any)?.classes?.name,
    })) || []

    res.json({
      success: true,
      data: formatted
    })

  } catch (error) {
    console.error('Unpaid students error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unpaid students',
      code: 'UNPAID_STUDENTS_ERROR'
    })
  }
}

// ─── GET CLASS COLLECTION BREAKDOWN ──────────────────────────────────────────
export async function getClassBreakdown(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId

    // Get active term
    const { data: term } = await supabaseAdmin
      .from('terms')
      .select('id')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    if (!term) {
      res.json({ success: true, data: [] })
      return
    }

    // Get all classes for school
    const { data: classes, error: classError } = await supabaseAdmin
      .from('classes')
      .select('id, name')
      .eq('school_id', schoolId)
      .order('name')

    if (classError) throw new Error(classError.message)

    // For each class get payment stats
    const breakdown = await Promise.all(
      (classes || []).map(async (cls) => {
        // First get student IDs for this class
        const { data: classStudents } = await supabaseAdmin
          .from('students')
          .select('id')
          .eq('class_id', cls.id)
          .eq('is_active', true)

        const studentIds = classStudents?.map(s => s.id) || []

        if (studentIds.length === 0) {
          return {
            classId: cls.id,
            className: cls.name,
            students: 0,
            collected: 0,
            expected: 0,
            rate: 0
          }
        }

        // Then query bills using those IDs
        const { data: bills } = await supabaseAdmin
          .from('fee_bills')
          .select('total_amount, amount_paid, status')
          .eq('school_id', schoolId)
          .eq('term_id', term.id)
          .in('student_id', studentIds)

        const students = bills?.length || 0
        const collected = bills?.reduce((sum, b) => sum + Number(b.amount_paid), 0) || 0
        const expected = bills?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0
        const rate = expected > 0 ? Math.round((collected / expected) * 100) : 0

        return {
          classId: cls.id,
          className: cls.name,
          students,
          collected,
          expected,
          rate
        }
      })
    )

    // Sort by rate ascending (worst performing first)
    breakdown.sort((a, b) => a.rate - b.rate)

    res.json({
      success: true,
      data: breakdown
    })

  } catch (error) {
    console.error('Class breakdown error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class breakdown',
      code: 'CLASS_BREAKDOWN_ERROR'
    })
  }
}

// ─── SEND PAYMENT REMINDER ────────────────────────────────────────────────────
export async function sendReminder(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { studentId } = req.params

    // Get student and bill info
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        full_name,
        parent_name,
        parent_phone,
        school_id
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

    // Get active term bill
    const { data: term } = await supabaseAdmin
      .from('terms')
      .select('id, name, session')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    const { data: bill } = await supabaseAdmin
      .from('fee_bills')
      .select('total_amount, amount_paid, payment_reference')
      .eq('student_id', studentId)
      .eq('term_id', term?.id)
      .single()

    // Get school bank details
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('name, bank_name, bank_account_number, bank_account_name')
      .eq('id', schoolId)
      .single()

    const balance = bill
      ? Number(bill.total_amount) - Number(bill.amount_paid)
      : 0

    const message = `Hello ${student.parent_name || 'Parent'},

This is a friendly reminder from ${school?.name}.

Student: ${student.full_name}
Term: ${term?.name} ${term?.session}
Amount Due: ₦${Number(bill?.total_amount || 0).toLocaleString()}
Amount Paid: ₦${Number(bill?.amount_paid || 0).toLocaleString()}
Balance Outstanding: ₦${balance.toLocaleString()}

Please make payment to:
Bank: ${school?.bank_name}
Account Number: ${school?.bank_account_number}
Account Name: ${school?.bank_account_name}
Payment Reference: ${bill?.payment_reference}

Please include your payment reference in your transfer narration.

Thank you.
— ${school?.name}`

    // Log mock notification
    console.log(`
========= WHATSAPP REMINDER (MOCK) =========
To: ${student.parent_phone}
${message}
============================================
    `)

    // Log to notification_log
    await supabaseAdmin
      .from('notification_log')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        parent_phone: student.parent_phone,
        channel: 'whatsapp',
        message,
        status: 'mock'
      })

    res.json({
      success: true,
      message: `Reminder sent to ${student.parent_phone}`
    })

  } catch (error) {
    console.error('Send reminder error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send reminder',
      code: 'REMINDER_ERROR'
    })
  }
}

// ─── SEND BULK REMINDERS ──────────────────────────────────────────────────────
export async function sendBulkReminders(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId

    // Get all unpaid and partial students
    const { data: term } = await supabaseAdmin
      .from('terms')
      .select('id, name, session')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    if (!term) {
      res.status(404).json({
        success: false,
        error: 'No active term found',
        code: 'NO_ACTIVE_TERM'
      })
      return
    }

    const { data: bills, error } = await supabaseAdmin
      .from('fee_bills')
      .select(`
        total_amount,
        amount_paid,
        payment_reference,
        students (
          id,
          full_name,
          parent_name,
          parent_phone
        )
      `)
      .eq('school_id', schoolId)
      .eq('term_id', term.id)
      .in('status', ['unpaid', 'partial'])

    if (error) throw new Error(error.message)

    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('name, bank_name, bank_account_number, bank_account_name')
      .eq('id', schoolId)
      .single()

    let sentCount = 0

    for (const bill of bills || []) {
      const student = bill.students as any
      if (!student?.parent_phone) continue

      const balance = Number(bill.total_amount) - Number(bill.amount_paid)

      const message = `Hello ${student.parent_name || 'Parent'}, fees reminder from ${school?.name}. Student: ${student.full_name}. Balance: ₦${balance.toLocaleString()}. Reference: ${bill.payment_reference}. Pay to ${school?.bank_name} ${school?.bank_account_number}.`

      console.log(`[BULK REMINDER MOCK] To: ${student.parent_phone} | ${student.full_name} | ₦${balance.toLocaleString()}`)

      await supabaseAdmin
        .from('notification_log')
        .insert({
          school_id: schoolId,
          student_id: student.id,
          parent_phone: student.parent_phone,
          channel: 'whatsapp',
          message,
          status: 'mock'
        })

      sentCount++
    }

    res.json({
      success: true,
      message: `Reminders sent to ${sentCount} parents`,
      data: { sentCount }
    })

  } catch (error) {
    console.error('Bulk reminders error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk reminders',
      code: 'BULK_REMINDER_ERROR'
    })
  }
}
