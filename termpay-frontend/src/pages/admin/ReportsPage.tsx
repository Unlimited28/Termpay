import { FileText, AlertCircle, CreditCard } from 'lucide-react'
import { AdminLayout } from '../../layouts'
import { Card, Button } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { mockTerm } from '../../mock/mockData'

const ReportsPage = () => {
  const { toast } = useToast()

  const handleGenerateReport = (reportName: string) => {
    toast.info(`Generating ${reportName}... This would download as PDF in the full version.`)
  }

  const reports = [
    {
      title: 'Term Reconciliation Report',
      description: "Complete breakdown of fee collection for the current term. Shows every student's payment status, amounts collected, and outstanding balances.",
      stats: '15 students · ₦650,000 collected · 51% collection rate',
      icon: FileText,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Defaulters Report',
      description: 'List of all students with outstanding balances sorted by amount owed. Use this to prioritise follow-up and send bulk reminders.',
      stats: '10 students · ₦625,000 outstanding',
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Payment History Report',
      description: 'Complete record of all confirmed payments this term with receipt numbers, dates, and WhatsApp notification status.',
      stats: '7 payments confirmed · ₦650,000 total',
      icon: CreditCard,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[#0F172A]">Reports</h1>
        <p className="text-[13px] text-[#64748B] mt-1">{mockTerm.name} {mockTerm.session}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-12">
        {reports.map((report, i) => (
          <Card key={i} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${report.bgColor} ${report.iconColor}`}>
                <report.icon size={28} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#0F172A] mb-2">{report.title}</h2>
                <p className="text-[14px] text-[#64748B] leading-relaxed max-w-2xl mb-4">
                  {report.description}
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-[12px] font-medium text-slate-600">
                  {report.stats}
                </div>
              </div>
            </div>
            <Button
              className="md:w-auto w-full"
              onClick={() => handleGenerateReport(report.title)}
            >
              Generate Report
            </Button>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-[13px] text-[#94A3B8] italic">
          Full report downloads will be available when TermPay is connected to your school database. Reports will export as PDF and Excel.
        </p>
      </div>
    </AdminLayout>
  )
}

export default ReportsPage
