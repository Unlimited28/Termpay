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
            className="p-2 -ml-2 rounded-lg hover:bg-white/50 text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-surface-border"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
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
