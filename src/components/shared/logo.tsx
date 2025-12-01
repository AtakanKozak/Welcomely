import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg" />
        <div className="relative bg-gradient-to-br from-primary to-purple-600 rounded-lg p-1.5">
          <CheckCircle2 className={cn('text-white', sizes[size])} />
        </div>
      </div>
      {showText && (
        <span className={cn('font-bold gradient-text', textSizes[size])}>
          Welcomely
        </span>
      )}
    </div>
  )
}

