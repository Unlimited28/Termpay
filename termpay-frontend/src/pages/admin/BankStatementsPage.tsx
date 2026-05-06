import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CloudUpload,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { AdminLayout } from '../../layouts'
import { Card, Button, Badge } from '../../components/ui'
import { mockStatementUploads } from '../../mock/mockData'

const BankStatementsPage = () => {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStep, setUploadStep] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { label: 'Uploading file...', duration: 800 },
    { label: 'Parsing transactions...', duration: 1500 },
    { label: 'Running matching engine...', duration: 2000 },
    { label: 'Complete!', duration: 0 }
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startUploadAnimation()
    }
  }

  const startUploadAnimation = async () => {
    setIsUploading(true)

    for (let i = 0; i < steps.length; i++) {
      setUploadStep(i)
      if (steps[i].duration > 0) {
        await new Promise(resolve => setTimeout(resolve, steps[i].duration))
      }
    }

    // Small delay before navigation
    setTimeout(() => {
      navigate('/bank-statements/u1')
    }, 500)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Bank Statements</h1>
          <p className="text-[14px] text-[#64748B]">Upload CSV/PDF statements to match payments</p>
        </div>
      </div>

      <div className="mb-8">
        {!isUploading ? (
          <div
            className="w-full min-h-[220px] flex flex-col items-center justify-center border-2 border-dashed border-[#CBD5E1] rounded-[20px] cursor-pointer group transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1565C0';
              e.currentTarget.style.background = 'linear-gradient(135deg, #F9FBFE 0%, #F3F7FA 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)';
            }}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
            <CloudUpload size={56} className="text-[#94A3B8] mb-4" />
            <h3 className="text-[20px] font-semibold text-[#0F172A]">Drop your bank statement here</h3>
            <p className="text-[14px] text-[#64748B] mt-1 text-center px-4">
              Supports CSV and PDF from GTBank, Access, Zenith, First Bank and UBA
            </p>
            <Button
              type="button"
              variant="secondary"
              className="h-[44px] rounded-[10px] mt-[16px] border-[#E2E8F0]"
            >
              Browse Files
            </Button>
          </div>
          ) : (
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-text-primary">Processing Statement</h3>
                <p className="text-sm text-text-secondary mt-1">Please wait while we analyze your data</p>
              </div>

              <div className="space-y-6">
                {steps.map((step, i) => {
                  const isCompleted = uploadStep > i || (uploadStep === 3 && i === 3)
                  const isActive = uploadStep === i && i < 3
                  const isPending = uploadStep < i

                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                        ${isCompleted ? 'bg-brand-green text-white' : ''}
                        ${isActive ? 'bg-navy text-white ring-4 ring-navy/10' : ''}
                        ${isPending ? 'bg-slate-100 text-text-disabled' : ''}
                      `}>
                        {isCompleted ? (
                          <CheckCircle size={18} />
                        ) : isActive ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <span className="text-sm font-bold">{i + 1}</span>
                        )}
                      </div>
                      <span className={`
                        font-medium transition-colors duration-300
                        ${isCompleted ? 'text-brand-green' : ''}
                        ${isActive ? 'text-text-primary' : ''}
                        ${isPending ? 'text-text-disabled' : ''}
                      `}>
                        {step.label}
                      </span>
                      {isCompleted && (
                        <div className="ml-auto animate-in fade-in slide-in-from-left-2">
                          <CheckCircle size={16} className="text-brand-green" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
      </div>

      {/* Upload History */}
      <Card title="Previous Uploads" subtitle="View and review past statement matches">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4 text-center">Matched</th>
                <th className="px-6 py-4 text-center">Unmatched</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockStatementUploads.map((upload) => (
                <tr key={upload.id} className="group transition-colors">
                  <td className="px-6 py-4 text-[#64748B]">{upload.uploadDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-[6px] h-[6px] rounded-full ${upload.status === 'ready' ? 'bg-[#4CAF50]' : 'bg-[#E65100]'}`} />
                      <span className="font-medium text-[#0F172A]">{upload.fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[#2E7D32] font-semibold">{upload.matched}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[#B71C1C] font-semibold">{upload.unmatched}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge
                      variant={upload.status === 'ready' ? 'success' : 'warning'}
                      className="text-[10px] uppercase"
                    >
                      {upload.status === 'ready' ? 'Ready' : 'Processing'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-[13px] border-[#E2E8F0] hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                      onClick={() => navigate(`/bank-statements/${upload.id}`)}
                    >
                      Review →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 -mx-2">
          {mockStatementUploads.map((upload) => (
            <div key={upload.id} className="bg-[#F8FAFC] p-4 rounded-xl space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-[6px] h-[6px] rounded-full ${upload.status === 'ready' ? 'bg-[#4CAF50]' : 'bg-[#E65100]'}`} />
                  <span className="font-bold text-[#0F172A] text-sm truncate">{upload.fileName}</span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">{upload.uploadDate}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                  <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Matched</p>
                  <p className="text-sm font-bold text-[#2E7D32]">{upload.matched}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                  <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Unmatched</p>
                  <p className="text-sm font-bold text-[#B71C1C]">{upload.unmatched}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                <Badge
                  variant={upload.status === 'ready' ? 'success' : 'warning'}
                  className="text-[10px] uppercase"
                >
                  {upload.status === 'ready' ? 'Ready' : 'Processing'}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs h-8 px-4"
                  onClick={() => navigate(`/bank-statements/${upload.id}`)}
                >
                  Review →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  )
}

export default BankStatementsPage
