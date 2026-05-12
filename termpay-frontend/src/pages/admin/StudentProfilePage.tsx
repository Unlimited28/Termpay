import { useParams, useNavigate } from 'react-router-dom'
import {
  Download,
  MessageSquare,
  CreditCard,
  User,
  Phone,
  Mail,
  Hash,
  BookOpen
} from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { AdminLayout } from '../../layouts'
import {
  PageHeader,
  Card,
  Button,
  Badge,
  EmptyState,
  LoadingSkeleton
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { studentsService } from '../../services/studentsService'
import { dashboardService } from '../../services/dashboardService'
import { paymentsService } from '../../services/paymentsService'
import { getErrorMessage } from '../../services/apiClient'

const StudentProfilePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsService.getStudent(id!),
    enabled: !!id
  })

  // We'll use the listPayments service to get payments for this student
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['student-payments', id],
    queryFn: () => paymentsService.listPayments({ search: student?.admissionNumber, limit: 100 }),
    enabled: !!student?.admissionNumber
  })

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats
  })

  const sendReminderMutation = useMutation({
    mutationFn: (studentId: string) => dashboardService.sendReminder(studentId),
    onSuccess: () => toast.success('Reminder sent successfully'),
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

  if (studentLoading) {
    return <AdminLayout><div className="p-8"><LoadingSkeleton variant="table" rows={10} /></div></AdminLayout>
  }

  if (!student) {
    return (
      <AdminLayout>
        <EmptyState
          icon={User}
          title="Student not found"
          description="The student you are looking for does not exist or has been removed."
          action={<Button onClick={() => navigate('/students')}>Back to Students</Button>}
        />
      </AdminLayout>
    )
  }

  const payments = paymentsData?.data || []

  return (
    <AdminLayout>
      <PageHeader
        title={student.fullName}
        subtitle={student.className}
        back="/students"
        actions={
          <Button
            onClick={() => sendReminderMutation.mutate(student.id)}
            isLoading={sendReminderMutation.isPending}
          >
            <MessageSquare size={18} className="mr-2" />
            Send Reminder
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Student Info Card */}
        <Card title="Student Information" subtitle="Personal and contact details">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-text-secondary">
                  <Hash size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Admission Number</p>
                  <p className="text-sm font-bold text-text-primary">{student.admissionNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-text-secondary">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Class</p>
                  <p className="text-sm font-bold text-text-primary">{student.className}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-text-secondary">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Parent Name</p>
                  <p className="text-sm font-bold text-text-primary">{student.parentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-text-secondary">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Parent Phone</p>
                  <p className="text-sm font-bold text-text-primary">{student.parentPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-text-secondary">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Parent Email</p>
                  <p className="text-sm font-bold text-text-primary truncate max-w-[150px] md:max-w-none">
                    {student.parentEmail || <span className="font-normal text-text-disabled">Not provided</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-text-secondary">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Payment Reference</p>
                  <p className="text-sm font-bold text-text-primary font-mono">{student.paymentReference}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Term Bill Card */}
        <Card title={`${stats?.termName || ''} ${stats?.session || ''} Bill`} subtitle="Fee breakdown and status">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-surface-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-2 font-semibold text-text-secondary">Fee Item</th>
                    <th className="px-4 py-2 font-semibold text-text-secondary text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {student.feeItems?.map((fee: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-text-primary">{fee.name}</td>
                      <td className="px-4 py-2 text-text-primary text-right">₦{fee.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50 font-bold">
                    <td className="px-4 py-3 text-text-primary">Total Bill</td>
                    <td className="px-4 py-3 text-text-primary text-right">₦{student.totalBill.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-xs font-semibold text-brand-green uppercase tracking-wider">Amount Paid</p>
                <p className="text-lg font-bold text-brand-green">₦{student.amountPaid.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-lg border ${student.balance > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${student.balance > 0 ? 'text-brand-red' : 'text-brand-green'}`}>Balance</p>
                <p className={`text-lg font-bold ${student.balance > 0 ? 'text-brand-red' : 'text-brand-green'}`}>₦{student.balance.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Badge variant={student.status} className="text-sm px-4 py-1">
                {student.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card title="Payment History" subtitle="Confirmed transactions for this student">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Receipt No</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {paymentsLoading ? (
                <tr><td colSpan={5} className="p-6 text-center text-[#64748B]">Loading payments...</td></tr>
              ) : payments.length > 0 ? (
                payments.map((payment: any) => (
                  <tr key={payment.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-text-primary">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-text-primary">₦{payment.amountPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-text-secondary font-mono">{payment.receiptNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {payment.status === 'confirmed' ? (
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-brand-green">
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 5L4.33333 8.33333L11 1.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
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
                  <td colSpan={5} className="py-8">
                    <EmptyState
                      icon={CreditCard}
                      title="No payments recorded"
                      description="No payments have been confirmed for this student this term."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  )
}

export default StudentProfilePage
