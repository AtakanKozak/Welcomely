import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2,
  BarChart3,
  Repeat2,
  Sparkles,
  X,
  CheckCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

/**
 * Login Page with Supabase Authentication
 * 
 * Features:
 * - Email/Password login
 * - Google OAuth login
 * - Forgot password functionality
 * - Form validation
 * - Loading states
 * - Error/Success messages
 * 
 * Supabase Integration Points:
 * - supabase.auth.signInWithPassword() for email/password
 * - supabase.auth.signInWithOAuth() for Google
 * - supabase.auth.resetPasswordForEmail() for password reset
 */

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

// Animated particle component
function Particle({ delay, duration, size, left, top }: { 
  delay: number
  duration: number
  size: number
  left: number
  top: number 
}) {
  return (
    <div
      className="absolute rounded-full bg-white/20 animate-pulse"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

// Animated stars background
function AnimatedBackground() {
  const [particles, setParticles] = useState<Array<{
    id: number
    delay: number
    duration: number
    size: number
    left: number
    top: number
  }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 1 + Math.random() * 3,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-purple-800/80 to-indigo-900/90" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '12s', animationDelay: '1s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {particles.map((particle) => (
        <Particle key={particle.id} {...particle} />
      ))}
    </div>
  )
}

// Feature card component
function FeatureCard({ icon: Icon, title, className }: { 
  icon: React.ElementType
  title: string
  className?: string 
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02]",
      className
    )}>
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-white font-medium text-sm">{title}</span>
    </div>
  )
}

// Forgot Password Modal
function ForgotPasswordModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const resetPassword = useAuthStore((state) => state.resetPassword)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError(null)

    console.log('[Login] Sending password reset email to:', email)
    
    const { error } = await resetPassword(email)

    setIsSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      // Auto close after 5 seconds
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setEmail('')
      }, 5000)
    }
  }

  // Clear state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#0f1419] border border-white/10 rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
            <p className="text-gray-400 text-sm">
              We've sent a password reset link to <span className="text-white">{email}</span>.
              Click the link in your email to reset your password.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
            <p className="text-gray-400 text-sm mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-300 text-sm font-medium">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// Google Icon SVG
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, signInWithGoogle, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, successMessage])

  /**
   * Handle Email/Password Login
   */
  const onSubmit = useCallback(async (data: LoginFormData) => {
    setIsSubmitting(true)
    setError(null)

    console.log('[Login] Attempting email/password login:', data.email)

    const { error, needsVerification } = await login(data.email, data.password)

    setIsSubmitting(false)

    if (needsVerification) {
      setSuccessMessage('Please check your email to verify your account before signing in.')
      return
    }

    if (error) {
      setError(error.message)
    } else {
      setSuccessMessage('Welcome back!')
      // Redirect handled by useEffect when isAuthenticated changes
    }
  }, [login])

  /**
   * Handle Google OAuth Login
   * 
   * TODO: Ensure Google OAuth is configured in Supabase Dashboard:
   * 1. Go to Authentication → Providers → Google
   * 2. Enable Google provider
   * 3. Add your Google OAuth Client ID and Secret
   * 4. Add redirect URL to Google Cloud Console
   */
  const handleGoogleSignIn = useCallback(async () => {
    setIsGoogleLoading(true)
    setError(null)

    console.log('[Login] Initiating Google OAuth')

    const { error } = await signInWithGoogle()

    // Note: If successful, user will be redirected to Google
    // If there's an error, we show it here
    if (error) {
      setIsGoogleLoading(false)
      setError(error.message)
    }
    // Don't set loading to false on success - user is being redirected
  }, [signInWithGoogle])

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AnimatedBackground />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
          <div className="max-w-md">
            <Logo className="mb-10" size="lg" />
            
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Onboarding Universe
              </span>
            </h1>
            
            <p className="text-lg text-white/70 mb-10 leading-relaxed">
              Join thousands of companies creating seamless onboarding experiences 
              with intelligent workflows and automated task management.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard icon={CheckCircle2} title="Smart Checklists" />
              <FeatureCard icon={BarChart3} title="Real-time Analytics" />
              <FeatureCard icon={Sparkles} title="AI Suggestions" />
              <FeatureCard icon={Repeat2} title="Collaborative Workflows" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[#0a0a0f] relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        
        <div className="absolute top-4 left-4 lg:hidden">
          <Logo size="sm" />
        </div>
        
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Access Your Future</h2>
            <p className="text-gray-400 text-sm">
              Enter your details to get started with Welcomely
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20 animate-in fade-in duration-300">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 text-sm text-green-400 bg-green-500/10 rounded-lg border border-green-500/20 animate-in fade-in duration-300">
                {successMessage}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                  disabled={isSubmitting || isGoogleLoading}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                  disabled={isSubmitting || isGoogleLoading}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isGoogleLoading}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0f] px-3 text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <GoogleIcon />
                  Sign in with Google
                </>
              )}
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-gray-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  )
}
