export type Role = 'super_admin' | 'proprietor' | 'bursar' | 'teacher'

export interface AdminUser {
  id: string
  email: string
  fullName: string
  role: Role
  schoolId: string
  schoolName: string
}

export interface School {
  id: string
  name: string
  address: string
  bankName: string
  accountNumber: string
  accountName: string
  schoolPrefix: string
}

export interface Term {
  id: string
  name: string
  session: string
  isActive: boolean
}

export interface Class {
  id: string
  name: string
  studentCount: number
}

export interface Student {
  id: string
  fullName: string
  admissionNumber: string
  className: string
  classId: string
  parentName: string
  parentPhone: string
  parentEmail: string
  paymentReference: string
  totalBill: number
  amountPaid: number
  balance: number
  status: 'paid' | 'partial' | 'unpaid'
}

export interface Payment {
  id: string
  studentId: string
  studentName: string
  className: string
  amount: number
  paymentDate: string
  receiptNumber: string
  whatsappSent: boolean
  termName: string
}

export interface BankTransaction {
  id: string
  senderName: string
  amount: number
  date: string
  narration: string
  confidence: 'HIGH' | 'MEDIUM' | 'NEEDS_REVIEW' | 'UNMATCHED'
  matchedStudent?: string
  matchedClass?: string
  isConfirmed: boolean
}

export interface StatementUpload {
  id: string
  fileName: string
  uploadDate: string
  totalTransactions: number
  matched: number
  needsReview: number
  unmatched: number
  status: 'processing' | 'parsed' | 'ready'
}

export interface DashboardStats {
  totalStudents: number
  paidCount: number
  paidPercent: number
  partialCount: number
  partialPercent: number
  unpaidCount: number
  unpaidPercent: number
  totalCollected: number
  totalOutstanding: number
  totalExpected: number
}
