import { useState } from 'react'
import { ParentLayout } from '../../layouts'
import { Card, Button, LoadingSkeleton } from '../../components/ui'
import { Download, CheckCircle, CreditCard, Clock, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { parentService } from '../../services/parentService'
import { useToast } from '../../context/ToastContext'

const ParentDashboardPage = () => {
  const { toast } = useToast()
  const [activeStudentIndex, setActiveStudentIndex] = useState(0)

  const { data: children, isLoading } = useQuery({
    queryKey: ['parent-status'],
    queryFn: parentService.getStatus
  })

  const handleDownload = async (paymentId: string) => {
    try {
      const data = await parentService.downloadReceipt(paymentId)
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    } catch (err) {
      toast.error('Failed to download receipt')
    }
  }

  if (isLoading) {
    return (
      <ParentLayout>
        <div className="space-y-8 animate-in fade-in duration-500">
           <LoadingSkeleton variant="stats" />
           <LoadingSkeleton variant="table" />
        </div>
      </ParentLayout>
    )
  }

  if (!children || children.length === 0) {
    return (
      <ParentLayout>
        <div className="py-20 text-center">
          <p className="text-[#64748B]">No children found associated with this account.</p>
        </div>
      </ParentLayout>
    )
  }

  const activeStudent = children[activeStudentIndex]
  const status = activeStudent.status

  const getStatusConfig = () => {
    if (status === 'paid') return { color: '#10B981', label: 'FULLY PAID', icon: CheckCircle, bgColor: 'bg-emerald/[0.06]', borderColor: 'border-emerald/20', textColor: 'text-emerald' }
    if (status === 'partial') return { color: '#F59E0B', label: 'PARTIALLY PAID', icon: Clock, bgColor: 'bg-warning/[0.06]', borderColor: 'border-warning/20', textColor: 'text-warning' }
    return { color: '#EF4444', label: 'UNPAID', icon: AlertCircle, bgColor: 'bg-danger/[0.06]', borderColor: 'border-danger/20', textColor: 'text-danger' }
  }

  const config = getStatusConfig()

  return (
    <ParentLayout>
      <div className="space-y-8 animate-in fade-in slide-up duration-500">
        {/* Tab Switcher for Multiple Children */}
        {children.length > 1 && (
          <div className="flex bg-white/[0.02] border-b border-white/6 h-[48px] overflow-x-auto">
            {children.map((child: any, idx: number) => (
              <button
                key={child.id}
                onClick={() => setActiveStudentIndex(idx)}
                className={`px-6 h-full flex items-center whitespace-nowrap text-sm font-bold transition-all relative ${activeStudentIndex === idx ? 'text-emerald' : 'text-[#475569]'}`}
              >
                {child.fullName}
                {activeStudentIndex === idx && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald shadow-[0_0_8px_#10B981]" />}
              </button>
            ))}
          </div>
        )}

        {/* Child Header Card */}
        <div
          className="rounded-[16px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex items-center gap-5 bg-surface border border-white/6"
          style={{ borderTop: `3px solid ${config.color}` }}
        >
          <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-lg font-black text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${config.color}, #059669)` }}>
            {activeStudent.fullName.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-ink-primary tracking-tight">{activeStudent.fullName}</h1>
            <p className="text-[#64748B] font-bold text-[13px] uppercase tracking-widest mt-0.5">
              {activeStudent.className} • {activeStudent.termName}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div
          className={`${config.bgColor} rounded-[20px] border ${config.borderColor} p-12 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden`}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none"
            style={{ background: `radial-gradient(circle, ${config.color}26 0%, transparent 70%)` }}
          />

          <div className="flex flex-col items-center relative z-10">
            <div className={`${config.textColor} mb-8 shadow-[0_0_24px_rgba(16,185,129,0.4)] rounded-full`}>
              <config.icon size={64} />
            </div>
            <h2 className={`text-[28px] font-black ${config.textColor} mb-2 tracking-tighter`}>{config.label} {status === 'paid' ? '✓' : ''}</h2>
            <p className="text-[#64748B] font-medium max-w-xs mx-auto text-[15px]">
              {status === 'paid'
                ? 'Your fees for this term have been fully settled. Thank you!'
                : status === 'partial'
                ? `You have a balance of ₦${activeStudent.balance.toLocaleString()} remaining.`
                : `Your total fees of ₦${activeStudent.totalBill.toLocaleString()} are due.`}
            </p>
          </div>
        </div>

        {/* Fee Breakdown Card */}
        <Card title="Fee Breakdown" subtitle={`Details for ${activeStudent.termName}`} className="p-0 overflow-hidden">
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
                  {activeStudent.feeItems?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="px-6 py-4 text-ink-secondary font-medium">{item.name}</td>
                      <td className="px-6 py-4 text-ink-primary text-right font-bold">₦{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/[0.08] bg-white/[0.01]">
                    <td className="px-6 py-5 font-bold text-ink-primary">Total Amount</td>
                    <td className="px-6 py-5 font-black text-ink-primary text-right text-[17px]">₦{activeStudent.totalBill.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-emerald/[0.02]">
                    <td className="px-6 py-5 font-bold text-emerald">Amount Paid</td>
                    <td className="px-6 py-5 font-black text-emerald text-right">₦{activeStudent.amountPaid.toLocaleString()}</td>
                  </tr>
                  <tr className={activeStudent.balance > 0 ? "bg-danger/[0.02]" : "bg-emerald/[0.02]"}>
                    <td className={`px-6 py-5 font-bold ${activeStudent.balance > 0 ? "text-danger" : "text-emerald"}`}>Balance</td>
                    <td className={`px-6 py-5 font-black ${activeStudent.balance > 0 ? "text-danger" : "text-emerald"} text-right`}>
                      {activeStudent.balance > 0 ? `₦${activeStudent.balance.toLocaleString()}` : 'Fully Settled'}
                    </td>
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
            {activeStudent.payments?.map((p: any) => (
              <div key={p.id} className="bg-surface p-5 rounded-[16px] border border-white/6 shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex items-center justify-between transition-all hover:border-white/12">
                <div className="flex items-center gap-5">
                  <div className="w-11 h-11 rounded-xl bg-white/4 flex items-center justify-center text-ink-muted border border-white/6">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-[16px] font-black text-ink-primary tracking-tight">₦{p.amountPaid.toLocaleString()}</p>
                    <p className="text-xs text-[#475569] font-medium mt-0.5">{new Date(p.paymentDate).toLocaleDateString()} • {p.receiptNumber}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-10 w-10 !p-0" onClick={() => handleDownload(p.id)}>
                  <Download size={18} />
                </Button>
              </div>
            ))}
            {(!activeStudent.payments || activeStudent.payments.length === 0) && (
              <div className="p-8 text-center bg-surface border border-dashed border-white/10 rounded-2xl text-[#475569]">
                No payment records found.
              </div>
            )}
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
