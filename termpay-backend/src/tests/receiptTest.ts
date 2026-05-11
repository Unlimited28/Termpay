import { receiptGenerator } from '../services/receiptGenerator'
import fs from 'fs'
import path from 'path'

async function test() {
  const outputPath = path.join('/tmp', 'test_receipt.pdf')
  console.log(`Generating test receipt to ${outputPath}...`)

  try {
    const buffer = await receiptGenerator.generatePDF({
      receiptNumber: 'RCT-20260510-0001',
      paymentDate: '2026-05-10',
      amount: 85000,
      studentName: 'Adewale Ogundimu',
      admissionNumber: 'YOM-001',
      className: 'Primary 3',
      termName: 'Second Term',
      session: '2025/2026',
      totalBill: 85000,
      amountPaid: 85000,
      balance: 0,
      paymentMethod: 'Bank Transfer',
      schoolName: 'Yomfield Nursery & Primary School',
      schoolAddress: 'Abeokuta, Ogun State, Nigeria',
      schoolPhone: '08012345678',
      bankName: 'GTBank',
      accountNumber: '0123456789',
      feeItems: [
        { name: 'Tuition Fee', amount: 45000 },
        { name: 'Feeding', amount: 25000 },
        { name: 'PTA Levy', amount: 5000 },
        { name: 'Development Levy', amount: 10000 }
      ],
      isVoided: false
    })

    fs.writeFileSync(outputPath, buffer)
    console.log('Receipt generated successfully.')

    // Also test voided receipt
    const voidedOutputPath = path.join('/tmp', 'test_receipt_voided.pdf')
    console.log(`Generating test voided receipt to ${voidedOutputPath}...`)
    const voidedBuffer = await receiptGenerator.generatePDF({
      receiptNumber: 'RCT-20260510-0001',
      paymentDate: '2026-05-10',
      amount: 85000,
      studentName: 'Adewale Ogundimu',
      admissionNumber: 'YOM-001',
      className: 'Primary 3',
      termName: 'Second Term',
      session: '2025/2026',
      totalBill: 85000,
      amountPaid: 85000,
      balance: 0,
      paymentMethod: 'Bank Transfer',
      schoolName: 'Yomfield Nursery & Primary School',
      schoolAddress: 'Abeokuta, Ogun State, Nigeria',
      schoolPhone: '08012345678',
      bankName: 'GTBank',
      accountNumber: '0123456789',
      feeItems: [
        { name: 'Tuition Fee', amount: 45000 },
        { name: 'Feeding', amount: 25000 },
        { name: 'PTA Levy', amount: 5000 },
        { name: 'Development Levy', amount: 10000 }
      ],
      isVoided: true
    })
    fs.writeFileSync(voidedOutputPath, voidedBuffer)
    console.log('Voided receipt generated successfully.')

  } catch (error) {
    console.error('Error generating receipt:', error)
    process.exit(1)
  }
}

test()
