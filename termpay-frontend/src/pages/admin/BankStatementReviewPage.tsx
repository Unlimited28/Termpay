import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  HelpCircle,
  Search,
  Loader2,
  LayoutList,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Zap
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../layouts'
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Input,
  EmptyState,
  LoadingSkeleton
} from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { bankStatementsService } from '../../services/bankStatementsService'
import { studentsService } from '../../services/studentsService'
import { getErrorMessage } from '../../services/apiClient'

const BankStatementReviewPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (user?.role === 'proprietor') {
      toast.info('Bank statement management is handled by your Bursar.')
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate, toast])

  if (user?.role === 'proprietor') return null

  const [activeTab, setActiveTab] = useState<'auto' | 'review' | 'unmatched'>('auto')
  const [isConfirmingAll, setIsConfirmingAll] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)

  const { data: transactionData, isLoading } = useQuery({
    queryKey: ['transactions', id, activeTab],
    queryFn: async () => {
      const data = await bankStatementsService.getTransactions(id!, activeTab)
      // If no matching has been run yet (all are UNMATCHED but total > 0)
      if (data.summary.total > 0 && data.summary.autoMatched === 0 && data.summary.needsReview === 0 && data.summary.unmatched === data.summary.total) {
         // Auto-trigger matching if it's a fresh upload
         await bankStatementsService.runMatching(id!)
         return bankStatementsService.getTransactions(id!, activeTab)
      }
      return data
    }
  })

  const confirmMutation = useMutation({
    mutationFn: (txId: string) => bankStatementsService.confirmMatch(id!, txId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Payment confirmed. WhatsApp receipt sent.')
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const confirmAllMutation = useMutation({
    mutationFn: () => bankStatementsService.confirmAllHigh(id!),
    onSuccess: (data) => {
      setIsConfirmingAll(false)
      setConfirmComplete(true)
      queryClient.invalidateQueries({ queryKey: ['transactions', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success(`${data.confirmed} payments confirmed successfully`)
    },
    onError: (err) => {
      setIsConfirmingAll(false)
      toast.error(getErrorMessage(err))
    }
  })

  const overrideMutation = useMutation({
    mutationFn: ({ txId, studentId }: { txId: string, studentId: string }) =>
      bankStatementsService.overrideMatch(id!, txId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', id] })
      toast.success('Transaction matched successfully')
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const dismissMutation = useMutation({
    mutationFn: (txId: string) => bankStatementsService.dismissTransaction(id!, txId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', id] })
      toast.success('Transaction dismissed')
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const handleConfirmAllHigh = () => {
    setIsConfirmingAll(true)
    confirmAllMutation.mutate()
  }

  const handleResetConfirm = () => {
    setIsConfirmingAll(false)
    setConfirmComplete(false)
  }

  if (isLoading) {
    return <AdminLayout><div className="p-8"><LoadingSkeleton variant="table" rows={10} /></div></AdminLayout>
  }

  const transactions = transactionData?.transactions || []
  const summary = transactionData?.summary || { total: 0, autoMatched: 0, needsReview: 0, unmatched: 0 }
  const highConfidenceCount = transactions.filter((t: any) => t.confidence === 'HIGH').length

  return (
    <AdminLayout>
      <div className="ambient-green animate-in fade-in slide-up duration-400">
        <PageHeader
          title="Statement Review"
          subtitle={`Upload ID: ${id}`}
          back="/bank-statements"
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Transactions', value: summary.total, icon: LayoutList, color: '#3B82F6' },
            { label: 'Auto-Matched', value: summary.autoMatched, icon: CheckCircle2, color: '#10B981' },
            { label: 'Needs Review', value: summary.needsReview, icon: AlertCircle, color: '#F59E0B' },
            { label: 'Unmatched', value: summary.unmatched, icon: XCircle, color: '#EF4444' }
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
            const count = tab === 'auto' ? summary.autoMatched : tab === 'review' ? summary.needsReview : summary.unmatched;
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
        <Card className="p-0 overflow-hidden">
          {isConfirmingAll ? (
            <div className="p-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
              {!confirmComplete ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                    <Loader2 size={40} className="text-emerald animate-spin" />
                  </div>
                  <h3 className="text-2xl font-black text-ink-primary tracking-tight mb-3">Confirming payments...</h3>
                  <p className="text-ink-secondary mb-8 font-medium">Processing high confidence matches</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald/15 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={44} className="text-emerald" />
                  </div>
                  <h3 className="text-2xl font-black text-ink-primary tracking-tight mb-3">Confirmation Complete</h3>
                  <p className="text-emerald font-bold text-[16px] mb-10"> Payments confirmed successfully. ✓</p>
                  <Button onClick={handleResetConfirm} className="px-10">Back to List</Button>
                </>
              )}
            </div>
          ) : (
            <>
              {transactions.length > 0 ? (
                <>
                  {activeTab === 'auto' && (
                    <div className="px-6 py-5 border-b border-white/6 flex items-center justify-between bg-white/[0.01]">
                      <div className="flex items-center gap-2.5 text-[13px] text-ink-muted font-medium">
                        <HelpCircle size={16} className="text-emerald/60" />
                        Verify these matches before confirming
                      </div>
                      {highConfidenceCount > 0 && (
                        <Button
                          onClick={handleConfirmAllHigh}
                          className="px-6 shimmer-btn"
                          isLoading={confirmAllMutation.isPending}
                        >
                          <Zap size={18} className="mr-2" />
                          Confirm {highConfidenceCount} HIGH ✓
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-transparent">
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Date</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Description</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Amount</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">
                            {activeTab === 'auto' ? 'Matched Student' : 'Assign Student'}
                          </th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {transactions.map((t: any) => (
                          <tr
                            key={t.id}
                            className={`group transition-all hover:bg-white/[0.02] ${
                              activeTab === 'auto' ? (t.confidence === 'HIGH' ? 'border-l-[3px] border-l-emerald bg-emerald/[0.02]' : 'border-l-[3px] border-l-warning bg-warning/[0.02]') : ''
                            }`}
                          >
                            <td className="px-6 py-5 text-sm text-ink-muted whitespace-nowrap">
                              {new Date(t.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-ink-primary">{t.senderName || 'Unknown Sender'}</span>
                                <span className="text-[11px] text-[#475569] mt-1 truncate max-w-xs" title={t.narration}>{t.narration}</span>
                                {activeTab === 'auto' && (
                                  <Badge
                                    variant={t.confidence === 'HIGH' ? 'high confidence' : 'medium confidence'}
                                    className="w-fit mt-1.5 uppercase tracking-widest text-[9px] font-black"
                                  >
                                    {t.confidence} ({t.matchScore}%)
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right font-black text-ink-primary">₦{t.amount.toLocaleString()}</td>
                            <td className="px-6 py-5">
                              {activeTab === 'auto' ? (
                                <div className="flex flex-col">
                                  <span className="font-bold text-info-light">{t.studentName}</span>
                                  <span className="text-[12px] text-[#475569] font-medium">{t.className}</span>
                                </div>
                              ) : (
                                <StudentSearchSelect onSelect={(s) => overrideMutation.mutate({ txId: t.id, studentId: s.id })} />
                              )}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-3">
                                {activeTab === 'auto' && (
                                  <button
                                    className="h-8 px-4 bg-emerald/12 border border-emerald/30 text-emerald rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-emerald/20 transition-all"
                                    onClick={() => confirmMutation.mutate(t.id)}
                                    disabled={confirmMutation.isPending && confirmMutation.variables === t.id}
                                  >
                                    {confirmMutation.isPending && confirmMutation.variables === t.id ? '...' : 'CONFIRM'}
                                  </button>
                                )}
                                <button
                                  className="h-8 px-3 text-ink-muted hover:text-ink-primary rounded-lg text-[11px] font-bold transition-all"
                                  onClick={() => dismissMutation.mutate(t.id)}
                                >
                                  DISMISS
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
                  title={activeTab === 'auto' ? "All matched!" : activeTab === 'review' ? "Review list empty" : "Clean slate!"}
                  description="No transactions found in this category."
                />
              )}
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}

const StudentSearchSelect = ({ onSelect }: { onSelect: (s: any) => void }) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const { data: studentsData } = useQuery({
    queryKey: ['students-search', query],
    queryFn: () => studentsService.listStudents({ search: query, limit: 10 }),
    enabled: query.length >= 2
  })

  const results = studentsData?.data || []

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
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A2332] border border-white/10 rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {results.length > 0 ? (
            results.map((s: any) => (
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
                  <p className="text-sm font-semibold text-[#F1F5F9]">{s.fullName}</p>
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
