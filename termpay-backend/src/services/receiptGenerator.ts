import PDFDocument from 'pdfkit'
import { supabaseAdmin } from '../config/supabase'

export interface ReceiptData {
  receiptNumber: string
  paymentDate: string
  amount: number
  studentName: string
  admissionNumber: string | null
  className: string
  termName: string
  session: string
  totalBill: number
  amountPaid: number
  balance: number
  paymentMethod: string
  schoolName: string
  schoolAddress: string | null
  schoolPhone: string | null
  bankName: string | null
  accountNumber: string | null
  feeItems: { name: string; amount: number }[]
  isVoided?: boolean
}

export interface GeneratedReceipt {
  buffer: Buffer
  receiptNumber: string
  fileName: string
}

// ─── COLOURS ──────────────────────────────────────────────────────────────────
const COLORS = {
  navy: '#0D2137',
  emerald: '#10B981',
  dark: '#1A1A2E',
  gray: '#64748B',
  lightGray: '#F1F5F9',
  red: '#EF4444',
  white: '#FFFFFF',
  border: '#E2E8F0'
}

// ─── RECEIPT GENERATOR CLASS ──────────────────────────────────────────────────
export class ReceiptGenerator {

  generatePDF(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A5',
          margin: 40,
          info: {
            Title: `Receipt ${data.receiptNumber}`,
            Author: 'TermPay',
            Subject: `School Fee Receipt - ${data.studentName}`
          }
        })

        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        this.buildReceipt(doc, data)

        doc.end()

      } catch (error) {
        reject(error)
      }
    })
  }

  private buildReceipt(doc: PDFKit.PDFDocument, data: ReceiptData): void {
    const pageWidth = doc.page.width
    const margin = 40
    const contentWidth = pageWidth - (margin * 2)

    // ── HEADER ────────────────────────────────────────────────────────────────
    // Navy header background
    doc.rect(0, 0, pageWidth, 100)
      .fill(COLORS.navy)

    // School name
    doc.fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(data.schoolName, margin, 20, {
        width: contentWidth - 80,
        align: 'left'
      })

    // OFFICIAL FEE RECEIPT label
    doc.fillColor(COLORS.emerald)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('OFFICIAL FEE RECEIPT', margin, 45, {
        width: contentWidth,
        align: 'right'
      })

    // School address and phone
    if (data.schoolAddress || data.schoolPhone) {
      doc.fillColor('#94A3B8')
        .font('Helvetica')
        .fontSize(8)
        .text(
          [data.schoolAddress, data.schoolPhone].filter(Boolean).join(' · '),
          margin, 58,
          { width: contentWidth - 80 }
        )
    }

    // TermPay powered label
    doc.fillColor('#475569')
      .font('Helvetica')
      .fontSize(7)
      .text('Powered by TermPay', margin, 80, {
        width: contentWidth,
        align: 'right'
      })

    // ── RECEIPT DETAILS ROW ───────────────────────────────────────────────────
    let yPos = 115

    // Left block: student info
    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(8)
      .text('STUDENT', margin, yPos)

    doc.fillColor(COLORS.dark)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(data.studentName, margin, yPos + 12)

    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(8)
      .text(`${data.className} · ${data.admissionNumber || 'N/A'}`, margin, yPos + 27)

    // Right block: receipt info
    const rightCol = margin + (contentWidth / 2)

    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(8)
      .text('RECEIPT NO', rightCol, yPos)

    doc.fillColor(COLORS.dark)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(data.receiptNumber, rightCol, yPos + 12)

    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(8)
      .text(`Date: ${this.formatDate(data.paymentDate)}`, rightCol, yPos + 27)
      .text(`Term: ${data.termName} ${data.session}`, rightCol, yPos + 38)

    // ── DIVIDER ───────────────────────────────────────────────────────────────
    yPos += 60
    doc.moveTo(margin, yPos)
      .lineTo(margin + contentWidth, yPos)
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .stroke()

    // ── FEE BREAKDOWN TABLE ───────────────────────────────────────────────────
    yPos += 16

    // Table header
    doc.fillColor(COLORS.gray)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('FEE ITEM', margin, yPos)
      .text('AMOUNT', margin + contentWidth - 60, yPos, { width: 60, align: 'right' })

    yPos += 14

    // Light separator
    doc.moveTo(margin, yPos)
      .lineTo(margin + contentWidth, yPos)
      .strokeColor(COLORS.lightGray)
      .lineWidth(0.5)
      .stroke()

    yPos += 8

    // Fee items rows
    const feeItems = data.feeItems.length > 0
      ? data.feeItems
      : [{ name: 'School Fees', amount: data.totalBill }]

    for (const item of feeItems) {
      doc.fillColor(COLORS.dark)
        .font('Helvetica')
        .fontSize(9)
        .text(item.name, margin, yPos)
        .text(`₦${this.formatAmount(item.amount)}`, margin + contentWidth - 60, yPos, {
          width: 60,
          align: 'right'
        })

      yPos += 16
    }

    // ── TOTALS SECTION ────────────────────────────────────────────────────────
    yPos += 4

    doc.moveTo(margin, yPos)
      .lineTo(margin + contentWidth, yPos)
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .stroke()

    yPos += 10

    // Total Bill
    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(9)
      .text('Total Bill', margin, yPos)
      .fillColor(COLORS.dark)
      .font('Helvetica-Bold')
      .text(`₦${this.formatAmount(data.totalBill)}`, margin + contentWidth - 80, yPos, {
        width: 80,
        align: 'right'
      })

    yPos += 16

    // Amount Paid This Transaction
    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(9)
      .text('Amount Paid (This Payment)', margin, yPos)
      .fillColor(COLORS.emerald)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`₦${this.formatAmount(data.amount)}`, margin + contentWidth - 80, yPos, {
        width: 80,
        align: 'right'
      })

    yPos += 18

    // Total Paid This Term
    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(9)
      .text('Total Paid This Term', margin, yPos)
      .fillColor(COLORS.dark)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(`₦${this.formatAmount(data.amountPaid)}`, margin + contentWidth - 80, yPos, {
        width: 80,
        align: 'right'
      })

    yPos += 16

    // Balance Remaining
    const balanceColor = data.balance <= 0 ? COLORS.emerald : COLORS.red
    const balanceText = data.balance <= 0 ? 'FULLY SETTLED' : `₦${this.formatAmount(data.balance)}`

    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(9)
      .text('Balance Remaining', margin, yPos)
      .fillColor(balanceColor)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(balanceText, margin + contentWidth - 80, yPos, {
        width: 80,
        align: 'right'
      })

    yPos += 16

    // Payment Method
    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(8)
      .text(`Payment Method: ${data.paymentMethod}`, margin, yPos)

    // ── FOOTER ────────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 60

    doc.moveTo(margin, footerY)
      .lineTo(margin + contentWidth, footerY)
      .strokeColor(COLORS.lightGray)
      .lineWidth(0.5)
      .stroke()

    doc.fillColor(COLORS.gray)
      .font('Helvetica')
      .fontSize(7)
      .text(
        'This is an official computer-generated receipt. No signature required.',
        margin,
        footerY + 8,
        { width: contentWidth, align: 'center' }
      )
      .text(
        'TermPay — Smart Payment Intelligence for Nigerian Schools · termpay.ng',
        margin,
        footerY + 20,
        { width: contentWidth, align: 'center' }
      )

    // ── VOIDED WATERMARK ──────────────────────────────────────────────────────
    if (data.isVoided) {
      doc.save()
      doc.translate(pageWidth / 2, doc.page.height / 2)
      doc.rotate(-45)
      doc.fillColor(COLORS.red)
        .opacity(0.15)
        .font('Helvetica-Bold')
        .fontSize(80)
        .text('VOIDED', -150, -40, { width: 300, align: 'center' })
      doc.restore()
      doc.opacity(1)
    }
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  private formatAmount(amount: number): string {
    return amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }
}

export const receiptGenerator = new ReceiptGenerator()

// ─── UPLOAD RECEIPT TO STORAGE ────────────────────────────────────────────────
export async function uploadReceiptToStorage(
  pdfBuffer: Buffer,
  schoolId: string,
  receiptNumber: string
): Promise<string | null> {
  try {
    const fileName = `${receiptNumber}.pdf`
    const storagePath = `${schoolId}/${fileName}`

    const { error } = await supabaseAdmin.storage
      .from('receipts')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (error) {
      console.error('Receipt storage upload error:', error)
      return null
    }

    return storagePath

  } catch (error) {
    console.error('Receipt upload error:', error)
    return null
  }
}

// ─── GET SIGNED URL ───────────────────────────────────────────────────────────
export async function getReceiptSignedUrl(
  storagePath: string
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('receipts')
      .createSignedUrl(storagePath, 60 * 60) // 1 hour expiry

    if (error || !data) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl

  } catch (error) {
    console.error('Get signed URL error:', error)
    return null
  }
}

// ─── GENERATE AND STORE RECEIPT ───────────────────────────────────────────────
export async function generateAndStoreReceipt(
  paymentId: string,
  schoolId: string
): Promise<{ receiptUrl: string | null; receiptNumber: string }> {

  // Get payment with all related data
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select(`
      id,
      amount,
      payment_date,
      receipt_number,
      students (
        id,
        full_name,
        admission_number,
        class_id,
        classes (
          name
        )
      ),
      fee_bills (
        id,
        total_amount,
        amount_paid
      ),
      terms (
        id,
        name,
        session
      )
    `)
    .eq('id', paymentId)
    .eq('school_id', schoolId)
    .single()

  if (paymentError || !payment) {
    throw new Error(`Payment not found: ${paymentError?.message}`)
  }

  // Get school details
  const { data: school } = await supabaseAdmin
    .from('schools')
    .select('name, address, phone, bank_name, bank_account_number')
    .eq('id', schoolId)
    .single()

  const student = payment.students as any
  const bill = payment.fee_bills as any
  const term = payment.terms as any

  // Get fee items for this specific class
  const { data: feeItems } = await supabaseAdmin
    .from('fee_items')
    .select('name, amount')
    .eq('term_id', term?.id || '')
    .eq('school_id', schoolId)
    .eq('class_id', student?.class_id || '')
    .eq('is_compulsory', true)

  const receiptData: ReceiptData = {
    receiptNumber: payment.receipt_number!,
    paymentDate: payment.payment_date,
    amount: Number(payment.amount),
    studentName: student?.full_name || 'Unknown',
    admissionNumber: student?.admission_number || null,
    className: student?.classes?.name || 'Unknown',
    termName: term?.name || '',
    session: term?.session || '',
    totalBill: Number(bill?.total_amount || 0),
    amountPaid: Number(bill?.amount_paid || 0),
    balance: Number(bill?.total_amount || 0) - Number(bill?.amount_paid || 0),
    paymentMethod: 'Bank Transfer',
    schoolName: school?.name || 'School',
    schoolAddress: school?.address || null,
    schoolPhone: school?.phone || null,
    bankName: school?.bank_name || null,
    accountNumber: school?.bank_account_number || null,
    feeItems: (feeItems && feeItems.length > 0)
      ? feeItems.map(f => ({
          name: f.name,
          amount: Number(f.amount)
        }))
      : [{ name: 'School Fees', amount: Number(bill?.total_amount || 0) }],
    isVoided: false
  }

  // Generate PDF
  const pdfBuffer = await receiptGenerator.generatePDF(receiptData)

  // Upload to storage
  const storagePath = await uploadReceiptToStorage(
    pdfBuffer,
    schoolId,
    payment.receipt_number!
  )

  // Update payment record with receipt URL
  if (storagePath) {
    await supabaseAdmin
      .from('payments')
      .update({ receipt_url: storagePath })
      .eq('id', paymentId)
  }

  return {
    receiptUrl: storagePath,
    receiptNumber: payment.receipt_number!
  }
}
