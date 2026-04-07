export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  bank_name?: string;
  bank_account_number?: string;
  logo_url?: string;
  created_at: string;
}

export interface Admin {
  id: string;
  school_id: string;
  full_name: string;
  role: 'proprietor' | 'bursar' | 'admin';
  phone?: string;
  created_at: string;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  class_id?: string;
  full_name: string;
  admission_number?: string;
  parent_name?: string;
  parent_phone: string;
  parent_email?: string;
  is_active: boolean;
  created_at: string;
}

export interface Term {
  id: string;
  school_id: string;
  name: string;
  session: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface FeeItem {
  id: string;
  school_id: string;
  term_id: string;
  name: string;
  amount: number;
  is_compulsory: boolean;
  created_at: string;
}

export interface FeeBill {
  id: string;
  student_id: string;
  term_id: string;
  school_id: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: 'unpaid' | 'partial' | 'paid';
  payment_reference?: string;
  created_at: string;
}

export interface BankStatementUpload {
  id: string;
  school_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  upload_date: string;
  total_transactions: number;
  matched_count: number;
  unmatched_count: number;
  status: 'processing' | 'done';
}

export interface BankTransaction {
  id: string;
  upload_id: string;
  school_id: string;
  transaction_date: string;
  sender_name?: string;
  amount: number;
  reference?: string;
  narration?: string;
  is_matched: boolean;
  match_confidence?: 'high' | 'medium' | 'manual';
  matched_student_id?: string;
  matched_bill_id?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  school_id: string;
  student_id: string;
  bill_id: string;
  transaction_id?: string;
  term_id: string;
  amount: number;
  payment_date: string;
  confirmed_by: string;
  receipt_number: string;
  receipt_url?: string;
  whatsapp_sent: boolean;
  sms_sent: boolean;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  school_id: string;
  payment_id?: string;
  student_id?: string;
  parent_phone?: string;
  channel: 'whatsapp' | 'sms';
  message: string;
  status: 'sent' | 'failed' | 'pending' | 'mock';
  sent_at: string;
}

export interface OTP {
  id: string;
  phone: string;
  code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}
