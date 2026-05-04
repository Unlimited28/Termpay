import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CloudUpload,
  CheckCircle,
  Loader2,
  Eye,
  FileText
} from 'lucide-react'
import { AdminLayout } from '../../layouts'
import { PageHeader, Card, Button, Badge } from '../../components/ui'
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
      <PageHeader
        title="Bank Statements"
        subtitle="Upload CSV/PDF statements to match payments"
      />

      <Card className="mb-8 p-0 overflow-hidden">
        <div className="min-h-[320px] flex items-center justify-center p-8 bg-white">
          {!isUploading ? (
            <div
              className="w-full max-w-xl flex flex-col items-center justify-center p-12 border-2 border-dashed border-surface-border rounded-2xl hover:border-brand-blue hover:bg-blue-50/30 transition-all cursor-pointer group"
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-brand-blue/10 group-hover:scale-110 transition-all duration-300">
                <CloudUpload size={48} className="text-text-disabled group-hover:text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Drop your bank statement here</h3>
              <p className="text-text-secondary mb-6 text-center max-w-xs">
                Upload your bank statement in CSV or PDF format to auto-match student fees.
              </p>
              <Button type="button">
                Browse Files
              </Button>
              <p className="mt-8 text-xs text-text-disabled font-medium uppercase tracking-widest">
                Supported: GTBank · Access · Zenith · First Bank · UBA
              </p>
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
      </Card>

      {/* Upload History */}
      <Card title="Previous Uploads" subtitle="View and review past statement matches">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4 text-center">Transactions</th>
                <th className="px-6 py-4 text-center">Matched</th>
                <th className="px-6 py-4 text-center">Needs Review</th>
                <th className="px-6 py-4 text-center">Unmatched</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {mockStatementUploads.map((upload) => (
                <tr key={upload.id} className="text-sm hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-text-secondary">{upload.uploadDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-brand-blue" />
                      <span className="font-medium text-text-primary">{upload.fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">{upload.totalTransactions}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-brand-green font-bold">{upload.matched}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-brand-amber font-bold">{upload.needsReview}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-brand-red font-bold">{upload.unmatched}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={upload.status === 'ready' ? 'success' : 'warning'}>
                      {upload.status === 'ready' ? 'Ready' : 'Processing'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/bank-statements/${upload.id}`)}>
                      <Eye size={16} className="mr-2" />
                      View
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

export default BankStatementsPage
