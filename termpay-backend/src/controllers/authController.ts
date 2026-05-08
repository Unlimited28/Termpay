import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { supabaseAdmin, supabaseAuth } from '../config/supabase'
import { env } from '../config/env'
import { JWTPayload, ParentJWTPayload, UserRole } from '../types'

// ─── ADMIN LOGIN ─────────────────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      })
      return
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    })

    if (authError || !authData.user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      })
      return
    }

    // Get admin record from admins table
    // TODO: Replace with proper Supabase join type in future refactor
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .select(`
        id,
        school_id,
        full_name,
        role,
        phone,
        schools (
          id,
          name,
          school_prefix,
          bank_name,
          bank_account_number,
          bank_account_name
        )
      `)
      .eq('id', authData.user.id)
      .single()

    if (adminError || !adminData) {
      res.status(403).json({
        success: false,
        error: 'Admin account not found. Contact your administrator.',
        code: 'ADMIN_NOT_FOUND'
      })
      return
    }

    // Sign custom JWT
    const payload: JWTPayload = {
      userId: authData.user.id,
      schoolId: adminData.school_id,
      role: adminData.role as UserRole,
      email: authData.user.email!
    }

    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as any
    })

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: adminData.id,
          email: authData.user.email,
          fullName: adminData.full_name,
          role: adminData.role,
          schoolId: adminData.school_id,
          schoolName: (adminData.schools as any)?.name,
          schoolPrefix: (adminData.schools as any)?.school_prefix,
        }
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'An error occurred during login',
      code: 'LOGIN_ERROR'
    })
  }
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
export async function logout(req: Request, res: Response): Promise<void> {
  // JWT is stateless. Client must delete token on logout.
  // Server-side denylist not implemented — add in future if compliance requires it.
  try {
    await supabaseAuth.auth.signOut()
  } catch (error) {
    // Ignore signout errors — token deletion on client is sufficient
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  })
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      })
      return
    }

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${env.frontendUrl}/reset-password`
      }
    )

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      error: 'An error occurred',
      code: 'FORGOT_PASSWORD_ERROR'
    })
  }
}

// ─── PARENT OTP REQUEST ───────────────────────────────────────────────────────
export async function requestParentOTP(req: Request, res: Response): Promise<void> {
  try {
    const { phone } = req.body

    if (!phone) {
      res.status(400).json({
        success: false,
        error: 'Phone number is required',
        code: 'MISSING_PHONE'
      })
      return
    }

    // Normalize phone number
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone) {
      res.status(400).json({
        success: false,
        error: 'Invalid Nigerian phone number format',
        code: 'INVALID_PHONE'
      })
      return
    }

    // Check if phone exists as a parent in any school
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('id, school_id, full_name')
      .eq('parent_phone', normalizedPhone)
      .eq('is_active', true)

    if (studentsError || !students || students.length === 0) {
      // Return success anyway to prevent phone enumeration
      res.json({
        success: true,
        message: 'If this number is registered, an OTP has been sent'
      })
      return
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing unused OTPs for this phone
    await supabaseAdmin
      .from('otps')
      .delete()
      .eq('phone', normalizedPhone)
      .eq('used', false)

    // Store OTP
    const { error: otpError } = await supabaseAdmin
      .from('otps')
      .insert({
        phone: normalizedPhone,
        code: otp,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (otpError) {
      throw new Error(`OTP storage failed: ${otpError.message}`)
    }

    // Send OTP via Termii SMS
    const smsSent = await sendOTPSMS(normalizedPhone, otp)

    if (!smsSent) {
      // Log to console in development
      console.log(`
========= OTP (MOCK) =========
Phone: ${normalizedPhone}
OTP Code: ${otp}
Expires: ${expiresAt.toISOString()}
==============================
      `)
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Only include OTP in development for testing
      ...(env.nodeEnv === 'development' && { debug_otp: otp })
    })

  } catch (error) {
    console.error('OTP request error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
      code: 'OTP_ERROR'
    })
  }
}

// ─── PARENT OTP VERIFY ────────────────────────────────────────────────────────
export async function verifyParentOTP(req: Request, res: Response): Promise<void> {
  try {
    const { phone, code } = req.body

    if (!phone || !code) {
      res.status(400).json({
        success: false,
        error: 'Phone and OTP code are required',
        code: 'MISSING_FIELDS'
      })
      return
    }

    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone) {
      res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
        code: 'INVALID_PHONE'
      })
      return
    }

    // Find valid OTP
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otps')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpRecord) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired OTP',
        code: 'INVALID_OTP'
      })
      return
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('otps')
      .update({ used: true })
      .eq('id', otpRecord.id)

    // Get all students for this parent phone
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('id, school_id, full_name, class_id')
      .eq('parent_phone', normalizedPhone)
      .eq('is_active', true)

    if (studentsError || !students || students.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No students found for this phone number',
        code: 'NO_STUDENTS'
      })
      return
    }

    // All students should belong to same school
    const schoolId = students[0].school_id

    // Sign parent JWT
    const payload: ParentJWTPayload = {
      parentPhone: normalizedPhone,
      schoolId,
      studentIds: students.map(s => s.id),
      type: 'parent'
    }

    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: '30d'
    })

    res.json({
      success: true,
      data: {
        token,
        students: students.map(s => ({
          id: s.id,
          fullName: s.full_name,
          classId: s.class_id
        }))
      }
    })

  } catch (error) {
    console.error('OTP verify error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
      code: 'VERIFY_ERROR'
    })
  }
}

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    // TODO: Replace with proper Supabase join type in future refactor
    const { data: adminData, error } = await supabaseAdmin
      .from('admins')
      .select(`
        id,
        school_id,
        full_name,
        role,
        phone,
        schools (
          id,
          name,
          school_prefix,
          bank_name,
          bank_account_number,
          bank_account_name,
          logo_url
        )
      `)
      .eq('id', req.user!.userId)
      .single()

    if (error || !adminData) {
      res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
      return
    }

    res.json({
      success: true,
      data: {
        id: adminData.id,
        fullName: adminData.full_name,
        role: adminData.role,
        schoolId: adminData.school_id,
        schoolName: (adminData.schools as any)?.name,
        schoolPrefix: (adminData.schools as any)?.school_prefix,
        bankName: (adminData.schools as any)?.bank_name,
        accountNumber: (adminData.schools as any)?.bank_account_number,
        accountName: (adminData.schools as any)?.bank_account_name,
        logoUrl: (adminData.schools as any)?.logo_url,
      }
    })

  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get user data',
      code: 'GET_USER_ERROR'
    })
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function normalizePhone(phone: string): string | null {
  let cleaned = phone.replace(/\s+/g, '').replace(/[-()]/g, '')

  let result: string | null = null

  // Convert +234 to 0
  if (cleaned.startsWith('+234')) {
    result = '0' + cleaned.slice(4)
  }
  // Already starts with 0
  else if (cleaned.startsWith('0') && cleaned.length === 11) {
    result = cleaned
  }
  // Starts with 234 (no plus)
  else if (cleaned.startsWith('234') && cleaned.length === 13) {
    result = '0' + cleaned.slice(3)
  }

  if (!result) return null

  const validPrefixes = ['070', '071', '080', '081', '090', '091']
  const isValid = validPrefixes.some(prefix => result!.startsWith(prefix))

  if (!isValid || result.length !== 11) return null

  return result
}

async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  if (!env.termiiApiKey) {
    return false // Will use console mock
  }

  try {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        from: env.termiiSenderId,
        sms: `Your TermPay verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        type: 'plain',
        channel: 'dnd',
        api_key: env.termiiApiKey
      })
    })

    return response.ok
  } catch (error) {
    console.error('SMS send error:', error)
    return false
  }
}
