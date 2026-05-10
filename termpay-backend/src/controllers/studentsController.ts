import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'

// ─── LIST STUDENTS ────────────────────────────────────────────────────────────
export async function listStudents(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const {
      search,
      classId,
      status,
      page = '1',
      limit = '50'
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    // Get active term for bill status
    const { data: term } = await supabaseAdmin
      .from('terms')
      .select('id')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    // Build students query
    let query = supabaseAdmin
      .from('students')
      .select(`
        id,
        full_name,
        admission_number,
        parent_name,
        parent_phone,
        parent_email,
        is_active,
        created_at,
        classes (
          id,
          name
        )
      `, { count: 'exact' })
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    // Apply search filter
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,admission_number.ilike.%${search}%,parent_phone.ilike.%${search}%`
      )
    }

    // Apply class filter
    if (classId) {
      query = query.eq('class_id', classId)
    }

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1)

    const { data: students, error, count } = await query

    if (error) throw new Error(error.message)

    // Get fee bills for all students if term exists
    let billsMap: Record<string, any> = {}

    if (term && students && students.length > 0) {
      const studentIds = students.map(s => s.id)

      const { data: bills } = await supabaseAdmin
        .from('fee_bills')
        .select('student_id, total_amount, amount_paid, status, payment_reference')
        .eq('school_id', schoolId)
        .eq('term_id', term.id)
        .in('student_id', studentIds)

      bills?.forEach(b => {
        billsMap[b.student_id] = b
      })
    }

    // Filter by payment status if requested
    let formattedStudents = students?.map(s => {
      const bill = billsMap[s.id]
      return {
        id: s.id,
        fullName: s.full_name,
        admissionNumber: s.admission_number,
        parentName: s.parent_name,
        parentPhone: s.parent_phone,
        parentEmail: s.parent_email,
        className: (s.classes as any)?.name,
        classId: (s.classes as any)?.id,
        totalBill: bill ? Number(bill.total_amount) : 0,
        amountPaid: bill ? Number(bill.amount_paid) : 0,
        balance: bill ? Number(bill.total_amount) - Number(bill.amount_paid) : 0,
        status: bill?.status || 'unpaid',
        paymentReference: bill?.payment_reference || null,
        createdAt: s.created_at
      }
    }) || []

    // Filter by status after combining with bills
    if (status && status !== 'all') {
      formattedStudents = formattedStudents.filter(s => s.status === status)
    }

    res.json({
      success: true,
      data: formattedStudents,
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    })

  } catch (error) {
    console.error('List students error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
      code: 'LIST_STUDENTS_ERROR'
    })
  }
}

// ─── CREATE STUDENT ───────────────────────────────────────────────────────────
export async function createStudent(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const {
      fullName,
      classId,
      parentName,
      parentPhone,
      parentEmail
    } = req.body

    // Validate required fields
    if (!fullName || !classId || !parentName || !parentPhone) {
      res.status(400).json({
        success: false,
        error: 'Full name, class, parent name, and parent phone are required',
        code: 'MISSING_REQUIRED_FIELDS'
      })
      return
    }

    // Validate Nigerian phone number
    const normalizedPhone = normalizePhone(parentPhone)
    if (!normalizedPhone) {
      res.status(400).json({
        success: false,
        error: 'Invalid Nigerian phone number format',
        code: 'INVALID_PHONE'
      })
      return
    }

    // Verify class belongs to school
    const { data: cls, error: classError } = await supabaseAdmin
      .from('classes')
      .select('id, name')
      .eq('id', classId)
      .eq('school_id', schoolId)
      .single()

    if (classError || !cls) {
      res.status(400).json({
        success: false,
        error: 'Invalid class',
        code: 'INVALID_CLASS'
      })
      return
    }

    // Get school prefix for admission number and payment reference
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('school_prefix')
      .eq('id', schoolId)
      .single()

    const prefix = school?.school_prefix || 'SCH'

    // Generate admission number
    const { count: studentCount } = await supabaseAdmin
      .from('students')
      .select('id', { count: 'exact' })
      .eq('school_id', schoolId)

    const admissionNumber = `${prefix}-${String((studentCount || 0) + 1).padStart(3, '0')}`

    // Create student
    const { data: newStudent, error: createError } = await supabaseAdmin
      .from('students')
      .insert({
        school_id: schoolId,
        class_id: classId,
        full_name: fullName.trim(),
        admission_number: admissionNumber,
        parent_name: parentName.trim(),
        parent_phone: normalizedPhone,
        parent_email: parentEmail?.trim() || null,
        is_active: true
      })
      .select()
      .single()

    if (createError) throw new Error(createError.message)

    // Auto-create fee bill for active term
    const { data: term } = await supabaseAdmin
      .from('terms')
      .select('id, name, session')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .single()

    if (term) {
      // Get fee items for this class
      const { data: feeItems } = await supabaseAdmin
        .from('fee_items')
        .select('amount')
        .eq('school_id', schoolId)
        .eq('term_id', term.id)
        .eq('class_id', classId)
        .eq('is_compulsory', true)

      const totalAmount = feeItems?.reduce(
        (sum, item) => sum + Number(item.amount), 0
      ) || 0

      // Generate payment reference
      const year = new Date().getFullYear()
      const { count: billCount } = await supabaseAdmin
        .from('fee_bills')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)

      const paymentReference = `${prefix}-${year}-${String((billCount || 0) + 1).padStart(4, '0')}`

      // Create fee bill
      await supabaseAdmin
        .from('fee_bills')
        .insert({
          student_id: newStudent.id,
          term_id: term.id,
          school_id: schoolId,
          total_amount: totalAmount,
          amount_paid: 0,
          status: 'unpaid',
          payment_reference: paymentReference
        })
    }

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        id: newStudent.id,
        fullName: newStudent.full_name,
        admissionNumber: newStudent.admission_number,
        parentName: newStudent.parent_name,
        parentPhone: newStudent.parent_phone,
        parentEmail: newStudent.parent_email,
        className: cls.name,
        classId: cls.id,
        createdAt: newStudent.created_at
      }
    })

  } catch (error) {
    console.error('Create student error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create student',
      code: 'CREATE_STUDENT_ERROR'
    })
  }
}

// ─── GET STUDENT PROFILE ──────────────────────────────────────────────────────
export async function getStudent(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params

    // Get student details
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        full_name,
        admission_number,
        parent_name,
        parent_phone,
        parent_email,
        is_active,
        created_at,
        classes (
          id,
          name
        )
      `)
      .eq('id', id)
      .eq('school_id', schoolId)
      .single()

    if (error || !student) {
      res.status(404).json({
        success: false,
        error: 'Student not found',
        code: 'STUDENT_NOT_FOUND'
      })
      return
    }

    // Get all fee bills for this student
    const { data: bills } = await supabaseAdmin
      .from('fee_bills')
      .select(`
        id,
        total_amount,
        amount_paid,
        status,
        payment_reference,
        created_at,
        terms (
          id,
          name,
          session,
          is_active
        )
      `)
      .eq('student_id', id)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    // Get payment history for this student
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        amount,
        payment_date,
        receipt_number,
        receipt_url,
        whatsapp_sent,
        created_at,
        terms (
          name,
          session
        )
      `)
      .eq('student_id', id)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    // Get current active term bill
    const currentBill = bills?.find(b => (b.terms as any)?.is_active)

    res.json({
      success: true,
      data: {
        id: student.id,
        fullName: student.full_name,
        admissionNumber: student.admission_number,
        parentName: student.parent_name,
        parentPhone: student.parent_phone,
        parentEmail: student.parent_email,
        isActive: student.is_active,
        className: (student.classes as any)?.name,
        classId: (student.classes as any)?.id,
        createdAt: student.created_at,
        currentBill: currentBill ? {
          id: currentBill.id,
          totalAmount: Number(currentBill.total_amount),
          amountPaid: Number(currentBill.amount_paid),
          balance: Number(currentBill.total_amount) - Number(currentBill.amount_paid),
          status: currentBill.status,
          paymentReference: currentBill.payment_reference,
          termName: (currentBill.terms as any)?.name,
          session: (currentBill.terms as any)?.session
        } : null,
        paymentHistory: payments?.map(p => ({
          id: p.id,
          amount: Number(p.amount),
          paymentDate: p.payment_date,
          receiptNumber: p.receipt_number,
          receiptUrl: p.receipt_url,
          whatsappSent: p.whatsapp_sent,
          termName: (p.terms as any)?.name,
          session: (p.terms as any)?.session,
          createdAt: p.created_at
        })) || [],
        allBills: bills?.map(b => ({
          id: b.id,
          totalAmount: Number(b.total_amount),
          amountPaid: Number(b.amount_paid),
          balance: Number(b.total_amount) - Number(b.amount_paid),
          status: b.status,
          paymentReference: b.payment_reference,
          termName: (b.terms as any)?.name,
          session: (b.terms as any)?.session,
          isActive: (b.terms as any)?.is_active
        })) || []
      }
    })

  } catch (error) {
    console.error('Get student error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student',
      code: 'GET_STUDENT_ERROR'
    })
  }
}

// ─── UPDATE STUDENT ───────────────────────────────────────────────────────────
export async function updateStudent(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params
    const {
      fullName,
      classId,
      parentName,
      parentPhone,
      parentEmail
    } = req.body

    // Verify student belongs to school
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .single()

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: 'Student not found',
        code: 'STUDENT_NOT_FOUND'
      })
      return
    }

    // Build update object
    const updates: Record<string, any> = {}
    if (fullName) updates.full_name = fullName.trim()
    if (classId) updates.class_id = classId
    if (parentName) updates.parent_name = parentName.trim()
    if (parentEmail !== undefined) updates.parent_email = parentEmail?.trim() || null

    if (parentPhone) {
      const normalized = normalizePhone(parentPhone)
      if (!normalized) {
        res.status(400).json({
          success: false,
          error: 'Invalid Nigerian phone number format',
          code: 'INVALID_PHONE'
        })
        return
      }
      updates.parent_phone = normalized
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('students')
      .update(updates)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: {
        id: updated.id,
        fullName: updated.full_name,
        admissionNumber: updated.admission_number,
        parentName: updated.parent_name,
        parentPhone: updated.parent_phone,
        parentEmail: updated.parent_email,
        classId: updated.class_id
      }
    })

  } catch (error) {
    console.error('Update student error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update student',
      code: 'UPDATE_STUDENT_ERROR'
    })
  }
}

// ─── SOFT DELETE STUDENT ──────────────────────────────────────────────────────
export async function deleteStudent(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('students')
      .update({ is_active: false })
      .eq('id', id)
      .eq('school_id', schoolId)

    if (error) throw new Error(error.message)

    res.json({
      success: true,
      message: 'Student deactivated successfully'
    })

  } catch (error) {
    console.error('Delete student error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate student',
      code: 'DELETE_STUDENT_ERROR'
    })
  }
}

// ─── GET CLASSES ──────────────────────────────────────────────────────────────
export async function getClasses(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId

    const { data: classes, error } = await supabaseAdmin
      .from('classes')
      .select(`
        id,
        name,
        created_at
      `)
      .eq('school_id', schoolId)
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)

    // Get student count per class
    const classesWithCount = await Promise.all(
      (classes || []).map(async (cls) => {
        const { count } = await supabaseAdmin
          .from('students')
          .select('id', { count: 'exact' })
          .eq('class_id', cls.id)
          .eq('is_active', true)

        return {
          id: cls.id,
          name: cls.name,
          studentCount: count || 0
        }
      })
    )

    res.json({
      success: true,
      data: classesWithCount
    })

  } catch (error) {
    console.error('Get classes error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes',
      code: 'GET_CLASSES_ERROR'
    })
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/\s+/g, '').replace(/[-()]/g, '')

  let result = cleaned

  if (cleaned.startsWith('+234')) {
    result = '0' + cleaned.slice(4)
  } else if (cleaned.startsWith('234') && cleaned.length === 13) {
    result = '0' + cleaned.slice(3)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    result = cleaned
  } else {
    return null
  }

  const validPrefixes = ['070', '071', '080', '081', '090', '091']
  const isValid = validPrefixes.some(prefix => result.startsWith(prefix))
  if (!isValid || result.length !== 11) return null

  return result
}
