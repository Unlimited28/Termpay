import { Link } from 'react-router-dom'
import {
  BarChart2,
  XCircle,
  Clock,
  CheckCircle,
  MessageSquare,
  UserPlus,
  Upload
} from 'lucide-react'
import { Card } from '../../../components/ui'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'

const mockClassCollections = [
  { className: 'Primary 2', students: 3, collected: 85000, expected: 255000, rate: 33 },
  { className: 'Primary 3', students: 3, collected: 95000, expected: 285000, rate: 33 },
  { className: 'Nursery 1', students: 3, collected: 150000, expected: 225000, rate: 67 },
  { className: 'Nursery 2', students: 3, collected: 150000, expected: 225000, rate: 67 },
  { className: 'Primary 1', students: 3, collected: 170000, expected: 255000, rate: 67 },
]

const recentActivity = [
  { id: 1, type: 'payment', description: '6 payments confirmed from GTBank statement', time: '2 hours ago', icon: CheckCircle, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.12)' },
  { id: 2, type: 'upload', description: 'Bank statement uploaded by Mrs. Adeyemi', time: '2 hours ago', icon: Upload, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.12)' },
  { id: 3, type: 'reminder', description: 'Reminders sent to 5 parents', time: 'Yesterday', icon: MessageSquare, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.12)' },
  { id: 4, type: 'payment', description: '7 payments confirmed from GTBank statement', time: '3 days ago', icon: CheckCircle, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.12)' },
  { id: 5, type: 'student', description: '1 new student added', time: '5 days ago', icon: UserPlus, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.12)' },
  { id: 6, type: 'upload', description: 'Bank statement uploaded', time: '5 days ago', icon: Upload, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.12)' },
]

const ProprietorDashboard = () => {
  const { user } = useAuth()
  const { students, stats } = useData()

  const getGreeting = () => {
    const hours = new Date().getHours()
    const name = user?.fullName || 'Dr. Yomi Adeyinka'
    const parts = name.split(' ')
    const lastName = parts[parts.length - 1]

    let title = 'Dr.'
    if (name.startsWith('Dr.')) title = 'Dr.'
    else if (name.startsWith('Mr.')) title = 'Mr.'
    else if (name.startsWith('Mrs.')) title = 'Mrs.'

    let greeting = 'Good morning'
    if (hours >= 12 && hours < 17) greeting = 'Good afternoon'
    if (hours >= 17) greeting = 'Good evening'

    return `${greeting}, ${title} ${lastName} 👋`
  }

  const topDefaulters = students
    .filter(s => s.status !== 'paid')
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)

  // Circular progress math
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (51 / 100) * circumference

  return (
    <div className="space-y-8 ambient-green animate-in fade-in slide-up duration-400">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-ink-primary leading-tight tracking-tighter">{getGreeting()}</h1>
        <p className="text-[16px] text-[#64748B] mt-1">Here is how Yomfield is performing this term.</p>
      </div>

      {/* Hero Section */}
      <div
        className="rounded-[20px] p-8 text-ink-primary flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-emerald/15 shadow-[0_0_40px_rgba(16,185,129,0.08)]"
        style={{ background: 'linear-gradient(135deg, #0F1724 0%, #1A2332 100%)' }}
      >
        <div className="z-10 text-center md:text-left mb-8 md:mb-0">
          <p className="text-[11px] uppercase tracking-widest text-[#475569] font-bold mb-2">Total Expected Revenue</p>
          <div className="text-[52px] font-900 leading-none mb-3 font-black">₦1,275,000</div>
          <p className="text-[13px] text-[#475569] font-medium">Second Term 2025/2026</p>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-[120px] h-[120px]">
            {/* SVG Circle Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#10B981"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' }}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[28px] font-bold text-ink-primary">51%</span>
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-[#475569] font-bold mt-3">Collection Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Collection by Class */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-info/8 text-info rounded-lg">
                <BarChart2 size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-ink-primary">Collection by Class</h2>
            </div>

            <div className="space-y-8">
              {mockClassCollections.map((item, idx) => {
                const isGood = item.rate >= 60;
                const isMedium = item.rate >= 40 && item.rate < 60;
                const colorClass = isGood ? 'text-emerald' : isMedium ? 'text-warning' : 'text-danger';

                return (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-ink-primary">{item.className}</span>
                        <span className="text-[12px] text-[#475569] font-medium">{item.students} students</span>
                      </div>
                      <span className={`font-bold ${colorClass}`}>{item.rate}%</span>
                    </div>
                    <div className="h-[6px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                    <div className="text-[12px] text-[#475569] font-medium">
                      ₦{item.collected.toLocaleString()} <span className="opacity-40 px-1">/</span> ₦{item.expected.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Defaulters Summary */}
          <Card className="p-0 overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-danger/8 text-danger rounded-lg">
                  <XCircle size={20} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-ink-primary">Students Yet To Pay</h2>
                  <p className="text-[13px] text-[#475569]">{stats.unpaidCount} students have not fully settled their fees</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {topDefaulters.map((student) => (
                <div key={student.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="font-semibold text-ink-primary">{student.fullName}</p>
                    <p className="text-[12px] text-[#475569]">{student.className}</p>
                  </div>
                  <p className="font-bold text-danger">₦{student.balance.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="p-6 pt-4">
              <Link
                to="/students?status=unpaid"
                className="flex items-center justify-center w-full py-3 text-[14px] font-bold text-ink-primary bg-white/4 border border-white/8 rounded-xl hover:bg-white/8 transition-colors"
              >
                View All Defaulters
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Term Progress */}
          <Card className="p-6">
            <h2 className="text-[16px] font-bold text-ink-primary mb-8">Term Progress</h2>

            <div className="relative mb-8 pt-2">
              <div className="h-[6px] w-full bg-white/[0.06] rounded-full relative">
                <div className="absolute top-0 left-0 h-full bg-[#3B82F6] rounded-full shadow-[0_0_12px_rgba(59,130,246,0.4)]" style={{ width: '65%' }} />

                {/* Dots */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 bg-emerald border-2 border-[#0F1724] rounded-full" />
                <div className="absolute top-1/2 left-[65%] -translate-y-1/2 w-4 h-4 bg-ink-primary border-2 border-[#0F1724] rounded-full shadow-lg z-10" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 bg-[#334155] border-2 border-[#0F1724] rounded-full" />
              </div>

              <div className="flex justify-between mt-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest">
                <span>Jan 8</span>
                <span>Today</span>
                <span>Apr 4</span>
              </div>
            </div>

            <div className="p-4 bg-warning/8 rounded-2xl border border-warning/12">
              <div className="text-warning-light font-bold text-[15px] mb-1">16 days remaining</div>
              <p className="text-[12px] text-[#475569] leading-relaxed">₦625,000 outstanding with 16 days to go in this term.</p>
            </div>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[16px] font-bold text-ink-primary">Recent Activity</h2>
              <div className="text-[#475569]">
                <Clock size={16} />
              </div>
            </div>

            <div className="relative space-y-6 before:absolute before:inset-0 before:left-[17px] before:w-px before:bg-white/[0.04] before:pointer-events-none">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-white/[0.04] shadow-sm" style={{ backgroundColor: activity.bgColor }}>
                    <activity.icon size={16} style={{ color: activity.color }} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-[14px] text-ink-secondary leading-snug font-medium">
                      {activity.description}
                    </p>
                    <p className="text-[12px] text-[#475569] mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProprietorDashboard
