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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, Button, Badge } from '../../../components/ui'
import CountUp from '../../../components/CountUp'
import { useToast } from '../../../context/ToastContext'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import {
  mockRecentPayments,
  mockTerm
} from '../../../mock/mockData'

const BursarDashboard = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const { students, stats } = useData()

  const unpaidStudents = students.filter(s => s.status === 'unpaid').slice(0, 5)

  const getGreeting = () => {
    const hours = new Date().getHours()
    const name = user?.fullName || 'Mrs. Folake Adeyemi'
    const parts = name.split(' ')
    const lastName = parts[parts.length - 1]

    let title = 'Mrs.'
    if (name.startsWith('Dr.')) title = 'Dr.'
    else if (name.startsWith('Mr.')) title = 'Mr.'
    else if (name.startsWith('Mrs.')) title = 'Mrs.'
    else if (name.startsWith('Miss')) title = 'Miss'
    else if (name.startsWith('Ms.')) title = 'Ms.'

    let greeting = 'Good morning'
    if (hours >= 12 && hours < 17) greeting = 'Good afternoon'
    if (hours >= 17) greeting = 'Good evening'

    return `${greeting}, ${title} ${lastName} 👋`
  }

  const statsRow1 = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, accent: '#3B82F6', subtle: 'rgba(59, 130, 246, 0.08)', iconColor: '#3B82F6' },
    { label: 'Fully Paid', value: stats.paidCount, percent: stats.paidPercent, icon: CheckCircle, accent: '#10B981', subtle: 'rgba(16, 185, 129, 0.08)', iconColor: '#10B981' },
    { label: 'Partially Paid', value: stats.partialCount, percent: stats.partialPercent, icon: Clock, accent: '#F59E0B', subtle: 'rgba(245, 158, 11, 0.08)', iconColor: '#F59E0B' },
    { label: 'Unpaid', value: stats.unpaidCount, percent: stats.unpaidPercent, icon: XCircle, accent: '#EF4444', subtle: 'rgba(239, 68, 68, 0.08)', iconColor: '#EF4444' },
  ]

  const statsRow2 = [
    { label: 'Total Collected', value: stats.totalCollected, icon: TrendingUp, accent: '#10B981', subtle: 'rgba(16, 185, 129, 0.08)', iconColor: '#10B981', isCurrency: true },
    { label: 'Outstanding', value: stats.totalOutstanding, icon: AlertCircle, accent: '#EF4444', subtle: 'rgba(239, 68, 68, 0.08)', iconColor: '#EF4444', isCurrency: true },
  ]

  const chartData = [
    { name: 'Paid', value: stats.paidCount, color: '#10B981' },
    { name: 'Partial', value: stats.partialCount, color: '#F59E0B' },
    { name: 'Unpaid', value: stats.unpaidCount, color: '#EF4444' },
  ]

  const handleSendReminder = (_studentName: string, parentName: string) => {
    toast.success(`Reminder sent to ${parentName}`)
  }

  const handleSendAllReminders = () => {
    toast.success(`Reminders sent to ${unpaidStudents.length} parents`)
  }

  return (
    <div className="ambient-green animate-in fade-in slide-up duration-400">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-ink-primary tracking-tighter">{getGreeting()}</h1>
          <p className="text-[13px] text-[#64748B] mt-1">{mockTerm.name} {mockTerm.session} · {user?.schoolName || 'Yomfield Nursery & Primary School'}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/students')}>
            <Plus size={18} className="mr-2" />
            Add Student
          </Button>
          <Button onClick={() => navigate('/bank-statements')}>
            <Upload size={18} className="mr-2" />
            Upload Statement
          </Button>
        </div>
      </div>

      {/* Row 1 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsRow1.map((stat, i) => (
          <div
            key={i}
            className="bg-surface border border-white/6 p-6 rounded-[16px] relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
            style={{ borderTop: `2px solid ${stat.accent}` }}
          >
            <div className="flex justify-between items-start relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#475569]">{stat.label}</p>
              <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center" style={{ backgroundColor: stat.subtle }}>
                <stat.icon size={20} style={{ color: stat.iconColor }} />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <div className="text-[40px] font-800 tracking-[-0.04em] text-ink-primary leading-tight">
                <CountUp end={stat.value} />
              </div>
              <p className="text-[13px] text-[#64748B] mt-1">
                {stat.percent !== undefined ? `${stat.percent}% of total` : 'Current term'}
              </p>
            </div>
            <stat.icon size={80} className="absolute bottom-[-20px] right-[-20px] opacity-[0.04] text-white" />
          </div>
        ))}
      </div>

      {/* Row 2 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {statsRow2.map((stat, i) => (
          <div
            key={i}
            className="bg-surface border border-white/6 p-6 rounded-[16px] relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
            style={{ borderTop: `2px solid ${stat.accent}` }}
          >
            <div className="flex justify-between items-start relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#475569]">{stat.label}</p>
              <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center" style={{ backgroundColor: stat.subtle }}>
                <stat.icon size={20} style={{ color: stat.iconColor }} />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <div className={`text-[40px] font-800 tracking-[-0.04em] leading-tight ${stat.label === 'Outstanding' ? 'text-danger' : 'text-emerald'}`}>
                ₦<CountUp end={stat.value} />
              </div>
              <p className="text-[13px] text-[#64748B] mt-1">Total for current term</p>
            </div>
            <stat.icon size={80} className="absolute bottom-[-20px] right-[-20px] opacity-[0.04] text-white" />
          </div>
        ))}
      </div>

      {/* Charts & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-8">
          <div className="mb-8">
            <h2 className="text-[16px] font-semibold text-ink-primary">Payment Overview</h2>
          </div>
          <div className="h-[280px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2332',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '10px',
                    color: '#F1F5F9'
                  }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[28px] font-800 tracking-[-0.04em] text-ink-primary">{stats.totalStudents}</span>
              <span className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">Students</span>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-6">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[12px] text-[#94A3B8] font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Recent Payments"
          subtitle="Latest transactions this term"
          actions={<Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>View All</Button>}
          className="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-transparent">
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Student</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Amount</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {mockRecentPayments.map((payment) => (
                  <tr key={payment.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-ink-primary">{payment.studentName}</span>
                        <span className="text-[12px] text-[#475569]">{payment.className}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-ink-primary">₦{payment.amount.toLocaleString()}</span>
                    </td>
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
        className="!bg-danger/4 border-danger/12"
        title={`Unpaid Students (${unpaidStudents.length})`}
        subtitle="Outstanding balances for current term"
        actions={
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSendAllReminders}
          >
            <MessageSquare size={16} className="mr-2" />
            Send All Reminders
          </Button>
        }
      >
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-transparent">
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Student</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Balance</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {unpaidStudents.map((student) => (
                <tr key={student.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-ink-primary">{student.fullName}</span>
                      <span className="text-[12px] text-[#475569]">{student.className} • {student.parentPhone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-danger">₦{student.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => handleSendReminder(student.fullName, student.parentName)}
                    >
                      Remind
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default BursarDashboard
