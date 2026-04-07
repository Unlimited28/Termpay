import { 
  School, Admin, Class, Student, Term, FeeItem, 
  FeeBill, Payment, BankTransaction, BankStatementUpload, 
  NotificationLog, OTP 
} from '../types/database';

export const mockSchools: School[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Yomfield Nursery & Primary School',
    address: 'Abeokuta, Ogun State, Nigeria',
    phone: '08012345678',
    email: 'info@yomfield.sch.ng',
    bank_name: 'GTBank',
    bank_account_number: '0123456789',
    created_at: new Date().toISOString()
  }
];

export const mockAdmins: Admin[] = [
  {
    id: 'admin-1',
    school_id: mockSchools[0].id,
    full_name: 'Yomfield Super Admin',
    role: 'admin',
    phone: '08000000000',
    created_at: new Date().toISOString()
  },
  {
    id: 'proprietor-1',
    school_id: mockSchools[0].id,
    full_name: 'Chief Yomfield',
    role: 'proprietor',
    phone: '08011111111',
    created_at: new Date().toISOString()
  },
  {
    id: 'bursar-1',
    school_id: mockSchools[0].id,
    full_name: 'Mr. Adewale Bursar',
    role: 'bursar',
    phone: '08022222222',
    created_at: new Date().toISOString()
  }
];

export const mockClasses: Class[] = [
  { id: 'c1', school_id: mockSchools[0].id, name: 'Nursery 1', created_at: new Date().toISOString() },
  { id: 'c2', school_id: mockSchools[0].id, name: 'Nursery 2', created_at: new Date().toISOString() },
  { id: 'c3', school_id: mockSchools[0].id, name: 'Primary 1', created_at: new Date().toISOString() },
  { id: 'c4', school_id: mockSchools[0].id, name: 'Primary 2', created_at: new Date().toISOString() },
  { id: 'c5', school_id: mockSchools[0].id, name: 'Primary 3', created_at: new Date().toISOString() },
  { id: 'c6', school_id: mockSchools[0].id, name: 'Primary 4', created_at: new Date().toISOString() },
  { id: 'c7', school_id: mockSchools[0].id, name: 'Primary 5', created_at: new Date().toISOString() },
  { id: 'c8', school_id: mockSchools[0].id, name: 'Primary 6', created_at: new Date().toISOString() },
];

export const mockTerms: Term[] = [
  {
    id: 'term-1',
    school_id: mockSchools[0].id,
    name: 'Second Term',
    session: '2025/2026',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const mockFeeItems: FeeItem[] = [
  { id: 'fi1', school_id: mockSchools[0].id, term_id: 'term-1', name: 'Tuition Fee', amount: 45000, is_compulsory: true, created_at: new Date().toISOString() },
  { id: 'fi2', school_id: mockSchools[0].id, term_id: 'term-1', name: 'Feeding', amount: 25000, is_compulsory: true, created_at: new Date().toISOString() },
  { id: 'fi3', school_id: mockSchools[0].id, term_id: 'term-1', name: 'PTA Levy', amount: 5000, is_compulsory: true, created_at: new Date().toISOString() },
  { id: 'fi4', school_id: mockSchools[0].id, term_id: 'term-1', name: 'Development Levy', amount: 10000, is_compulsory: true, created_at: new Date().toISOString() },
];

const totalFee = 85000;

export const mockStudents: Student[] = [
  { id: 's1', school_id: mockSchools[0].id, class_id: 'c1', full_name: 'Adebayo Oluwaseun', parent_phone: '08011122233', is_active: true, created_at: new Date().toISOString() },
  { id: 's2', school_id: mockSchools[0].id, class_id: 'c2', full_name: 'Chinedu Okeke', parent_phone: '08022233344', is_active: true, created_at: new Date().toISOString() },
  { id: 's3', school_id: mockSchools[0].id, class_id: 'c3', full_name: 'Fatima Ibrahim', parent_phone: '08033344455', is_active: true, created_at: new Date().toISOString() },
  { id: 's4', school_id: mockSchools[0].id, class_id: 'c4', full_name: 'Oluchi Nwachukwu', parent_phone: '08044455566', is_active: true, created_at: new Date().toISOString() },
  { id: 's5', school_id: mockSchools[0].id, class_id: 'c5', full_name: 'Babajide Sanwo', parent_phone: '08055566677', is_active: true, created_at: new Date().toISOString() },
  { id: 's6', school_id: mockSchools[0].id, class_id: 'c1', full_name: 'Zainab Abubakar', parent_phone: '08066677788', is_active: true, created_at: new Date().toISOString() },
  { id: 's7', school_id: mockSchools[0].id, class_id: 'c2', full_name: 'Emeka Okafor', parent_phone: '08077788899', is_active: true, created_at: new Date().toISOString() },
  { id: 's8', school_id: mockSchools[0].id, class_id: 'c3', full_name: 'Folake Ademola', parent_phone: '08088899900', is_active: true, created_at: new Date().toISOString() },
  { id: 's9', school_id: mockSchools[0].id, class_id: 'c4', full_name: 'Tunde Bakare', parent_phone: '08111122233', is_active: true, created_at: new Date().toISOString() },
  { id: 's10', school_id: mockSchools[0].id, class_id: 'c5', full_name: 'Ngozi Ezekwesili', parent_phone: '08122233344', is_active: true, created_at: new Date().toISOString() },
];

export const mockFeeBills: FeeBill[] = mockStudents.map((s, i) => {
  let status: 'unpaid' | 'partial' | 'paid' = 'unpaid';
  let amountPaid = 0;
  if (i < 4) {
    status = 'paid';
    amountPaid = totalFee;
  } else if (i < 7) {
    status = 'partial';
    amountPaid = 40000;
  }
  
  return {
    id: `b${i+1}`,
    student_id: s.id,
    term_id: 'term-1',
    school_id: mockSchools[0].id,
    total_amount: totalFee,
    amount_paid: amountPaid,
    balance: totalFee - amountPaid,
    status: status,
    payment_reference: `YOM-2026-${(i+1).toString().padStart(4, '0')}`,
    created_at: new Date().toISOString()
  };
});

export const mockPayments: Payment[] = mockFeeBills.filter(b => b.amount_paid > 0).map((b, i) => ({
  id: `p${i+1}`,
  school_id: b.school_id,
  student_id: b.student_id,
  bill_id: b.id,
  term_id: b.term_id,
  amount: b.amount_paid,
  payment_date: new Date().toISOString(),
  confirmed_by: 'bursar-1',
  receipt_number: `RCT-20260310-${(i+1).toString().padStart(4, '0')}`,
  whatsapp_sent: true,
  sms_sent: false,
  created_at: new Date().toISOString()
}));

export let mockOTPs: OTP[] = [];
