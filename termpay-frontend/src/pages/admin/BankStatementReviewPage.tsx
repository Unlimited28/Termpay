import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle,
  HelpCircle,
  Search,
  Trash2,
  Loader2,
  LayoutList,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Zap
} from 'lucide-react'
import { AdminLayout } from '../../layouts'
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Input,
  EmptyState
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { mockTransactions, mockStudents } from '../../mock/mockData'
import { type BankTransaction, type Student } from '../../types'

const BankStatementReviewPage = () => {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'auto' | 'review' | 'unmatched'>('auto')
  const [transactions, setTransactions] = useState<BankTransaction[]>(mockTransactions)
  const [isConfirmingAll, setIsConfirmingAll] = useState(false)
  const [confirmProgress, setConfirmProgress] = useState(0)
  const [confirmComplete, setConfirmComplete] = useState(false)

  // Filter transactions for each tab
  const autoMatched = transactions.filter(t => (t.confidence === 'HIGH' || t.confidence === 'MEDIUM') && !t.isConfirmed)
  const needsReview = transactions.filter(t => t.confidence === 'NEEDS_REVIEW' && !t.isConfirmed)
  const unmatched = transactions.filter(t => t.confidence === 'UNMATCHED' && !t.isConfirmed)

  const highConfidenceCount = autoMatched.filter(t => t.confidence === 'HIGH').length

  const handleConfirm = (transactionId: string) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, isConfirmed: true } : t))
    toast.success(`Payment confirmed. WhatsApp receipt sent to parent.`)
  }

  const handleOverride = () => {
    toast.info("Select a different student to match this transaction.")
  }

  const handleConfirmAllHigh = async () => {
    const highTransactions = autoMatched.filter(t => t.confidence === 'HIGH')
    if (highTransactions.length === 0) return

    setIsConfirmingAll(true)
    setConfirmProgress(0)

    for (let i = 0; i < highTransactions.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400))
      setConfirmProgress(i + 1)
    }

    await new Promise(resolve => setTimeout(resolve, 300))
    setConfirmComplete(true)

    // Update transactions in local state
    setTransactions(prev => prev.map(t =>
      (t.confidence === 'HIGH' && !t.isConfirmed) ? { ...t, isConfirmed: true } : t
    ))

    toast.success(`${highTransactions.length} payments confirmed successfully`)
  }

  const handleResetConfirm = () => {
    setIsConfirmingAll(false)
    setConfirmComplete(false)
    setConfirmProgress(0)
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Statement Review"
        subtitle={`Upload ID: ${id || 'u1'}`}
        back="/bank-statements"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#EBF8FF] p-[16px] px-[20px] rounded-xl flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[24px] font-bold text-[#2B6CB0] leading-none">{transactions.length}</span>
            <LayoutList size={20} className="text-[#2B6CB0]" />
          </div>
          <span className="text-[12px] font-medium text-[#2B6CB0]">Total Transactions</span>
        </div>
        <div className="bg-[#F0FFF4] p-[16px] px-[20px] rounded-xl flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[24px] font-bold text-[#2F855A] leading-none">{transactions.filter(t => t.confidence === 'HIGH' || t.confidence === 'MEDIUM').length}</span>
            <CheckCircle2 size={20} className="text-[#2F855A]" />
          </div>
          <span className="text-[12px] font-medium text-[#2F855A]">Auto-Matched</span>
        </div>
        <div className="bg-[#FFFBEB] p-[16px] px-[20px] rounded-xl flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[24px] font-bold text-[#B7791F] leading-none">{transactions.filter(t => t.confidence === 'NEEDS_REVIEW').length}</span>
            <AlertCircle size={20} className="text-[#B7791F]" />
          </div>
          <span className="text-[12px] font-medium text-[#B7791F]">Needs Review</span>
        </div>
        <div className="bg-[#FFF5F5] p-[16px] px-[20px] rounded-xl flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[24px] font-bold text-[#C53030] leading-none">{transactions.filter(t => t.confidence === 'UNMATCHED').length}</span>
            <XCircle size={20} className="text-[#C53030]" />
          </div>
          <span className="text-[12px] font-medium text-[#C53030]">Unmatched</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] mb-6 h-[44px]">
        <button
          onClick={() => setActiveTab('auto')}
          className={`px-6 h-full flex items-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'auto' ? 'text-[#0D2137]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          Auto-Matched
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'auto' ? 'bg-[#0D2137] text-white' : 'bg-[#E2E8F0] text-[#64748B]'}`}>
            {autoMatched.length}
          </span>
          {activeTab === 'auto' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0D2137]" />}
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-6 h-full flex items-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'review' ? 'text-[#0D2137]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          Needs Review
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'review' ? 'bg-[#0D2137] text-white' : 'bg-[#E2E8F0] text-[#64748B]'}`}>
            {needsReview.length}
          </span>
          {activeTab === 'review' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0D2137]" />}
        </button>
        <button
          onClick={() => setActiveTab('unmatched')}
          className={`px-6 h-full flex items-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'unmatched' ? 'text-[#0D2137]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          Unmatched
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'unmatched' ? 'bg-[#0D2137] text-white' : 'bg-[#E2E8F0] text-[#64748B]'}`}>
            {unmatched.length}
          </span>
          {activeTab === 'unmatched' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0D2137]" />}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'auto' && (
        <Card className="p-0">
          {isConfirmingAll ? (
            <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              {!confirmComplete ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                    <Loader2 size={40} className="text-navy animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Confirming payments...</h3>
                  <p className="text-text-secondary mb-6">
                    Confirming {confirmProgress} of {highConfidenceCount} HIGH confidence matches
                  </p>
                  <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-navy h-full transition-all duration-300"
                      style={{ width: `${(confirmProgress / (highConfidenceCount || 1)) * 100}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
                    <CheckCircle size={40} className="text-brand-green" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Confirmation Complete</h3>
                  <p className="text-brand-green font-medium mb-8">
                    {highConfidenceCount} payments confirmed. {highConfidenceCount} WhatsApp receipts sent. ✓
                  </p>
                  <Button onClick={handleResetConfirm}>
                    Back to List
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {autoMatched.length > 0 ? (
                <>
                  <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
                      <HelpCircle size={16} />
                      Verify these matches before confirming
                    </div>
                    {highConfidenceCount > 0 && (
                      <Button
                        size="md"
                        onClick={handleConfirmAllHigh}
                        className="h-[44px] px-[24px] rounded-lg font-semibold"
                        style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' }}
                      >
                        <Zap size={18} className="mr-2" />
                        Confirm {highConfidenceCount} HIGH ✓
                        <span className="ml-2 bg-white text-[#2E7D32] px-1.5 py-0.5 rounded text-[10px]">{highConfidenceCount}</span>
                      </Button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Sender Name</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4">Matched Student</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {autoMatched.map((t) => (
                          <tr
                            key={t.id}
                            className={`group transition-colors border-l-[4px] ${
                              t.confidence === 'HIGH'
                                ? 'border-l-[#2E7D32] bg-[#2E7D32]/[0.02]'
                                : 'border-l-[#E65100] bg-[#E65100]/[0.02]'
                            }`}
                          >
                            <td className="px-6 py-4 text-[#64748B] whitespace-nowrap">{t.date}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-[#0F172A]">{t.senderName}</span>
                                <Badge
                                  variant={t.confidence === 'HIGH' ? 'success' : 'warning'}
                                  className={`w-fit mt-1 text-[10px] border-none ${t.confidence === 'HIGH' ? '!bg-[#2E7D32] text-white' : '!bg-[#E65100] text-white'}`}
                                >
                                  {t.confidence}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-[#0F172A]">₦{t.amount.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#1565C0]">{t.matchedStudent}</span>
                                <span className="text-[12px] text-[#94A3B8]">{t.matchedClass}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="h-[32px] text-[10px] font-bold bg-[#2E7D32] hover:bg-[#1B5E20] text-white"
                                  onClick={() => handleConfirm(t.id)}
                                >
                                  CONFIRM
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-[32px] text-[10px] font-bold text-[#64748B]"
                                  onClick={() => handleOverride()}
                                >
                                  OVERRIDE
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={CheckCircle}
                  title="All matched!"
                  description="No pending auto-matched transactions left to confirm."
                />
              )}
            </>
          )}
        </Card>
      )}

      {activeTab === 'review' && (
        <Card className="p-0">
          {needsReview.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Sender Name</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Student Search</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {needsReview.map((t) => (
                    <tr key={t.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-text-secondary">{t.date}</td>
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {t.senderName}
                        <p className="text-xs text-text-disabled mt-0.5">{t.narration}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-text-primary">₦{t.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <StudentSearchSelect onSelect={(s) => {toast.success(`Assigned to ${s.fullName}`)}} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-brand-red hover:bg-red-50">
                          <Trash2 size={16} className="mr-2" />
                          Not a Fee
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="Review list empty"
              description="No transactions currently need manual review."
            />
          )}
        </Card>
      )}

      {activeTab === 'unmatched' && (
        <Card className="p-0">
          {unmatched.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Sender Name</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Assign Student</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {unmatched.map((t) => (
                    <tr key={t.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-text-secondary">{t.date}</td>
                      <td className="px-6 py-4 font-medium text-text-primary">{t.senderName}</td>
                      <td className="px-6 py-4 text-right font-bold text-text-primary">₦{t.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <StudentSearchSelect onSelect={(s) => toast.success(`Assigned to ${s.fullName}`)} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-brand-red hover:bg-red-50">
                          Not a Fee
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="Clean slate!"
              description="All unmatched transactions have been resolved."
            />
          )}
        </Card>
      )}
    </AdminLayout>
  )
}

// Simple searchable student selector component
const StudentSearchSelect = ({ onSelect }: { onSelect: (s: Student) => void }) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const results = useMemo(() => {
    if (query.length < 2) return []
    return mockStudents.filter(s =>
      s.fullName.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }, [query])

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Search student..."
          className="h-9 pr-8"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled">
          <Search size={14} />
        </div>
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-border rounded-lg shadow-xl z-50 overflow-hidden">
          {results.length > 0 ? (
            results.map(s => (
              <button
                key={s.id}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
                onClick={() => {
                  onSelect(s)
                  setQuery(s.fullName)
                  setIsOpen(false)
                }}
              >
                <div>
                  <p className="font-medium text-text-primary">{s.fullName}</p>
                  <p className="text-xs text-text-secondary">{s.className}</p>
                </div>
                <Badge variant="neutral">{s.admissionNumber}</Badge>
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-text-disabled">No students found</div>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}

export default BankStatementReviewPage
