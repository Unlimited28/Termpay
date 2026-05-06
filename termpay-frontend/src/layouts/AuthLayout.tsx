import { type ReactNode } from 'react'
import { Logo } from '../components/ui'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hidden on mobile */}
      <div
        className="hidden md:flex md:w-[45%] bg-[#0D2137] p-12 flex-col justify-between text-white relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(99, 179, 237, 0.08) 0%, transparent 70%), #0D2137' }}
      >
        <div className="pt-[48px]">
          <div className="flex items-center gap-1.5 font-bold text-[32px] tracking-tight">
            <span className="text-white">Term</span>
            <span style={{ color: '#4CAF50' }}>Pay</span>
          </div>
          <div className="mt-[32px]">
            <h2 className="text-[28px] font-700 leading-[1.3] max-w-[260px] font-bold">
              Smart payment tracking for Nigerian schools
            </h2>

            <div className="mt-[40px] space-y-[16px]">
              {[
                "Auto-match bank transfers to students",
                "Instant WhatsApp receipts to parents",
                "Real-time payment dashboard"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-[12px]">
                  <div className="w-[20px] h-[20px] rounded-full bg-[#4CAF50]/20 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.33333 8.33333L11 1.66667" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[15px] text-slate-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-[32px]">
          <p className="text-xs tracking-[0.2em] text-slate-400 font-bold uppercase">
            Trusted by Nigerian Private Schools
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[55%] bg-white flex items-center justify-center min-h-screen relative overflow-hidden">
        {/* Background Decoration */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none -mr-48 -mt-48"
          style={{ background: '#000000' }}
        />

        <div className="w-full max-w-[380px] p-[48px]">
          <div className="md:hidden mb-8">
            <Logo className="text-2xl" />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
