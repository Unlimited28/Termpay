import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  back?: boolean | string
  actions?: React.ReactNode
}

const PageHeader = ({ title, subtitle, back, actions }: PageHeaderProps) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (typeof back === 'string') {
      navigate(back)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-start gap-4">
        {back && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-ink-secondary hover:text-ink-primary transition-all border border-transparent hover:border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-ink-secondary mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}

export default PageHeader
