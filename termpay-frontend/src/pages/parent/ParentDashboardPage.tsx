import { ParentLayout } from '../../layouts'
import { Card, Button } from '../../components/ui'
import { Download, CheckCircle, CreditCard } from 'lucide-react'
import { mockStudents, mockRecentPayments, mockTerm, mockSchool } from '../../mock/mockData'
import { useToast } from '../../context/ToastContext'

const ParentDashboardPage = () => {
  const { toast } = useToast()
  // Mocking student s1 (Fully Paid) for the portal demo
  const student = mockStudents[0]
  const payments = mockRecentPayments.filter(p => p.studentId === student.id)

  const getStatusColor = () => {
    if (student.status === 'paid') return '#2E7D32'
    if (student.status === 'partial') return '#E65100'
    return '#B71C1C'
  }

  const getStatusBg = () => {
    if (student.status === 'paid') return 'bg-green-50'
    if (student.status === 'partial') return 'bg-amber-50'
    return 'bg-red-50'
  }

  const getStatusText = () => {
    if (student.status === 'paid') return 'text-brand-green'
    if (student.status === 'partial') return 'text-brand-amber'
    return 'text-brand-red'
  }

  const handleDownload = (receiptNo: string) => {
    toast.info(`Downloading receipt ${receiptNo}...`)
  }

  const feeItems = [
    { item: 'Tuition Fee', amount: 45000 },
    { item: 'Feeding', amount: 25000 },
    { item: 'PTA Levy', amount: 5000 },
    { item: 'Development Levy', amount: 10000 },
  ]

  return (
    <ParentLayout>
      <div className="space-y-6">
        {/* Child Header Card */}
        <div
          className="rounded-2xl p-6 shadow-sm flex items-center gap-4 bg-white"
          style={{ borderTop: `4px solid ${getStatusColor()}` }}
        >
          <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center text-lg font-bold ${getStatusBg()} ${getStatusText()}`}>
            {student.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">{student.fullName}</h1>
            <p className="text-[#64748B] font-medium text-sm">
              {student.className} • {mockTerm.name} {mockTerm.session}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div
          className="bg-white rounded-2xl border border-[rgba(46,125,50,0.2)] p-12 shadow-sm text-center animate-in zoom-in-95 duration-300 relative overflow-hidden"
        >
          {/* Subtle green radial gradient behind icon */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(46,125,50,0.4) 0%, transparent 70%)' }}
          />

          <div className="flex flex-col items-center relative z-10">
            <div className="text-[#2E7D32] mb-6 drop-shadow-sm">
              <CheckCircle size={64} />
            </div>
            <h2 className="text-[28px] font-900 font-black text-[#0F172A] mb-2 tracking-tight">FULLY PAID ✓</h2>
            <p className="text-[#64748B] font-medium max-w-xs mx-auto">
              Your fees for this term have been fully settled. Thank you!
            </p>
          </div>
        </div>

        {/* Fee Breakdown Card */}
        <Card title="Fee Breakdown" subtitle={`Details for ${mockTerm.name}`}>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-surface-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-3 font-semibold text-text-secondary uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 font-semibold text-text-secondary text-right uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {feeItems.map((item, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3 text-text-primary font-medium">{item.item}</td>
                      <td className="px-6 py-3 text-text-primary text-right font-medium">₦{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t-[2px] border-surface-border">
                    <td className="px-6 py-4 font-bold text-text-primary">Total Amount</td>
                    <td className="px-6 py-4 font-bold text-text-primary text-right text-[16px]">₦{student.totalBill.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-[#2E7D32]/[0.05]">
                    <td className="px-6 py-4 font-bold text-[#2E7D32]">Amount Paid</td>
                    <td className="px-6 py-4 font-bold text-[#2E7D32] text-right">₦{student.amountPaid.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-[#2E7D32]/[0.05]">
                    <td className="px-6 py-4 font-bold text-[#2E7D32]">Balance</td>
                    <td className="px-6 py-4 font-bold text-[#2E7D32] text-right italic">Fully Settled</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Bank Instructions (Hidden if balance is 0, but added for completeness if needed) */}
        {student.balance > 0 && (
          <Card title="Payment Instructions" className="border-brand-blue/30 bg-blue-50/30">
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Please use the details below for bank transfers:</p>
              <div className="p-4 bg-white rounded-lg border border-brand-blue/20 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Bank Name</span>
                  <span className="font-bold text-text-primary">{mockSchool.bankName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Account Number</span>
                  <span className="font-bold text-text-primary">{mockSchool.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Account Name</span>
                  <span className="font-bold text-text-primary">{mockSchool.accountName}</span>
                </div>
                <div className="pt-2 border-t border-surface-border flex justify-between text-sm">
                  <span className="text-text-secondary font-bold text-brand-blue">Payment Reference</span>
                  <span className="font-black text-brand-blue font-mono">{student.paymentReference}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Payment History */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-text-primary px-1">Payment History</h3>
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-surface-border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-text-secondary">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">₦{p.amount.toLocaleString()}</p>
                    <p className="text-xs text-text-secondary">{p.paymentDate} • {p.receiptNumber}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(p.receiptNumber)}>
                  <Download size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-8">
          <p className="text-xs text-text-disabled font-medium uppercase tracking-[0.2em]">
            Powered by TermPay
          </p>
        </div>
      </div>
    </ParentLayout>
  )
}

export default ParentDashboardPage
