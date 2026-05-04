import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle,
  HelpCircle,
  Search,
  Trash2,
  Loader2,
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
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="px-4 py-2 bg-blue-50 text-brand-blue rounded-full text-sm font-bold border border-blue-100">
          {transactions.length} Total
        </div>
        <div className="px-4 py-2 bg-green-50 text-brand-green rounded-full text-sm font-bold border border-green-100">
          {transactions.filter(t => t.confidence === 'HIGH' || t.confidence === 'MEDIUM').length} Auto-Matched
        </div>
        <div className="px-4 py-2 bg-amber-50 text-brand-amber rounded-full text-sm font-bold border border-amber-100">
          {transactions.filter(t => t.confidence === 'NEEDS_REVIEW').length} Needs Review
        </div>
        <div className="px-4 py-2 bg-red-50 text-brand-red rounded-full text-sm font-bold border border-red-100">
          {transactions.filter(t => t.confidence === 'UNMATCHED').length} Unmatched
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border mb-6">
        <button
          onClick={() => setActiveTab('auto')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'auto' ? 'text-navy' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Auto-Matched ({autoMatched.length})
          {activeTab === 'auto' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />}
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'review' ? 'text-navy' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Needs Review ({needsReview.length})
          {activeTab === 'review' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />}
        </button>
        <button
          onClick={() => setActiveTab('unmatched')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'unmatched' ? 'text-navy' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Unmatched ({unmatched.length})
          {activeTab === 'unmatched' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />}
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
                  <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <HelpCircle size={16} />
                      Verify these matches before confirming
                    </div>
                    {highConfidenceCount > 0 && (
                      <Button size="sm" onClick={handleConfirmAllHigh}>
                        <CheckCircle size={16} className="mr-2" />
                        Confirm {highConfidenceCount} HIGH matches
                      </Button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Sender Name</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4">Matched Student</th>
                          <th className="px-6 py-4">Class</th>
                          <th className="px-6 py-4">Confidence</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-border">
                        {autoMatched.map((t) => (
                          <tr key={t.id} className={`text-sm hover:bg-slate-50 transition-colors border-l-4 ${t.confidence === 'HIGH' ? 'border-l-brand-green' : 'border-l-brand-amber'}`}>
                            <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{t.date}</td>
                            <td className="px-6 py-4 font-medium text-text-primary">{t.senderName}</td>
                            <td className="px-6 py-4 text-right font-bold text-text-primary">₦{t.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 font-bold text-brand-blue">{t.matchedStudent}</td>
                            <td className="px-6 py-4 text-text-secondary">{t.matchedClass}</td>
                            <td className="px-6 py-4">
                              <Badge variant={t.confidence === 'HIGH' ? 'success' : 'warning'}>
                                {t.confidence}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="secondary" className="text-brand-green border-green-200 bg-green-50 hover:bg-green-100" onClick={() => handleConfirm(t.id)}>
                                  Confirm
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleOverride()}>
                                  Override
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
