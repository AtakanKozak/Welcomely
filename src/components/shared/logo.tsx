import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Welcomely Logo - W with checkmarks and connection points
function WelcomelyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="welcomely-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="welcomely-gradient-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Left V of the W - Purple side */}
      <path
        d="M10 20 L25 75 L40 45"
        stroke="url(#welcomely-gradient)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Right V of the W with checkmark integration - Cyan side */}
      <path
        d="M40 45 L55 75 L75 30"
        stroke="url(#welcomely-gradient-2)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Connection line going up with nodes */}
      <path
        d="M75 30 L85 15"
        stroke="#22D3EE"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      
      {/* Top connection node */}
      <circle
        cx="85"
        cy="12"
        r="5"
        fill="none"
        stroke="#22D3EE"
        strokeWidth="3"
        filter="url(#glow)"
      />
      
      {/* Second connection line */}
      <path
        d="M70 40 L80 30"
        stroke="#06B6D4"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      
      {/* Second node */}
      <circle
        cx="82"
        cy="28"
        r="4"
        fill="none"
        stroke="#06B6D4"
        strokeWidth="2.5"
        opacity="0.8"
      />
      
      {/* Small accent at the tip */}
      <path
        d="M55 78 L58 85"
        stroke="#22D3EE"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <WelcomelyIcon className={cn(sizes[size])} />
      </div>
      {showText && (
        <span className={cn(
          'font-bold bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent',
          textSizes[size]
        )}>
          Welcomely
        </span>
      )}
    </div>
  )
}

// Export icon separately for favicon/small uses
export { WelcomelyIcon }
