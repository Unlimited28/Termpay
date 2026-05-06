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
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'blue', topBorder: '#1565C0', bg: 'bg-blue-50', iconColor: 'text-brand-blue' },
    { label: 'Fully Paid', value: stats.paidCount, percent: stats.paidPercent, icon: CheckCircle, color: 'green', topBorder: '#2E7D32', bg: 'bg-green-50', iconColor: 'text-brand-green' },
    { label: 'Partially Paid', value: stats.partialCount, percent: stats.partialPercent, icon: Clock, color: 'amber', topBorder: '#E65100', bg: 'bg-amber-50', iconColor: 'text-brand-amber' },
    { label: 'Unpaid', value: stats.unpaidCount, percent: stats.unpaidPercent, icon: XCircle, color: 'red', topBorder: '#B71C1C', bg: 'bg-red-50', iconColor: 'text-brand-red' },
  ]

  const statsRow2 = [
    { label: 'Total Collected', value: stats.totalCollected, icon: TrendingUp, color: 'green', topBorder: '#2E7D32', bg: 'bg-green-50', iconColor: 'text-brand-green', isCurrency: true },
    { label: 'Outstanding', value: stats.totalOutstanding, icon: AlertCircle, color: 'red', topBorder: '#B71C1C', bg: 'bg-red-50', iconColor: 'text-brand-red', isCurrency: true },
  ]

  const chartData = [
    { name: 'Paid', value: stats.paidCount, color: '#2E7D32' },
    { name: 'Partial', value: stats.partialCount, color: '#E65100' },
    { name: 'Unpaid', value: stats.unpaidCount, color: '#B71C1C' },
  ]

  const handleSendReminder = (_studentName: string, parentName: string) => {
    toast.success(`Reminder sent to ${parentName}`)
  }

  const handleSendAllReminders = () => {
    toast.success(`Reminders sent to ${unpaidStudents.length} parents`)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A]">{getGreeting()}</h1>
          <p className="text-[13px] text-[#64748B] mt-1">{mockTerm.name} {mockTerm.session} · {user?.schoolName || 'Yomfield Nursery & Primary School'}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/students')}>
            <Plus size={18} className="mr-2" />
            Add Student
          </Button>
          <Button
            onClick={() => navigate('/bank-statements')}
            style={{ background: 'linear-gradient(135deg, #0D2137 0%, #1B3A5C 100%)' }}
          >
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
            className="bg-white p-6 rounded-[16px] overflow-hidden relative stats-card-hover"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)',
              borderTop: `3px solid ${stat.topBorder}`
            }}
          >
            <div className="flex justify-between items-start">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8]">{stat.label}</p>
              <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={20} className={stat.iconColor} />
              </div>
            </div>
            <div className="mt-[12px]">
              <div className="text-[40px] font-800 tracking-[-0.04em] text-[#0F172A] leading-tight">
                <CountUp end={stat.value} />
              </div>
              <p className="text-[13px] text-[#64748B] mt-[4px]">
                {stat.percent !== undefined ? `${stat.percent}% of total` : 'Current term'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {statsRow2.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[16px] overflow-hidden relative stats-card-hover"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)',
              borderTop: `3px solid ${stat.topBorder}`
            }}
          >
            <div className="flex justify-between items-start">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8]">{stat.label}</p>
              <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={20} className={stat.iconColor} />
              </div>
            </div>
            <div className="mt-[12px]">
              <div className={`text-[40px] font-800 tracking-[-0.04em] leading-tight ${stat.label === 'Outstanding' ? 'text-brand-red' : 'text-brand-green'}`}>
                ₦<CountUp end={stat.value} />
              </div>
              <p className="text-[13px] text-[#64748B] mt-[4px]">Total for current term</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-8">
          <div className="mb-6">
            <h2 className="text-[16px] font-semibold text-[#0F172A]">Payment Overview</h2>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[36px] font-800 tracking-[-0.04em] text-[#0F172A]">{stats.totalStudents}</span>
              <span className="text-[11px] text-[#94A3B8] font-semibold uppercase tracking-wider">Students</span>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[12px] text-[#64748B] font-medium">{item.name}</span>
              </div>
            ))}
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
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentPayments.map((payment) => (
                  <tr key={payment.id} className="group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#0F172A]">{payment.studentName}</span>
                        <span className="text-[12px] text-[#94A3B8]">{payment.className}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#0F172A]">₦{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="paid" className="text-[10px] rounded-full px-2 py-0.5">Paid</Badge>
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
        className="border-l-[4px] border-l-[#FCA5A5] !bg-[#FFFBFB]"
        title={`Unpaid Students (${unpaidStudents.length})`}
        subtitle="Outstanding balances for current term"
        actions={
          <Button
            variant="secondary"
            size="sm"
            className="!border-brand-red !text-brand-red hover:!bg-red-50"
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
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3 text-right">Balance</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {unpaidStudents.map((student) => (
                <tr key={student.id} className="group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#0F172A]">{student.fullName}</span>
                      <span className="text-[12px] text-[#94A3B8]">{student.className} • {student.parentPhone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-brand-red">₦{student.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
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
    </>
  )
}

export default BursarDashboard
