import { supabase } from './src/db/supabaseClient';
import dotenv from 'dotenv';

dotenv.config();

const SCHOOL_ID = '00000000-0000-0000-0000-000000000001';
const TERM_ID = '00000000-0000-0000-0000-000000000010';

const CLASSES = [
  { id: '00000000-0000-0000-0000-000000000020', school_id: SCHOOL_ID, name: 'Nursery 1' },
  { id: '00000000-0000-0000-0000-000000000021', school_id: SCHOOL_ID, name: 'Nursery 2' },
  { id: '00000000-0000-0000-0000-000000000022', school_id: SCHOOL_ID, name: 'Primary 1' },
  { id: '00000000-0000-0000-0000-000000000023', school_id: SCHOOL_ID, name: 'Primary 2' },
  { id: '00000000-0000-0000-0000-000000000024', school_id: SCHOOL_ID, name: 'Primary 3' },
  { id: '00000000-0000-0000-0000-000000000025', school_id: SCHOOL_ID, name: 'Primary 4' },
  { id: '00000000-0000-0000-0000-000000000026', school_id: SCHOOL_ID, name: 'Primary 5' },
  { id: '00000000-0000-0000-0000-000000000027', school_id: SCHOOL_ID, name: 'Primary 6' },
];

const FEE_ITEMS = [
  { school_id: SCHOOL_ID, term_id: TERM_ID, name: 'Tuition Fee', amount: 45000, is_compulsory: true },
  { school_id: SCHOOL_ID, term_id: TERM_ID, name: 'Feeding', amount: 25000, is_compulsory: true },
  { school_id: SCHOOL_ID, term_id: TERM_ID, name: 'PTA Levy', amount: 5000, is_compulsory: true },
  { school_id: SCHOOL_ID, term_id: TERM_ID, name: 'Development Levy', amount: 10000, is_compulsory: true },
];

const TOTAL_FEE = 85000;

const STUDENTS = [
  { full_name: 'Adebayo Oluwaseun', parent_phone: '08011122233', class_idx: 0, status: 'paid' },
  { full_name: 'Chinedu Okeke', parent_phone: '08022233344', class_idx: 1, status: 'paid' },
  { full_name: 'Fatima Ibrahim', parent_phone: '08033344455', class_idx: 2, status: 'paid' },
  { full_name: 'Oluchi Nwachukwu', parent_phone: '08044455566', class_idx: 3, status: 'paid' },
  { full_name: 'Babajide Sanwo', parent_phone: '08055566677', class_idx: 4, status: 'paid' },
  { full_name: 'Zainab Abubakar', parent_phone: '08066677788', class_idx: 0, status: 'paid' },
  { full_name: 'Emeka Okafor', parent_phone: '08077788899', class_idx: 1, status: 'paid' },
  { full_name: 'Folake Ademola', parent_phone: '08088899900', class_idx: 2, status: 'paid' },
  
  { full_name: 'Tunde Bakare', parent_phone: '08111122233', class_idx: 3, status: 'partial', paid: 40000 },
  { full_name: 'Ngozi Ezekwesili', parent_phone: '08122233344', class_idx: 4, status: 'partial', paid: 50000 },
  { full_name: 'Musa YarAdua', parent_phone: '08133344455', class_idx: 0, status: 'partial', paid: 35000 },
  { full_name: 'Binta Suleiman', parent_phone: '08144455566', class_idx: 1, status: 'partial', paid: 60000 },
  { full_name: 'Segun Arinze', parent_phone: '08155566677', class_idx: 2, status: 'partial', paid: 25000 },
  { full_name: 'Yetunde Olabisi', parent_phone: '08166677788', class_idx: 3, status: 'partial', paid: 70000 },
  { full_name: 'Ifeanyi Uba', parent_phone: '08177788899', class_idx: 4, status: 'partial', paid: 45000 },
  
  { full_name: 'Bolaji Aluko', parent_phone: '07011122233', class_idx: 0, status: 'unpaid' },
  { full_name: 'Damilola Adegbite', parent_phone: '07022233344', class_idx: 1, status: 'unpaid' },
  { full_name: 'Gideon Okeke', parent_phone: '07033344455', class_idx: 2, status: 'unpaid' },
  { full_name: 'Hauwa Mohammed', parent_phone: '07044455566', class_idx: 3, status: 'unpaid' },
  { full_name: 'Ibrahim Magu', parent_phone: '07055566677', class_idx: 4, status: 'unpaid' },
];

async function seed() {
  console.log('Seeding data for Yomfield School...');

  // 1. Ensure School and Term (handled by schema but let's be sure)
  const { data: school } = await supabase.from('schools').upsert({
    id: SCHOOL_ID,
    name: 'Yomfield Nursery & Primary School',
    address: 'Abeokuta, Ogun State, Nigeria',
    phone: '08012345678',
    bank_name: 'GTBank',
    bank_account_number: '0123456789'
  }).select().single();

  const { data: term } = await supabase.from('terms').upsert({
    id: TERM_ID,
    school_id: SCHOOL_ID,
    name: 'Second Term',
    session: '2025/2026',
    is_active: true
  }).select().single();

  // 2. Classes
  await supabase.from('classes').upsert(CLASSES);

  // 3. Fee Items
  await supabase.from('fee_items').upsert(FEE_ITEMS);

  // 4. Students & Bills
  for (const s of STUDENTS) {
    const { data: student } = await supabase.from('students').insert({
      school_id: SCHOOL_ID,
      class_id: CLASSES[s.class_idx].id,
      full_name: s.full_name,
      parent_phone: s.parent_phone,
      is_active: true
    }).select().single();

    if (student) {
      const amountPaid = s.status === 'paid' ? TOTAL_FEE : (s.paid || 0);
      const { data: bill } = await supabase.from('fee_bills').insert({
        student_id: student.id,
        term_id: TERM_ID,
        school_id: SCHOOL_ID,
        total_amount: TOTAL_FEE,
        amount_paid: amountPaid,
        status: s.status,
        payment_reference: `YOM-2026-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      }).select().single();

      if (amountPaid > 0 && bill) {
        // Create a payment record to match the paid amount
        await supabase.from('payments').insert({
          school_id: SCHOOL_ID,
          student_id: student.id,
          bill_id: bill.id,
          term_id: TERM_ID,
          amount: amountPaid,
          payment_date: new Date().toISOString(),
          receipt_number: `RCT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
          whatsapp_sent: true
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
