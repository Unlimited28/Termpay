import { useNavigate, Link } from 'react-router-dom'
import {
  BarChart2,
  XCircle,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Clock,
  CheckCircle,
  FileText,
  CreditCard,
  MessageSquare,
  UserPlus,
  Upload
} from 'lucide-react'
import { Card, Button } from '../../../components/ui'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { mockTerm } from '../../../mock/mockData'

const mockClassCollections = [
  { className: 'Primary 2', students: 3, collected: 85000, expected: 255000, rate: 33 },
  { className: 'Primary 3', students: 3, collected: 95000, expected: 285000, rate: 33 },
  { className: 'Nursery 1', students: 3, collected: 150000, expected: 225000, rate: 67 },
  { className: 'Nursery 2', students: 3, collected: 150000, expected: 225000, rate: 67 },
  { className: 'Primary 1', students: 3, collected: 170000, expected: 255000, rate: 67 },
]

const recentActivity = [
  { id: 1, type: 'payment', description: '6 payments confirmed from GTBank statement', time: '2 hours ago', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
  { id: 2, type: 'upload', description: 'Bank statement uploaded by Mrs. Adeyemi', time: '2 hours ago', icon: Upload, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { id: 3, type: 'reminder', description: 'Reminders sent to 5 parents', time: 'Yesterday', icon: MessageSquare, color: 'text-slate-500', bgColor: 'bg-slate-50' },
  { id: 4, type: 'payment', description: '7 payments confirmed from GTBank statement', time: '3 days ago', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
  { id: 5, type: 'student', description: '1 new student added', time: '5 days ago', icon: UserPlus, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { id: 6, type: 'upload', description: 'Bank statement uploaded', time: '5 days ago', icon: Upload, color: 'text-slate-500', bgColor: 'bg-slate-50' },
]

const ProprietorDashboard = () => {
  const navigate = useNavigate()
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#0F172A] leading-tight">{getGreeting()}</h1>
        <p className="text-[16px] text-[#64748B] mt-1">Here is how Yomfield is performing this term.</p>
      </div>

      {/* Hero Section */}
      <div
        className="rounded-[24px] p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D2137 0%, #0A1929 100%)' }}
      >
        <div className="z-10 text-center md:text-left mb-8 md:mb-0">
          <p className="text-[12px] uppercase tracking-[0.1em] text-white/60 font-bold mb-2">Total Expected Revenue</p>
          <div className="text-[52px] font-900 leading-none mb-3">₦1,275,000</div>
          <p className="text-[13px] text-white/50 font-medium">Second Term 2025/2026</p>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-[120px] h-[120px]">
            {/* SVG Circle Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#4CAF50"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[28px] font-800">51%</span>
            </div>
          </div>
          <p className="text-[12px] uppercase tracking-wider text-white/60 font-bold mt-3">Collection Rate</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-50px] left-[-20%] w-[60%] h-32 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8">
          <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Total Collected</p>
          <div className="flex items-end gap-3">
            <span className="text-[36px] font-800 text-brand-green leading-tight">₦650,000</span>
            <div className="flex items-center text-brand-green mb-2">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-[14px] font-bold">+12%</span>
            </div>
          </div>
        </Card>
        <Card className="p-8">
          <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Outstanding</p>
          <div className="flex items-end gap-3">
            <span className="text-[36px] font-800 text-brand-red leading-tight">₦625,000</span>
            <div className="flex items-center text-brand-red mb-2">
              <AlertCircle size={16} className="mr-1" />
              <span className="text-[14px] font-bold">Action Needed</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Collection by Class */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
                <BarChart2 size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-[#0F172A]">Collection by Class</h2>
            </div>

            <div className="space-y-8">
              {mockClassCollections.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-600 text-[#0F172A]">{item.className}</span>
                      <span className="ml-2 text-[13px] text-[#94A3B8]">{item.students} students</span>
                    </div>
                    <span className="font-700 text-[#0F172A]">{item.rate}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-green rounded-full transition-all duration-1000"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                  <div className="text-[12px] text-[#94A3B8]">
                    ₦{item.collected.toLocaleString()} <span className="text-[#CBD5E1]">of</span> ₦{item.expected.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Defaulters Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 text-brand-red rounded-lg">
                  <XCircle size={20} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#0F172A]">Students Yet To Pay</h2>
                  <p className="text-[13px] text-[#64748B]">{stats.unpaidCount} students have not fully settled their fees</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {topDefaulters.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-600 text-[#0F172A]">{student.fullName}</p>
                    <p className="text-[12px] text-[#94A3B8]">{student.className}</p>
                  </div>
                  <p className="font-700 text-brand-red">₦{student.balance.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <Link
              to="/students?status=unpaid"
              className="flex items-center justify-center w-full py-3 text-[14px] font-bold text-brand-blue bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              View All Defaulters
            </Link>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Term Progress */}
          <Card className="p-6">
            <h2 className="text-[16px] font-bold text-[#0F172A] mb-6">Term Progress</h2>

            <div className="relative mb-8 pt-2">
              <div className="h-1.5 w-full bg-slate-100 rounded-full relative">
                <div className="absolute top-0 left-0 h-full bg-brand-blue rounded-full" style={{ width: '65%' }} />

                {/* Dots */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 bg-brand-green border-2 border-white rounded-full shadow-sm" />
                <div className="absolute top-1/2 left-[65%] -translate-y-1/2 w-4 h-4 bg-navy border-2 border-white rounded-full shadow-md z-10" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 bg-slate-300 border-2 border-white rounded-full shadow-sm" />
              </div>

              <div className="flex justify-between mt-4 text-[11px] font-bold text-[#94A3B8] uppercase tracking-tighter">
                <span>Jan 8</span>
                <span>Today (Mar 19)</span>
                <span>Apr 4</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-4">
              <div className="text-amber-700 font-700 text-[16px] mb-1">16 days remaining</div>
              <p className="text-[13px] text-amber-600/80">₦625,000 outstanding with 16 days to go</p>
            </div>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-bold text-[#0F172A]">Recent Activity</h2>
              <div className="p-1.5 bg-slate-50 text-slate-400 rounded-md">
                <Clock size={16} />
              </div>
            </div>

            <div className="relative space-y-6 before:absolute before:inset-0 before:left-[18px] before:w-px before:bg-slate-100 before:pointer-events-none">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className={`z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${activity.bgColor} ${activity.color} shadow-sm border border-white`}>
                    <activity.icon size={16} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-[14px] text-[#0F172A] leading-snug font-medium">{activity.description}</p>
                    <p className="text-[12px] text-[#94A3B8] mt-1">{activity.time}</p>
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
