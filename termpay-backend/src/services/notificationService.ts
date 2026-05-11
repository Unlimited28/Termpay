import { supabaseAdmin } from '../config/supabase'
import { env } from '../config/env'

export interface NotificationPayload {
  parentPhone: string
  parentName: string
  studentName: string
  className: string
  amount: number
  termName: string
  session: string
  balance: number
  receiptNumber: string
  paymentDate: string
  schoolName: string
}

export interface ReminderPayload {
  parentPhone: string
  parentName: string
  studentName: string
  className: string
  totalAmount: number
  amountPaid: number
  balance: number
  termName: string
  session: string
  paymentReference: string
  bankName: string
  accountNumber: string
  accountName: string
  schoolName: string
}

export type NotificationStatus = 'sent' | 'failed' | 'mock'
export type NotificationChannel = 'whatsapp' | 'sms'

// ─── MESSAGE TEMPLATES ────────────────────────────────────────────────────────
function buildPaymentMessage(payload: NotificationPayload): string {
  return `Hello ${payload.parentName},

Payment received! ✅

Student: ${payload.studentName}
Class: ${payload.className}
Amount Paid: ₦${payload.amount.toLocaleString()}
Term: ${payload.termName} ${payload.session}
Balance Remaining: ₦${payload.balance.toLocaleString()}
Receipt No: ${payload.receiptNumber}
Date: ${payload.paymentDate}

${payload.balance <= 0
    ? '🎉 Fees fully settled for this term!'
    : `Outstanding: ₦${payload.balance.toLocaleString()} remaining.`
  }

— ${payload.schoolName} (Powered by TermPay)`
}

function buildReminderMessage(payload: ReminderPayload): string {
  return `Hello ${payload.parentName},

Friendly reminder from ${payload.schoolName}.

Student: ${payload.studentName}
Class: ${payload.className}
Term: ${payload.termName} ${payload.session}
Amount Due: ₦${payload.totalAmount.toLocaleString()}
Amount Paid: ₦${payload.amountPaid.toLocaleString()}
Balance Outstanding: ₦${payload.balance.toLocaleString()}

Please make payment to:
Bank: ${payload.bankName}
Account: ${payload.accountNumber}
Account Name: ${payload.accountName}
Reference: ${payload.paymentReference}

Include your payment reference in your transfer narration.

Thank you.
— ${payload.schoolName}`
}

// ─── WHATSAPP SENDER (WatiAPI) ────────────────────────────────────────────────
async function sendWhatsApp(
  phone: string,
  message: string
): Promise<boolean> {
  if (!env.watiApiToken || !env.watiApiUrl) {
    return false
  }

  try {
    // Nigerian numbers only — format: 0XXXXXXXXXX → 234XXXXXXXXXX for WatiAPI
    // International number support is out of scope for current product version
    const formattedPhone = phone.startsWith('0')
      ? '234' + phone.slice(1)
      : phone.replace('+', '')

    const response = await fetch(
      `${env.watiApiUrl}/api/v1/sendSessionMessage/${formattedPhone}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.watiApiToken}`
        },
        body: JSON.stringify({ messageText: message })
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`WatiAPI error: ${response.status} — ${errorBody}`)
      return false
    }

    return true

  } catch (error) {
    console.error('WhatsApp send error:', error)
    return false
  }
}

// ─── SMS SENDER (Termii) ──────────────────────────────────────────────────────
async function sendSMS(
  phone: string,
  message: string
): Promise<boolean> {
  if (!env.termiiApiKey) {
    return false
  }

  try {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        from: env.termiiSenderId,
        sms: message.substring(0, 160), // SMS character limit
        type: 'plain',
        channel: 'dnd',
        api_key: env.termiiApiKey
      })
    })

    if (!response.ok) {
      console.error(`Termii SMS error: ${response.status}`)
      return false
    }

    return true

  } catch (error) {
    console.error('SMS send error:', error)
    return false
  }
}

// ─── MOCK LOGGER ──────────────────────────────────────────────────────────────
function logMockNotification(
  channel: string,
  phone: string,
  message: string
): void {
  console.log(`
${'='.repeat(50)}
${channel.toUpperCase()} NOTIFICATION (MOCK — no credentials)
To: ${phone}
Message:
${message}
${'='.repeat(50)}
  `)
}

// ─── MAIN NOTIFICATION SERVICE ────────────────────────────────────────────────
export class NotificationService {

  // Send payment receipt notification to parent
  async sendPaymentNotification(
    payload: NotificationPayload,
    schoolId: string,
    paymentId: string,
    studentId: string
  ): Promise<void> {
    const message = buildPaymentMessage(payload)
    let status: NotificationStatus = 'mock'
    let channel: NotificationChannel = 'whatsapp'

    // Try WhatsApp first
    const whatsappSent = await sendWhatsApp(payload.parentPhone, message)

    if (whatsappSent) {
      status = 'sent'
      channel = 'whatsapp'

      // Update payment record
      await supabaseAdmin
        .from('payments')
        .update({ whatsapp_sent: true })
        .eq('id', paymentId)

    } else {
      // WhatsApp failed or no credentials — try SMS fallback
      const smsSent = await sendSMS(payload.parentPhone, message)

      if (smsSent) {
        status = 'sent'
        channel = 'sms'
      } else {
        // Both failed — log mock
        logMockNotification('WHATSAPP/SMS', payload.parentPhone, message)
        // If watiApiToken is present in environment but both WhatsApp and SMS fail the status is failed — not mock.
        status = env.watiApiToken ? 'failed' : 'mock'
      }
    }

    // Log notification attempt
    await this.logNotification({
      schoolId,
      paymentId,
      studentId,
      parentPhone: payload.parentPhone,
      channel,
      message,
      status
    })
  }

  // Send payment reminder to parent
  async sendReminderNotification(
    payload: ReminderPayload,
    schoolId: string,
    studentId: string
  ): Promise<NotificationStatus> {
    const message = buildReminderMessage(payload)
    let status: NotificationStatus = 'mock'
    let channel: NotificationChannel = 'whatsapp'

    const whatsappSent = await sendWhatsApp(payload.parentPhone, message)

    if (whatsappSent) {
      status = 'sent'
      channel = 'whatsapp'
    } else {
      const smsSent = await sendSMS(payload.parentPhone, message)

      if (smsSent) {
        status = 'sent'
        channel = 'sms'
      } else {
        logMockNotification('REMINDER', payload.parentPhone, message)
        status = env.watiApiToken ? 'failed' : 'mock'
      }
    }

    await this.logNotification({
      schoolId,
      paymentId: null,
      studentId,
      parentPhone: payload.parentPhone,
      channel,
      message,
      status
    })

    return status
  }

  // Log notification to database
  private async logNotification(params: {
    schoolId: string
    paymentId: string | null
    studentId: string
    parentPhone: string
    channel: NotificationChannel
    message: string
    status: NotificationStatus
  }): Promise<void> {
    try {
      await supabaseAdmin
        .from('notification_log')
        .insert({
          school_id: params.schoolId,
          payment_id: params.paymentId,
          student_id: params.studentId,
          parent_phone: params.parentPhone,
          channel: params.channel,
          message: params.message,
          status: params.status
        })
    } catch (error) {
      console.error('Notification log error:', error)
      // Never throw — logging failure must not affect payment flow
    }
  }
}

export const notificationService = new NotificationService()
