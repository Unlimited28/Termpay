import { type ReactNode } from 'react'
import { Logo } from '../components/ui'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-base">
      {/* Left Panel - Hidden on mobile */}
      <div
        className="hidden md:flex md:w-[45%] p-12 flex-col justify-between text-ink-primary relative overflow-hidden border-r border-white/5"
        style={{
          background: 'linear-gradient(135deg, #080C14 0%, #0A1929 50%, #080C14 100%)',
        }}
      >
        {/* Ambient Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(16, 185, 129, 0.06) 0%, transparent 60%)' }}
        />

        {/* Decorative Grid */}
        <div className="absolute bottom-12 right-12 grid grid-cols-8 gap-3 pointer-events-none opacity-20">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="w-[3px] h-[3px] rounded-full bg-emerald" />
          ))}
        </div>

        <div className="relative z-10 pt-12">
          <Logo className="text-[32px]" showDot />

          <div className="mt-12">
            <h2 className="text-[30px] font-bold leading-[1.2] max-w-[280px] tracking-tighter text-ink-primary">
              Smart payment tracking for Nigerian schools
            </h2>

            <div className="mt-10 space-y-4">
              {[
                "Auto-match bank transfers to students",
                "Instant WhatsApp receipts to parents",
                "Real-time payment dashboard"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.33333 8.33333L11 1.66667" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[15px] text-ink-secondary group-hover:text-ink-primary transition-colors duration-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] tracking-[0.15em] text-white/20 font-bold uppercase">
            Trusted by Nigerian Private Schools
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[55%] bg-base flex items-center justify-center min-h-screen relative">
        <div className="w-full max-w-sm px-6">
          <div className="md:hidden mb-12">
            <Logo className="text-3xl" showDot />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
