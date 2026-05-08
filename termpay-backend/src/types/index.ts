import { Request } from 'express'

export type UserRole = 'super_admin' | 'proprietor' | 'bursar' | 'teacher'

export interface JWTPayload {
  userId: string
  schoolId: string
  role: UserRole
  email: string
  iat?: number
  exp?: number
}

export interface ParentJWTPayload {
  parentPhone: string
  schoolId: string
  studentIds: string[]
  type: 'parent'
  iat?: number
  exp?: number
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface School {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  school_prefix: string
  logo_url: string | null
  created_at: string
}

export interface Admin {
  id: string
  school_id: string
  full_name: string | null
  role: UserRole
  phone: string | null
  created_at: string
}

export interface Student {
  id: string
  school_id: string
  class_id: string | null
  full_name: string
  admission_number: string | null
  parent_name: string | null
  parent_phone: string
  parent_email: string | null
  is_active: boolean
  created_at: string
}

export interface Term {
  id: string
  school_id: string
  name: string
  session: string
  is_active: boolean
  created_at: string
}

export interface FeeBill {
  id: string
  student_id: string
  term_id: string
  school_id: string
  total_amount: number
  amount_paid: number
  status: 'unpaid' | 'partial' | 'paid'
  payment_reference: string | null
  created_at: string
}

export interface Payment {
  id: string
  school_id: string
  student_id: string
  bill_id: string
  transaction_id: string | null
  term_id: string
  amount: number
  payment_date: string
  receipt_number: string | null
  receipt_url: string | null
  whatsapp_sent: boolean
  created_at: string
}

export interface BankTransaction {
  id: string
  upload_id: string
  school_id: string
  transaction_date: string | null
  sender_name: string | null
  amount: number
  narration: string | null
  is_matched: boolean
  match_confidence: 'HIGH' | 'MEDIUM' | 'NEEDS_REVIEW' | 'UNMATCHED' | null
  matched_student_id: string | null
  matched_bill_id: string | null
  created_at: string
}
