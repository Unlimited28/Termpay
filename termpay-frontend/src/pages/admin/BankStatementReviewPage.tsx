import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { mockTransactions, mockStudents } from '../../mock/mockData'
import { type BankTransaction, type Student } from '../../types'

const BankStatementReviewPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.role === 'proprietor') {
      toast.info('Bank statement management is handled by your Bursar.')
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate, toast])

  if (user?.role === 'proprietor') return null

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
      <div className="ambient-green animate-in fade-in slide-up duration-400">
        <PageHeader
          title="Statement Review"
          subtitle={`Upload ID: ${id || 'u1'}`}
          back="/bank-statements"
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Transactions', value: transactions.length, icon: LayoutList, color: '#3B82F6' },
            { label: 'Auto-Matched', value: transactions.filter(t => t.confidence === 'HIGH' || t.confidence === 'MEDIUM').length, icon: CheckCircle2, color: '#10B981' },
            { label: 'Needs Review', value: transactions.filter(t => t.confidence === 'NEEDS_REVIEW').length, icon: AlertCircle, color: '#F59E0B' },
            { label: 'Unmatched', value: transactions.filter(t => t.confidence === 'UNMATCHED').length, icon: XCircle, color: '#EF4444' }
          ].map((stat, i) => (
            <div key={i} className="bg-surface border border-white/6 p-4 px-5 rounded-xl flex flex-col transition-all hover:border-white/12">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[28px] font-800 leading-none" style={{ color: stat.color, textShadow: `${stat.color}66 0 0 12px` }}>{stat.value}</span>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#475569]">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex bg-white/[0.02] border-b border-white/6 mb-8 h-[48px]">
          {(['auto', 'review', 'unmatched'] as const).map((tab) => {
            const label = tab === 'auto' ? 'Auto-Matched' : tab === 'review' ? 'Needs Review' : 'Unmatched';
            const count = tab === 'auto' ? autoMatched.length : tab === 'review' ? needsReview.length : unmatched.length;
            const active = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 h-full flex items-center gap-2.5 text-sm font-bold transition-all relative ${active ? 'text-emerald' : 'text-[#475569] hover:text-ink-secondary'}`}
              >
                {label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-emerald text-white' : 'bg-white/5 text-[#475569]'}`}>
                  {count}
                </span>
                {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald shadow-[0_0_8px_#10B981]" />}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {activeTab === 'auto' && (
          <Card className="p-0 overflow-hidden">
            {isConfirmingAll ? (
              <div className="p-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                {!confirmComplete ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                      <Loader2 size={40} className="text-emerald animate-spin" />
                    </div>
                    <h3 className="text-2xl font-black text-ink-primary tracking-tight mb-3">Confirming payments...</h3>
                    <p className="text-ink-secondary mb-8 font-medium">
                      Confirming {confirmProgress} of {highConfidenceCount} HIGH confidence matches
                    </p>
                    <div className="w-full max-w-xs bg-white/4 h-2 rounded-full overflow-hidden border border-white/6">
                      <div
                        className="bg-emerald h-full transition-all duration-300 shadow-[0_0_12px_#10B981]"
                        style={{ width: `${(confirmProgress / (highConfidenceCount || 1)) * 100}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-emerald/15 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                      <CheckCircle size={44} className="text-emerald" />
                    </div>
                    <h3 className="text-2xl font-black text-ink-primary tracking-tight mb-3">Confirmation Complete</h3>
                    <p className="text-emerald font-bold text-[16px] mb-10">
                      {highConfidenceCount} payments confirmed. {highConfidenceCount} WhatsApp receipts sent. ✓
                    </p>
                    <Button onClick={handleResetConfirm} className="px-10">
                      Back to List
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <>
                {autoMatched.length > 0 ? (
                  <>
                    <div className="px-6 py-5 border-b border-white/6 flex items-center justify-between bg-white/[0.01]">
                      <div className="flex items-center gap-2.5 text-[13px] text-ink-muted font-medium">
                        <HelpCircle size={16} className="text-emerald/60" />
                        Verify these matches before confirming
                      </div>
                      {highConfidenceCount > 0 && (
                        <Button
                          onClick={handleConfirmAllHigh}
                          className="px-6 shimmer-btn"
                        >
                          <Zap size={18} className="mr-2" />
                          Confirm {highConfidenceCount} HIGH ✓
                          <span className="ml-2 bg-white/20 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">{highConfidenceCount}</span>
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-transparent">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Date</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Sender Name</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Amount</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Matched Student</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {autoMatched.map((t) => (
                            <tr
                              key={t.id}
                              className={`group transition-all border-l-[3px] hover:bg-white/[0.02] ${
                                t.confidence === 'HIGH'
                                  ? 'border-l-emerald bg-emerald/[0.02]'
                                  : 'border-l-warning bg-warning/[0.02]'
                              }`}
                            >
                              <td className="px-6 py-5 text-sm text-ink-muted whitespace-nowrap">{t.date}</td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="font-bold text-ink-primary">{t.senderName}</span>
                                  <Badge
                                    variant={t.confidence === 'HIGH' ? 'high confidence' : 'medium confidence'}
                                    className="w-fit mt-1.5 uppercase tracking-widest text-[9px] font-black"
                                  >
                                    {t.confidence}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right font-black text-ink-primary">₦{t.amount.toLocaleString()}</td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="font-bold text-info-light">{t.matchedStudent}</span>
                                  <span className="text-[12px] text-[#475569] font-medium">{t.matchedClass}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-3">
                                  <button
                                    className="h-8 px-4 bg-emerald/12 border border-emerald/30 text-emerald rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-emerald/20 transition-all"
                                    onClick={() => handleConfirm(t.id)}
                                  >
                                    CONFIRM
                                  </button>
                                  <button
                                    className="h-8 px-3 text-ink-muted hover:text-ink-primary rounded-lg text-[11px] font-bold transition-all"
                                    onClick={() => handleOverride()}
                                  >
                                    OVERRIDE
                                  </button>
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
          <Card className="p-0 overflow-hidden">
            {needsReview.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-transparent">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Date</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Sender Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Amount</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Student Search</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {needsReview.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5 text-sm text-ink-muted">{t.date}</td>
                        <td className="px-6 py-5 font-bold text-ink-primary">
                          {t.senderName}
                          <p className="text-[11px] text-[#475569] font-medium mt-1 leading-relaxed">{t.narration}</p>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-ink-primary">₦{t.amount.toLocaleString()}</td>
                        <td className="px-6 py-5">
                          <StudentSearchSelect onSelect={(s) => {toast.success(`Assigned to ${s.fullName}`)}} />
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/8">
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
          <Card className="p-0 overflow-hidden">
            {unmatched.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-transparent">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Date</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Sender Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Amount</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Assign Student</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {unmatched.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5 text-sm text-ink-muted">{t.date}</td>
                        <td className="px-6 py-5 font-bold text-ink-primary">{t.senderName}</td>
                        <td className="px-6 py-5 text-right font-black text-ink-primary">₦{t.amount.toLocaleString()}</td>
                        <td className="px-6 py-5">
                          <StudentSearchSelect onSelect={(s) => toast.success(`Assigned to ${s.fullName}`)} />
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/8">
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
      </div>
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
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]">
          <Search size={14} />
        </div>
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-elevated border border-white/10 rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {results.length > 0 ? (
            results.map(s => (
              <button
                key={s.id}
                className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between transition-colors"
                onClick={() => {
                  onSelect(s)
                  setQuery(s.fullName)
                  setIsOpen(false)
                }}
              >
                <div>
                  <p className="text-sm font-semibold text-ink-primary">{s.fullName}</p>
                  <p className="text-[11px] text-[#475569] font-medium">{s.className}</p>
                </div>
                <Badge variant="neutral" className="text-[9px] tracking-widest">{s.admissionNumber}</Badge>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-[#475569]">No students found</div>
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
