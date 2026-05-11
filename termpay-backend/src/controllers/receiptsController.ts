import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import {
  getReceiptSignedUrl,
  generateAndStoreReceipt
} from '../services/receiptGenerator'

// ─── LIST RECEIPTS ────────────────────────────────────────────────────────────
export async function listReceipts(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const {
      search,
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
          classes (
            name
          )
        ),
        terms (
          name,
          session
        )
      `, { count: 'exact' })
      .eq('school_id', schoolId)
      .not('receipt_number', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    // Add search logic if needed in the future
    // if (search) { ... }

    const { data: payments, error, count } = await query

    if (error) throw new Error(error.message)

    const formatted = payments?.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      paymentDate: p.payment_date,
      receiptNumber: p.receipt_number,
      hasReceiptFile: !!p.receipt_url,
      whatsappSent: p.whatsapp_sent,
      studentId: (p.students as any)?.id,
      studentName: (p.students as any)?.full_name,
      className: (p.students as any)?.classes?.name,
      termName: (p.terms as any)?.name,
      session: (p.terms as any)?.session,
      createdAt: p.created_at
    })) || []

    res.json({
      success: true,
      data: formatted,
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    })

  } catch (error) {
    console.error('List receipts error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipts',
      code: 'LIST_RECEIPTS_ERROR'
    })
  }
}

// ─── DOWNLOAD RECEIPT ─────────────────────────────────────────────────────────
export async function downloadReceipt(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params

    // Get payment record
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('id, receipt_number, receipt_url, school_id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .single()

    if (error || !payment) {
      res.status(404).json({
        success: false,
        error: 'Receipt not found',
        code: 'RECEIPT_NOT_FOUND'
      })
      return
    }

    // If no receipt file exists yet generate it now
    if (!payment.receipt_url) {
      const { receiptUrl } = await generateAndStoreReceipt(id, schoolId)

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
      return
    }

    // Get signed URL for existing receipt
    const signedUrl = await getReceiptSignedUrl(payment.receipt_url)

    if (!signedUrl) {
      // Receipt file may be missing from storage
      // Regenerate it
      const { receiptUrl } = await generateAndStoreReceipt(id, schoolId)
      const newSignedUrl = receiptUrl
        ? await getReceiptSignedUrl(receiptUrl)
        : null

      res.json({
        success: true,
        data: {
          receiptNumber: payment.receipt_number,
          downloadUrl: newSignedUrl,
          expiresIn: '1 hour'
        }
      })
      return
    }

    res.json({
      success: true,
      data: {
        receiptNumber: payment.receipt_number,
        downloadUrl: signedUrl,
        expiresIn: '1 hour'
      }
    })

  } catch (error) {
    console.error('Download receipt error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get receipt download link',
      code: 'DOWNLOAD_ERROR'
    })
  }
}

// ─── GENERATE RECEIPT FOR PAYMENT ─────────────────────────────────────────────
export async function generateReceipt(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId
    const { id } = req.params

    const { receiptUrl, receiptNumber } = await generateAndStoreReceipt(id, schoolId)

    res.json({
      success: true,
      message: 'Receipt generated successfully',
      data: {
        receiptNumber,
        receiptUrl,
        generated: true
      }
    })

  } catch (error) {
    console.error('Generate receipt error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate receipt',
      code: 'GENERATE_ERROR'
    })
  }
}
