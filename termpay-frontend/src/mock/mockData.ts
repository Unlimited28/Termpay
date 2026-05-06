import type {
  AdminUser, School, Term, Class, Student,
  Payment, StatementUpload, BankTransaction, DashboardStats
} from '../types'

export const mockUser: AdminUser = {
  id: '1',
  email: 'bursar@yomfield.sch.ng',
  fullName: 'Mrs. Folake Adeyemi',
  role: 'bursar',
  schoolId: 'school-1',
  schoolName: 'Yomfield Nursery & Primary School'
}

export const mockProprietor: AdminUser = {
  id: '2',
  email: 'proprietor@yomfield.sch.ng',
  fullName: 'Dr. Yomi Adeyinka',
  role: 'proprietor',
  schoolId: 'school-1',
  schoolName: 'Yomfield Nursery & Primary School'
}

export const mockSchool: School = {
  id: 'school-1',
  name: 'Yomfield Nursery & Primary School',
  address: 'Abeokuta, Ogun State, Nigeria',
  bankName: 'GTBank',
  accountNumber: '0123456789',
  accountName: 'Yomfield Schools Ltd',
  schoolPrefix: 'YOM'
}

export const mockTerm: Term = {
  id: 'term-1',
  name: 'Second Term',
  session: '2025/2026',
  isActive: true
}

export const mockClasses: Class[] = [
  { id: 'c1', name: 'Nursery 1', studentCount: 3 },
  { id: 'c2', name: 'Nursery 2', studentCount: 3 },
  { id: 'c3', name: 'Primary 1', studentCount: 3 },
  { id: 'c4', name: 'Primary 2', studentCount: 3 },
  { id: 'c5', name: 'Primary 3', studentCount: 3 },
]

export const mockStudents: Student[] = [
  { id: 's1', fullName: 'Adewale Ogundimu', admissionNumber: 'YOM-001', className: 'Primary 3', classId: 'c5', parentName: 'Mr. Tunde Ogundimu', parentPhone: '08012345671', parentEmail: 'tunde@email.com', paymentReference: 'YOM-2026-0001', totalBill: 85000, amountPaid: 85000, balance: 0, status: 'paid' },
  { id: 's2', fullName: 'Fatima Abdullahi', admissionNumber: 'YOM-002', className: 'Primary 2', classId: 'c4', parentName: 'Mrs. Khadijah Abdullahi', parentPhone: '08012345672', parentEmail: 'khadijah@email.com', paymentReference: 'YOM-2026-0002', totalBill: 85000, amountPaid: 85000, balance: 0, status: 'paid' },
  { id: 's3', fullName: 'Chukwuemeka Okafor', admissionNumber: 'YOM-003', className: 'Primary 1', classId: 'c3', parentName: 'Mr. Emeka Okafor', parentPhone: '08012345673', parentEmail: 'emeka@email.com', paymentReference: 'YOM-2026-0003', totalBill: 85000, amountPaid: 85000, balance: 0, status: 'paid' },
  { id: 's4', fullName: 'Taiwo Balogun', admissionNumber: 'YOM-004', className: 'Nursery 2', classId: 'c2', parentName: 'Mrs. Balogun', parentPhone: '08012345674', parentEmail: '', paymentReference: 'YOM-2026-0004', totalBill: 85000, amountPaid: 85000, balance: 0, status: 'paid' },
  { id: 's5', fullName: 'Aisha Ibrahim', admissionNumber: 'YOM-005', className: 'Nursery 1', classId: 'c1', parentName: 'Alhaji Ibrahim', parentPhone: '08012345675', parentEmail: '', paymentReference: 'YOM-2026-0005', totalBill: 85000, amountPaid: 85000, balance: 0, status: 'paid' },
  { id: 's6', fullName: 'Oluwaseun Adeyemi', admissionNumber: 'YOM-006', className: 'Primary 3', classId: 'c5', parentName: 'Mr. Seun Adeyemi', parentPhone: '08012345676', parentEmail: 'seun@email.com', paymentReference: 'YOM-2026-0006', totalBill: 85000, amountPaid: 45000, balance: 40000, status: 'partial' },
  { id: 's7', fullName: 'Blessing Eze', admissionNumber: 'YOM-007', className: 'Primary 2', classId: 'c4', parentName: 'Mrs. Eze', parentPhone: '08012345677', parentEmail: '', paymentReference: 'YOM-2026-0007', totalBill: 85000, amountPaid: 45000, balance: 40000, status: 'partial' },
  { id: 's8', fullName: 'Yusuf Musa', admissionNumber: 'YOM-008', className: 'Primary 1', classId: 'c3', parentName: 'Malam Musa', parentPhone: '08012345678', parentEmail: '', paymentReference: 'YOM-2026-0008', totalBill: 85000, amountPaid: 45000, balance: 40000, status: 'partial' },
  { id: 's9', fullName: 'Ngozi Obi', admissionNumber: 'YOM-009', className: 'Nursery 2', classId: 'c2', parentName: 'Mrs. Obi', parentPhone: '08012345679', parentEmail: 'ngozi@email.com', paymentReference: 'YOM-2026-0009', totalBill: 85000, amountPaid: 45000, balance: 40000, status: 'partial' },
  { id: 's10', fullName: 'Kehinde Salami', admissionNumber: 'YOM-010', className: 'Nursery 1', classId: 'c1', parentName: 'Mr. Salami', parentPhone: '08012345680', parentEmail: '', paymentReference: 'YOM-2026-0010', totalBill: 85000, amountPaid: 45000, balance: 40000, status: 'partial' },
  { id: 's11', fullName: 'Amara Nwosu', admissionNumber: 'YOM-011', className: 'Primary 3', classId: 'c5', parentName: 'Mr. Nwosu', parentPhone: '08012345681', parentEmail: 'nwosu@email.com', paymentReference: 'YOM-2026-0011', totalBill: 85000, amountPaid: 0, balance: 85000, status: 'unpaid' },
  { id: 's12', fullName: 'Suleiman Garba', admissionNumber: 'YOM-012', className: 'Primary 2', classId: 'c4', parentName: 'Alhaji Garba', parentPhone: '08012345682', parentEmail: '', paymentReference: 'YOM-2026-0012', totalBill: 85000, amountPaid: 0, balance: 85000, status: 'unpaid' },
  { id: 's13', fullName: 'Chidinma Okeke', admissionNumber: 'YOM-013', className: 'Primary 1', classId: 'c3', parentName: 'Mrs. Okeke', parentPhone: '08012345683', parentEmail: 'okeke@email.com', paymentReference: 'YOM-2026-0013', totalBill: 85000, amountPaid: 0, balance: 85000, status: 'unpaid' },
  { id: 's14', fullName: 'Rabi Usman', admissionNumber: 'YOM-014', className: 'Nursery 2', classId: 'c2', parentName: 'Mr. Usman', parentPhone: '08012345684', parentEmail: '', paymentReference: 'YOM-2026-0014', totalBill: 85000, amountPaid: 0, balance: 85000, status: 'unpaid' },
  { id: 's15', fullName: 'Tunde Fashola', admissionNumber: 'YOM-015', className: 'Nursery 1', classId: 'c1', parentName: 'Mr. Fashola', parentPhone: '08012345685', parentEmail: '', paymentReference: 'YOM-2026-0015', totalBill: 85000, amountPaid: 0, balance: 85000, status: 'unpaid' },
]

export const mockDashboardStats: DashboardStats = {
  totalStudents: 15,
  paidCount: 5,
  paidPercent: 33,
  partialCount: 5,
  partialPercent: 33,
  unpaidCount: 5,
  unpaidPercent: 34,
  totalCollected: 650000,
  totalOutstanding: 625000,
  totalExpected: 1275000,
}

export const mockRecentPayments: Payment[] = [
  { id: 'p1', studentId: 's1', studentName: 'Adewale Ogundimu', className: 'Primary 3', amount: 85000, paymentDate: '2026-03-15', receiptNumber: 'RCT-20260315-0001', whatsappSent: true, termName: 'Second Term' },
  { id: 'p2', studentId: 's2', studentName: 'Fatima Abdullahi', className: 'Primary 2', amount: 85000, paymentDate: '2026-03-15', receiptNumber: 'RCT-20260315-0002', whatsappSent: true, termName: 'Second Term' },
  { id: 'p3', studentId: 's3', studentName: 'Chukwuemeka Okafor', className: 'Primary 1', amount: 85000, paymentDate: '2026-03-16', receiptNumber: 'RCT-20260316-0001', whatsappSent: true, termName: 'Second Term' },
  { id: 'p4', studentId: 's4', studentName: 'Taiwo Balogun', className: 'Nursery 2', amount: 85000, paymentDate: '2026-03-16', receiptNumber: 'RCT-20260316-0002', whatsappSent: true, termName: 'Second Term' },
  { id: 'p5', studentId: 's5', studentName: 'Aisha Ibrahim', className: 'Nursery 1', amount: 85000, paymentDate: '2026-03-17', receiptNumber: 'RCT-20260317-0001', whatsappSent: true, termName: 'Second Term' },
  { id: 'p6', studentId: 's6', studentName: 'Oluwaseun Adeyemi', className: 'Primary 3', amount: 45000, paymentDate: '2026-03-17', receiptNumber: 'RCT-20260317-0002', whatsappSent: true, termName: 'Second Term' },
  { id: 'p7', studentId: 's7', studentName: 'Blessing Eze', className: 'Primary 2', amount: 45000, paymentDate: '2026-03-18', receiptNumber: 'RCT-20260318-0001', whatsappSent: false, termName: 'Second Term' },
]

export const mockStatementUploads: StatementUpload[] = [
  { id: 'u1', fileName: 'gtbank_march_2026.csv', uploadDate: '2026-03-18', totalTransactions: 9, matched: 7, needsReview: 1, unmatched: 1, status: 'ready' },
]

export const mockTransactions: BankTransaction[] = [
  { id: 't1', senderName: 'ADEWALE OGUNDIMU', amount: 85000, date: '2026-03-15', narration: 'School fees payment', confidence: 'HIGH', matchedStudent: 'Adewale Ogundimu', matchedClass: 'Primary 3', isConfirmed: true },
  { id: 't2', senderName: 'MRS FATIMA ABDULLAHI', amount: 85000, date: '2026-03-15', narration: 'School fees', confidence: 'HIGH', matchedStudent: 'Fatima Abdullahi', matchedClass: 'Primary 2', isConfirmed: false },
  { id: 't3', senderName: 'CHUKWUEMEKA OKAFOR', amount: 85000, date: '2026-03-16', narration: 'Fees payment', confidence: 'HIGH', matchedStudent: 'Chukwuemeka Okafor', matchedClass: 'Primary 1', isConfirmed: false },
  { id: 't4', senderName: 'BALOGUN TAIWO', amount: 85000, date: '2026-03-16', narration: 'School fees', confidence: 'MEDIUM', matchedStudent: 'Taiwo Balogun', matchedClass: 'Nursery 2', isConfirmed: false },
  { id: 't5', senderName: 'AISHA I', amount: 85000, date: '2026-03-17', narration: 'Fees', confidence: 'MEDIUM', matchedStudent: 'Aisha Ibrahim', matchedClass: 'Nursery 1', isConfirmed: false },
  { id: 't6', senderName: 'ADEYEMI SEUN', amount: 45000, date: '2026-03-17', narration: 'Part payment', confidence: 'HIGH', matchedStudent: 'Oluwaseun Adeyemi', matchedClass: 'Primary 3', isConfirmed: false },
  { id: 't7', senderName: 'BLESSING E', amount: 45000, date: '2026-03-18', narration: 'YOM-2026-0007 school fees', confidence: 'HIGH', matchedStudent: 'Blessing Eze', matchedClass: 'Primary 2', isConfirmed: false },
  { id: 't8', senderName: 'JOHNSON WILLIAMS', amount: 85000, date: '2026-03-18', narration: 'Payment', confidence: 'NEEDS_REVIEW', matchedStudent: undefined, matchedClass: undefined, isConfirmed: false },
  { id: 't9', senderName: 'UNKNOWN SENDER XYZ', amount: 10000, date: '2026-03-19', narration: 'Transfer', confidence: 'UNMATCHED', matchedStudent: undefined, matchedClass: undefined, isConfirmed: false },
]

export const mockExtraFeeItems = [
  { id: 'ef1', name: 'Excursion Fee', amount: 15000, appliesTo: ['Primary 3'], compulsory: true, addedBy: 'Mrs. Folake Adeyemi' },
  { id: 'ef2', name: 'Computer Levy', amount: 8000, appliesTo: ['All Classes'], compulsory: false, addedBy: 'Mrs. Folake Adeyemi' },
]
