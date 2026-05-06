import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-ink-muted" />
      </div>
      <h3 className="text-lg font-semibold text-ink-primary mb-1">{title}</h3>
      <p className="text-sm text-ink-secondary max-w-xs mb-6">{description}</p>
      {action && action}
    </div>
  )
}

export default EmptyState
