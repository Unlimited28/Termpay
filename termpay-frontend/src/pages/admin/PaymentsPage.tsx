import { useState } from 'react'
import {
  Search,
  Download,
  Plus,
  CheckCircle,
  CreditCard,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../layouts'
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  EmptyState,
  LoadingSkeleton
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { paymentsService, type PaymentFilters } from '../../services/paymentsService'
import { studentsService } from '../../services/studentsService'
import { dashboardService } from '../../services/dashboardService'
import { getErrorMessage } from '../../services/apiClient'

const PaymentsPage = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({
    studentId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Bank Transfer',
    note: ''
  })

  const filters: PaymentFilters = {
    search: searchTerm,
    classId: classFilter === 'all' ? undefined : classFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page: currentPage,
    limit: itemsPerPage
  }

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentsService.listPayments(filters)
  })

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: studentsService.getClasses
  })

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats
  })

  const manualPaymentMutation = useMutation({
    mutationFn: (data: any) => paymentsService.recordManualPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Manual payment recorded successfully')
      setIsModalOpen(false)
      setNewPayment({
        studentId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer',
        note: ''
      })
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const data = await paymentsService.downloadReceipt(paymentId)
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    } catch (err) {
      toast.error('Failed to download receipt')
    }
  }

  const handleRecordPayment = () => {
    if (!newPayment.studentId || !newPayment.amount) {
      toast.error("Please fill in required fields")
      return
    }

    manualPaymentMutation.mutate({
      studentId: newPayment.studentId,
      amount: parseFloat(newPayment.amount),
      paymentDate: newPayment.date,
      paymentMethod: newPayment.method,
      note: newPayment.note
    })
  }

  const classOptions = [
    { value: 'all', label: 'All Classes' },
    ...(classes?.map((c: any) => ({ value: c.id, label: c.name })) || [])
  ]

  const payments = paymentsData?.data || []
  const totalAmount = stats?.totalCollected || 0
  const whatsappCount = paymentsData?.stats?.whatsappCount || 0

  return (
    <AdminLayout>
      <PageHeader
        title="Payments"
        subtitle={stats ? `${stats.termName} ${stats.session}` : ''}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            Record Manual Payment
          </Button>
        }
      />

      {/* Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-surface-border shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Total Payments</p>
            <p className="text-lg font-bold text-text-primary">{paymentsData?.pagination?.total || 0}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-surface-border shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-brand-green">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Total Amount</p>
            <p className="text-lg font-bold text-text-primary">₦{totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-surface-border shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"></path></svg>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">WhatsApp Sent</p>
            <p className="text-lg font-bold text-text-primary">{whatsappCount} overall</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6 overflow-visible">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Search"
              placeholder="Student or Receipt No..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="w-full lg:w-40">
            <Input
              label="From"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="w-full lg:w-40">
            <Input
              label="To"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="w-full lg:w-48">
            <Select
              label="Class"
              options={classOptions}
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="p-0">
        {isLoading ? (
          <div className="p-6"><LoadingSkeleton variant="table" rows={10} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Receipt No</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {payments.length > 0 ? (
                  payments.map((payment: any) => (
                    <tr key={payment.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-text-primary">{payment.receiptNumber}</td>
                      <td className="px-6 py-4 font-medium text-text-primary">{payment.studentName}</td>
                      <td className="px-6 py-4 text-text-secondary">{payment.className}</td>
                      <td className="px-6 py-4 text-right font-bold text-text-primary">₦{payment.amountPaid.toLocaleString()}</td>
                      <td className="px-6 py-4 text-text-secondary">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {payment.status === 'confirmed' ? (
                            <CheckCircle size={18} className="text-brand-green" />
                          ) : (
                            <Badge variant="warning">{payment.status}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(payment.id)}>
                          <Download size={16} className="mr-2" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <EmptyState
                        icon={CreditCard}
                        title="No payments found"
                        description="Try adjusting your search or date range filters."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Manual Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Manual Payment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} isLoading={manualPaymentMutation.isPending}>Save Payment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Select Student</label>
            <StudentSearchSelect onSelect={(s) => setNewPayment({...newPayment, studentId: s.id})} />
          </div>
          <Input
            label="Amount (₦)"
            type="number"
            placeholder="e.g. 45000"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
            required
          />
          <Input
            label="Payment Date"
            type="date"
            value={newPayment.date}
            onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
            required
          />
          <Select
            label="Payment Method"
            options={[
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Other', label: 'Other' },
            ]}
            value={newPayment.method}
            onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Note (Optional)</label>
            <textarea
              className="w-full min-h-[80px] p-3 text-sm border border-surface-border rounded-lg outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              placeholder="Add payment details..."
              value={newPayment.note}
              onChange={(e) => setNewPayment({...newPayment, note: e.target.value})}
            />
          </div>
        </div>
      </Modal>
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
          placeholder="Type student name..."
          className="h-11 pr-8"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled">
          <Search size={16} />
        </div>
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-border rounded-lg shadow-xl z-50 overflow-hidden">
          {results.length > 0 ? (
            results.map((s: any) => (
              <button
                key={s.id}
                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
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
            <div className="p-4 text-center text-sm text-text-disabled">No students found</div>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}

export default PaymentsPage
