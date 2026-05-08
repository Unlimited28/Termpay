import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SCHOOL_ID = '00000000-0000-0000-0000-000000000001'
const TERM_ID = '00000000-0000-0000-0000-000000000010'

const classIds = {
  nursery1: '00000000-0000-0000-0000-000000000021',
  nursery2: '00000000-0000-0000-0000-000000000022',
  primary1: '00000000-0000-0000-0000-000000000023',
  primary2: '00000000-0000-0000-0000-000000000024',
  primary3: '00000000-0000-0000-0000-000000000025',
}

async function resetData() {
  console.log('Resetting existing demo data...')
  await supabase.from('notification_log').delete().eq('school_id', SCHOOL_ID)
  await supabase.from('payments').delete().eq('school_id', SCHOOL_ID)
  await supabase.from('bank_transactions').delete().eq('school_id', SCHOOL_ID)
  await supabase.from('bank_statement_uploads').delete().eq('school_id', SCHOOL_ID)
  await supabase.from('fee_bills').delete().eq('school_id', SCHOOL_ID)
  await supabase.from('fee_items').delete().eq('school_id', SCHOOL_ID)
  await supabase.from('students').delete().eq('school_id', SCHOOL_ID)
  await supabase.from('terms').delete().eq('school_id', SCHOOL_ID)
  await supabase.from('classes').delete().eq('school_id', SCHOOL_ID)
  await supabase.from('schools').delete().eq('id', SCHOOL_ID)
  console.log('✓ Reset complete')
}

async function seedSchool() {
  const { error } = await supabase.from('schools').insert({
    id: SCHOOL_ID,
    name: 'Yomfield Nursery & Primary School',
    address: 'Abeokuta, Ogun State, Nigeria',
    phone: '08012345678',
    bank_name: 'GTBank',
    bank_account_number: '0123456789',
    bank_account_name: 'Yomfield Schools Ltd',
    school_prefix: 'YOM'
  })
  if (error) throw new Error(`School seed failed: ${error.message}`)
  console.log('✓ School seeded')
}

async function seedClasses() {
  const { error } = await supabase.from('classes').insert([
    { id: classIds.nursery1, school_id: SCHOOL_ID, name: 'Nursery 1' },
    { id: classIds.nursery2, school_id: SCHOOL_ID, name: 'Nursery 2' },
    { id: classIds.primary1, school_id: SCHOOL_ID, name: 'Primary 1' },
    { id: classIds.primary2, school_id: SCHOOL_ID, name: 'Primary 2' },
    { id: classIds.primary3, school_id: SCHOOL_ID, name: 'Primary 3' },
  ])
  if (error) throw new Error(`Classes seed failed: ${error.message}`)
  console.log('✓ Classes seeded')
}

async function seedTerm() {
  const { error } = await supabase.from('terms').insert({
    id: TERM_ID,
    school_id: SCHOOL_ID,
    name: 'Second Term',
    session: '2025/2026',
    is_active: true
  })
  if (error) throw new Error(`Term seed failed: ${error.message}`)
  console.log('✓ Term seeded')
}

async function seedFeeItems() {
  const feeItems = [
    // Nursery classes
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.nursery1, name: 'Tuition Fee', amount: 40000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.nursery1, name: 'Feeding', amount: 22000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.nursery1, name: 'PTA Levy', amount: 5000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.nursery1, name: 'Development Levy', amount: 8000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.nursery2, name: 'Tuition Fee', amount: 40000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.nursery2, name: 'Feeding', amount: 22000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.nursery2, name: 'PTA Levy', amount: 5000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.nursery2, name: 'Development Levy', amount: 8000, applies_to_all: false },
    // Primary 1 and 2
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary1, name: 'Tuition Fee', amount: 45000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary1, name: 'Feeding', amount: 25000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary1, name: 'PTA Levy', amount: 5000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary1, name: 'Development Levy', amount: 10000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary2, name: 'Tuition Fee', amount: 45000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary2, name: 'Feeding', amount: 25000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary2, name: 'PTA Levy', amount: 5000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary2, name: 'Development Levy', amount: 10000, applies_to_all: false },
    // Primary 3
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary3, name: 'Tuition Fee', amount: 50000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary3, name: 'Feeding', amount: 28000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary3, name: 'PTA Levy', amount: 5000, applies_to_all: false },
    { school_id: SCHOOL_ID, term_id: TERM_ID, class_id: classIds.primary3, name: 'Development Levy', amount: 12000, applies_to_all: false },
  ]

  const { error } = await supabase.from('fee_items').insert(feeItems)
  if (error) throw new Error(`Fee items seed failed: ${error.message}`)
  console.log('✓ Fee items seeded')
}

async function seedStudents() {
  const students = [
    { school_id: SCHOOL_ID, class_id: classIds.primary3, full_name: 'Adewale Ogundimu', admission_number: 'YOM-001', parent_name: 'Mr. Tunde Ogundimu', parent_phone: '08012345671', parent_email: 'tunde@email.com' },
    { school_id: SCHOOL_ID, class_id: classIds.primary2, full_name: 'Fatima Abdullahi', admission_number: 'YOM-002', parent_name: 'Mrs. Khadijah Abdullahi', parent_phone: '08012345672', parent_email: 'khadijah@email.com' },
    { school_id: SCHOOL_ID, class_id: classIds.primary1, full_name: 'Chukwuemeka Okafor', admission_number: 'YOM-003', parent_name: 'Mr. Emeka Okafor', parent_phone: '08012345673', parent_email: 'emeka@email.com' },
    { school_id: SCHOOL_ID, class_id: classIds.nursery2, full_name: 'Taiwo Balogun', admission_number: 'YOM-004', parent_name: 'Mrs. Balogun', parent_phone: '08012345674', parent_email: null },
    { school_id: SCHOOL_ID, class_id: classIds.nursery1, full_name: 'Aisha Ibrahim', admission_number: 'YOM-005', parent_name: 'Alhaji Ibrahim', parent_phone: '08012345675', parent_email: null },
    { school_id: SCHOOL_ID, class_id: classIds.primary3, full_name: 'Oluwaseun Adeyemi', admission_number: 'YOM-006', parent_name: 'Mr. Seun Adeyemi', parent_phone: '08012345676', parent_email: 'seun@email.com' },
    { school_id: SCHOOL_ID, class_id: classIds.primary2, full_name: 'Blessing Eze', admission_number: 'YOM-007', parent_name: 'Mrs. Eze', parent_phone: '08012345677', parent_email: null },
    { school_id: SCHOOL_ID, class_id: classIds.primary1, full_name: 'Yusuf Musa', admission_number: 'YOM-008', parent_name: 'Malam Musa', parent_phone: '08012345678', parent_email: null },
    { school_id: SCHOOL_ID, class_id: classIds.nursery2, full_name: 'Ngozi Obi', admission_number: 'YOM-009', parent_name: 'Mrs. Obi', parent_phone: '08012345679', parent_email: 'ngozi@email.com' },
    { school_id: SCHOOL_ID, class_id: classIds.nursery1, full_name: 'Kehinde Salami', admission_number: 'YOM-010', parent_name: 'Mr. Salami', parent_phone: '08012345680', parent_email: null },
    { school_id: SCHOOL_ID, class_id: classIds.primary3, full_name: 'Amara Nwosu', admission_number: 'YOM-011', parent_name: 'Mr. Nwosu', parent_phone: '08012345681', parent_email: 'nwosu@email.com' },
    { school_id: SCHOOL_ID, class_id: classIds.primary2, full_name: 'Suleiman Garba', admission_number: 'YOM-012', parent_name: 'Alhaji Garba', parent_phone: '08012345682', parent_email: null },
    { school_id: SCHOOL_ID, class_id: classIds.primary1, full_name: 'Chidinma Okeke', admission_number: 'YOM-013', parent_name: 'Mrs. Okeke', parent_phone: '08012345683', parent_email: 'okeke@email.com' },
    { school_id: SCHOOL_ID, class_id: classIds.nursery2, full_name: 'Rabi Usman', admission_number: 'YOM-014', parent_name: 'Mr. Usman', parent_phone: '08012345684', parent_email: null },
    { school_id: SCHOOL_ID, class_id: classIds.nursery1, full_name: 'Tunde Fashola', admission_number: 'YOM-015', parent_name: 'Mr. Fashola', parent_phone: '08012345685', parent_email: null },
  ]

  const { data: insertedStudents, error } = await supabase
    .from('students')
    .insert(students)
    .select()

  if (error) throw new Error(`Students seed failed: ${error.message}`)
  console.log('✓ Students seeded')
  return insertedStudents
}

async function seedFeeBills(students: any[]) {
  const feeTotals: Record<string, number> = {
    [classIds.nursery1]: 75000,
    [classIds.nursery2]: 75000,
    [classIds.primary1]: 85000,
    [classIds.primary2]: 85000,
    [classIds.primary3]: 95000,
  }

  const bills = students.map((student, index) => {
    const total = feeTotals[student.class_id] || 85000
    const statuses = ['paid', 'paid', 'paid', 'paid', 'paid', 'partial', 'partial', 'partial', 'partial', 'partial', 'unpaid', 'unpaid', 'unpaid', 'unpaid', 'unpaid']
    const status = statuses[index] || 'unpaid'
    const amountPaid = status === 'paid' ? total : status === 'partial' ? Math.floor(total * 0.53) : 0

    return {
      student_id: student.id,
      term_id: TERM_ID,
      school_id: SCHOOL_ID,
      total_amount: total,
      amount_paid: amountPaid,
      status: status,
      payment_reference: `YOM-2026-${String(index + 1).padStart(4, '0')}`
    }
  })

  const { error } = await supabase.from('fee_bills').insert(bills)
  if (error) throw new Error(`Fee bills seed failed: ${error.message}`)
  console.log('✓ Fee bills seeded')
}

async function createAdminUsers() {
  console.log('Creating admin users...')

  // Create bursar
  const { data: bursarAuth, error: bursarAuthError } = await supabase.auth.admin.createUser({
    email: 'bursar@yomfield.sch.ng',
    password: 'Demo1234!',
    email_confirm: true
  })

  if (bursarAuthError && !bursarAuthError.message.includes('already registered')) {
    throw new Error(`Bursar auth creation failed: ${bursarAuthError.message}`)
  }

  if (bursarAuth?.user) {
    const { error: bursarError } = await supabase.from('admins').upsert({
      id: bursarAuth.user.id,
      school_id: SCHOOL_ID,
      full_name: 'Mrs. Folake Adeyemi',
      role: 'bursar',
      phone: '08012345600'
    })
    if (bursarError) throw new Error(`Bursar admin profile failed: ${bursarError.message}`)
  }

  // Create proprietor
  const { data: proprietorAuth, error: proprietorAuthError } = await supabase.auth.admin.createUser({
    email: 'proprietor@yomfield.sch.ng',
    password: 'Demo1234!',
    email_confirm: true
  })

  if (proprietorAuthError && !proprietorAuthError.message.includes('already registered')) {
    throw new Error(`Proprietor auth creation failed: ${proprietorAuthError.message}`)
  }

  if (proprietorAuth?.user) {
    const { error: proprietorError } = await supabase.from('admins').upsert({
      id: proprietorAuth.user.id,
      school_id: SCHOOL_ID,
      full_name: 'Dr. Yomi Adeyinka',
      role: 'proprietor',
      phone: '08012345601'
    })
    if (proprietorError) throw new Error(`Proprietor admin profile failed: ${proprietorError.message}`)
  }

  console.log('✓ Admin users created')
}

async function main() {
  const isReset = process.argv.includes('--reset')

  console.log('🌱 Starting TermPay seed...')

  try {
    if (isReset) await resetData()
    await seedSchool()
    await seedClasses()
    await seedTerm()
    await seedFeeItems()
    const students = await seedStudents()
    if (students) await seedFeeBills(students)
    await createAdminUsers()

    console.log(`
✅ Seed complete!
   School: Yomfield Nursery & Primary School
   Students: 15
   Bursar: bursar@yomfield.sch.ng / Demo1234!
   Proprietor: proprietor@yomfield.sch.ng / Demo1234!
    `)
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  }
}

main()
