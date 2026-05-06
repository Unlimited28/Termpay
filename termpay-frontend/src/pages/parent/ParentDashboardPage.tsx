import { ParentLayout } from '../../layouts'
import { Card, Button } from '../../components/ui'
import { Download, CheckCircle, CreditCard } from 'lucide-react'
import { mockStudents, mockRecentPayments, mockTerm } from '../../mock/mockData'
import { useToast } from '../../context/ToastContext'

const ParentDashboardPage = () => {
  const { toast } = useToast()
  // Mocking student s1 (Fully Paid) for the portal demo
  const student = mockStudents[0]
  const payments = mockRecentPayments.filter(p => p.studentId === student.id)

  const getStatusColor = () => {
    if (student.status === 'paid') return '#10B981'
    if (student.status === 'partial') return '#F59E0B'
    return '#EF4444'
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
      <div className="space-y-8 animate-in fade-in slide-up duration-500">
        {/* Child Header Card */}
        <div
          className="rounded-[16px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex items-center gap-5 bg-surface border border-white/6"
          style={{ borderTop: `3px solid ${getStatusColor()}` }}
        >
          <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-lg font-black text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            {student.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-ink-primary tracking-tight">{student.fullName}</h1>
            <p className="text-[#64748B] font-bold text-[13px] uppercase tracking-widest mt-0.5">
              {student.className} • {mockTerm.name}
            </p>
          </div>
        </div>

        {/* Fully Paid Card */}
        <div
          className="bg-emerald/[0.06] rounded-[20px] border border-emerald/20 p-12 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden"
        >
          {/* Subtle green glow behind icon */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}
          />

          <div className="flex flex-col items-center relative z-10">
            <div className="text-emerald mb-8 shadow-[0_0_24px_rgba(16,185,129,0.4)] rounded-full">
              <CheckCircle size={64} />
            </div>
            <h2 className="text-[28px] font-black text-emerald mb-2 tracking-tighter">FULLY PAID ✓</h2>
            <p className="text-[#64748B] font-medium max-w-xs mx-auto text-[15px]">
              Your fees for this term have been fully settled. Thank you!
            </p>
          </div>
        </div>

        {/* Fee Breakdown Card */}
        <Card title="Fee Breakdown" subtitle={`Details for ${mockTerm.name}`} className="p-0 overflow-hidden">
          <div className="space-y-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/2 text-left">
                    <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {feeItems.map((item, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 text-ink-secondary font-medium">{item.item}</td>
                      <td className="px-6 py-4 text-ink-primary text-right font-bold">₦{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/[0.08] bg-white/[0.01]">
                    <td className="px-6 py-5 font-bold text-ink-primary">Total Amount</td>
                    <td className="px-6 py-5 font-black text-ink-primary text-right text-[17px]">₦{student.totalBill.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-emerald/[0.02]">
                    <td className="px-6 py-5 font-bold text-emerald">Amount Paid</td>
                    <td className="px-6 py-5 font-black text-emerald text-right">₦{student.amountPaid.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-emerald/[0.02]">
                    <td className="px-6 py-5 font-bold text-emerald">Balance</td>
                    <td className="px-6 py-5 font-black text-emerald text-right italic">Fully Settled</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Payment History */}
        <div className="space-y-5">
          <h3 className="text-[17px] font-bold text-ink-primary px-1 tracking-tight">Payment History</h3>
          <div className="space-y-4">
            {payments.map((p) => (
              <div key={p.id} className="bg-surface p-5 rounded-[16px] border border-white/6 shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex items-center justify-between transition-all hover:border-white/12">
                <div className="flex items-center gap-5">
                  <div className="w-11 h-11 rounded-xl bg-white/4 flex items-center justify-center text-ink-muted border border-white/6">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-[16px] font-black text-ink-primary tracking-tight">₦{p.amount.toLocaleString()}</p>
                    <p className="text-xs text-[#475569] font-medium mt-0.5">{p.paymentDate} • {p.receiptNumber}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-10 w-10 !p-0" onClick={() => handleDownload(p.receiptNumber)}>
                  <Download size={18} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-[11px] text-[#334155] font-bold uppercase tracking-[0.25em]">
            Powered by <span className="text-emerald">TermPay</span> Intelligence
          </p>
        </div>
      </div>
    </ParentLayout>
  )
}

export default ParentDashboardPage
