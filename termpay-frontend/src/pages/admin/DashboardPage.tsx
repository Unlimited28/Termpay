import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  AlertCircle,
  Plus,
  Upload,
  MessageSquare
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { AdminLayout } from '../../layouts'
import { PageHeader, Card, Button, Badge } from '../../components/ui'
import CountUp from '../../components/CountUp'
import { useToast } from '../../context/ToastContext'
import {
  mockDashboardStats,
  mockRecentPayments,
  mockStudents,
  mockTerm
} from '../../mock/mockData'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [unpaidStudents] = useState(
    mockStudents.filter(s => s.status === 'unpaid').slice(0, 5)
  )

  const stats = [
    { label: 'Total Students', value: mockDashboardStats.totalStudents, icon: Users, color: 'blue', border: 'border-l-brand-blue' },
    { label: 'Fully Paid', value: mockDashboardStats.paidCount, percent: mockDashboardStats.paidPercent, icon: CheckCircle, color: 'green', border: 'border-l-brand-green' },
    { label: 'Partially Paid', value: mockDashboardStats.partialCount, percent: mockDashboardStats.partialPercent, icon: Clock, color: 'amber', border: 'border-l-brand-amber' },
    { label: 'Unpaid', value: mockDashboardStats.unpaidCount, percent: mockDashboardStats.unpaidPercent, icon: XCircle, color: 'red', border: 'border-l-brand-red' },
    { label: 'Total Collected', value: mockDashboardStats.totalCollected, icon: TrendingUp, color: 'green', border: 'border-l-brand-green', isCurrency: true },
    { label: 'Outstanding', value: mockDashboardStats.totalOutstanding, icon: AlertCircle, color: 'red', border: 'border-l-brand-red', isCurrency: true },
  ]

  const chartData = [
    { name: 'Paid', value: mockDashboardStats.paidCount, color: '#2E7D32' },
    { name: 'Partial', value: mockDashboardStats.partialCount, color: '#E65100' },
    { name: 'Unpaid', value: mockDashboardStats.unpaidCount, color: '#B71C1C' },
  ]

  const handleSendReminder = (_studentName: string, parentName: string) => {
    toast.success(`Reminder sent to ${parentName}`)
  }

  const handleSendAllReminders = () => {
    toast.success(`Reminders sent to ${unpaidStudents.length} parents`)
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        subtitle={`${mockTerm.name} ${mockTerm.session}`}
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => {/* Open Modal */}}>
              <Plus size={18} className="mr-2" />
              Add Student
            </Button>
            <Button onClick={() => navigate('/bank-statements')}>
              <Upload size={18} className="mr-2" />
              Upload Statement
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-xl border border-surface-border border-l-4 ${stat.border} shadow-sm`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-slate-50`}>
                <stat.icon size={24} className={`
                  ${stat.color === 'blue' ? 'text-brand-blue' : ''}
                  ${stat.color === 'green' ? 'text-brand-green' : ''}
                  ${stat.color === 'amber' ? 'text-brand-amber' : ''}
                  ${stat.color === 'red' ? 'text-brand-red' : ''}
                `} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
                <div className="text-2xl font-bold text-text-primary mt-1">
                  {stat.isCurrency ? '₦' : ''}
                  <CountUp end={stat.value} />
                  {stat.percent !== undefined && (
                    <span className="text-sm font-normal text-text-secondary ml-1">
                      ({stat.percent}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card title="Payment Overview" subtitle="Student payment distribution">
          <div className="h-[300px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-9">
              <span className="text-3xl font-bold text-text-primary">{mockDashboardStats.totalStudents}</span>
              <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Students</span>
            </div>
          </div>
        </Card>

        <Card
          title="Recent Payments"
          subtitle="Latest transactions this term"
          actions={<Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>View All</Button>}
        >
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Class</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {mockRecentPayments.map((payment) => (
                  <tr key={payment.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">{payment.studentName}</td>
                    <td className="px-6 py-4 text-text-secondary">{payment.className}</td>
                    <td className="px-6 py-4 text-right font-medium text-text-primary">₦{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="paid">Paid</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Unpaid Students */}
      <Card
        title={`Unpaid Students (${unpaidStudents.length})`}
        subtitle="Outstanding balances for current term"
        actions={
          <Button size="sm" onClick={handleSendAllReminders}>
            <MessageSquare size={16} className="mr-2" />
            Send All Reminders
          </Button>
        }
      >
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-3 text-right">Balance</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {unpaidStudents.map((student) => (
                <tr key={student.id} className="text-sm hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary">{student.fullName}</td>
                  <td className="px-6 py-4 text-text-secondary">{student.className}</td>
                  <td className="px-6 py-4 text-right font-bold text-brand-red">₦{student.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSendReminder(student.fullName, student.parentName)}
                    >
                      Send Reminder
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  )
}

export default DashboardPage
