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
  User, 
  Building2, 
  ArrowRight, 
  Users,
  Zap,
  Shield,
  Check,
  CheckCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { VideoBackground } from '@/components/shared/video-background'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { TermsOfServiceModal, PrivacyPolicyModal } from '@/components/legal'

/**
 * Signup Page with Supabase Authentication
 * 
 * Features:
 * - Email/Password signup with user metadata
 * - Google OAuth signup
 * - Password strength indicator
 * - Form validation
 * - Loading states
 * - Error/Success messages
 * - Email verification flow
 * - Terms & Privacy Policy acceptance
 */

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  companyName: z.string().optional(),
})

type SignupFormData = z.infer<typeof signupSchema>


// Stats card component
function StatsCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02]">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  )
}

// Feature list item
function FeatureItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3 text-white/80">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm">{text}</span>
    </div>
  )
}

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const requirements = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Lowercase', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
  ]

  const strengthCount = requirements.filter(r => r.met).length
  
  const getStrengthColor = (index: number) => {
    if (index >= strengthCount) return 'bg-white/10'
    if (strengthCount <= 1) return 'bg-red-500'
    if (strengthCount <= 2) return 'bg-orange-500'
    if (strengthCount <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              getStrengthColor(i)
            )}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req, i) => (
          <div 
            key={i}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors duration-200",
              req.met ? "text-green-400" : "text-gray-500"
            )}
          >
            <Check className={cn("w-3 h-3", req.met ? "opacity-100" : "opacity-40")} />
            {req.label}
          </div>
        ))}
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

// Terms Checkbox Component
function TermsCheckbox({ 
  checked, 
  onChange, 
  onTermsClick, 
  onPrivacyClick,
  hasError 
}: { 
  checked: boolean
  onChange: (checked: boolean) => void
  onTermsClick: () => void
  onPrivacyClick: () => void
  hasError: boolean
}) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
      hasError && "bg-red-500/10 border border-red-500/20 animate-shake"
    )}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
          checked 
            ? "bg-purple-600 border-purple-600" 
            : "border-gray-500 hover:border-purple-400",
          hasError && !checked && "border-red-500"
        )}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </button>
      <label className="text-sm text-gray-400 leading-relaxed">
        I agree to the{' '}
        <button
          type="button"
          onClick={onTermsClick}
          className="text-purple-400 hover:text-purple-300 font-medium underline-offset-2 hover:underline transition-colors"
        >
          Terms of Service
        </button>
        {' '}and{' '}
        <button
          type="button"
          onClick={onPrivacyClick}
          className="text-purple-400 hover:text-purple-300 font-medium underline-offset-2 hover:underline transition-colors"
        >
          Privacy Policy
        </button>
      </label>
    </div>
  )
}

// Email Verification Success View
function VerificationSuccess({ email }: { email: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[#0a0a0f] relative">
      <div className="w-full max-w-sm text-center">
        <Logo className="mx-auto mb-8" size="lg" />
        
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Check Your Email!</h2>
          <p className="text-gray-400 text-sm mb-4">
            We've sent a verification link to:
          </p>
          <p className="text-white font-medium mb-4">{email}</p>
          <p className="text-gray-500 text-xs">
            Click the link in your email to verify your account and start using Welcomely.
          </p>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Didn't receive the email?{' '}
          <button className="text-purple-400 hover:text-purple-300">
            Resend verification
          </button>
        </p>

        <Link
          to="/login"
          className="inline-block mt-4 text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  )
}

export function SignupPage() {
  const navigate = useNavigate()
  const { signup, signInWithGoogle, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  
  // Terms acceptance state
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)
  
  // Legal modals state
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch('password', '')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Clear terms error when checkbox is checked
  useEffect(() => {
    if (termsAccepted) {
      setShowTermsError(false)
    }
  }, [termsAccepted])

  /**
   * Handle Email/Password Signup
   * Creates user with metadata and potentially requires email verification
   */
  const onSubmit = useCallback(async (data: SignupFormData) => {
    // Check if terms are accepted
    if (!termsAccepted) {
      setShowTermsError(true)
      setError('Please accept the Terms of Service and Privacy Policy to continue.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    console.log('[Signup] Attempting signup for:', data.email)

    const { error, needsVerification } = await signup(
      data.email,
      data.password,
      data.fullName,
      data.companyName
    )

    setIsSubmitting(false)

    if (error) {
      setError(error.message)
    } else if (needsVerification) {
      // Show verification success screen
      setVerificationEmail(data.email)
    } else {
      // Auto-confirm enabled - redirect to dashboard
      navigate('/dashboard')
    }
  }, [signup, navigate, termsAccepted])

  /**
   * Handle Google OAuth Signup
   */
  const handleGoogleSignUp = useCallback(async () => {
    // Check if terms are accepted for Google signup too
    if (!termsAccepted) {
      setShowTermsError(true)
      setError('Please accept the Terms of Service and Privacy Policy to continue.')
      return
    }

    setIsGoogleLoading(true)
    setError(null)

    console.log('[Signup] Initiating Google OAuth')

    const { error } = await signInWithGoogle()

    if (error) {
      setIsGoogleLoading(false)
      setError(error.message)
    }
  }, [signInWithGoogle, termsAccepted])

  // Show verification success screen
  if (verificationEmail) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <VideoBackground overlayOpacity={0.5} />
          <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
            <div className="max-w-md">
              <Logo className="mb-10" size="lg" />
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Welcome to
                <br />
                <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                  Welcomely!
                </span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                You're just one step away from creating amazing onboarding experiences.
              </p>
            </div>
          </div>
        </div>
        <VerificationSuccess email={verificationEmail} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Video Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <VideoBackground overlayOpacity={0.5} />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
          <div className="max-w-md">
            <Logo className="mb-10" size="lg" />
            
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Start Your
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Onboarding Journey
              </span>
            </h1>
            
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Join thousands of companies creating seamless onboarding 
              experiences with intelligent workflows.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatsCard value="10k+" label="Active Users" />
              <StatsCard value="50k+" label="Checklists Created" />
              <StatsCard value="99%" label="Satisfaction Rate" />
              <StatsCard value="24/7" label="Support Available" />
            </div>
            
            <div className="space-y-3">
              <FeatureItem icon={Users} text="Collaborate with unlimited team members" />
              <FeatureItem icon={Zap} text="Automate repetitive onboarding tasks" />
              <FeatureItem icon={Shield} text="Enterprise-grade security" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[#0a0a0f] relative overflow-y-auto">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        
        <div className="absolute top-4 left-4 lg:hidden">
          <Logo size="sm" />
        </div>
        
        <div className="w-full max-w-sm py-8">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm">
              Enter your details to get started with Welcomely
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20 animate-in fade-in duration-300">
                {error}
              </div>
            )}

            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300 text-sm font-medium">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                  disabled={isSubmitting || isGoogleLoading}
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
                  {errors.fullName.message}
                </p>
              )}
            </div>

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
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
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

            {/* Company Name Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-gray-300 text-sm font-medium">
                Company Name <span className="text-gray-500">(Optional)</span>
              </Label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Acme Inc."
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                  disabled={isSubmitting || isGoogleLoading}
                  {...register('companyName')}
                />
              </div>
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
                  className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
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
              
              {/* Password Strength Indicator */}
              <PasswordStrength password={password} />
            </div>

            {/* Terms Checkbox */}
            <TermsCheckbox
              checked={termsAccepted}
              onChange={setTermsAccepted}
              onTermsClick={() => setShowTermsModal(true)}
              onPrivacyClick={() => setShowPrivacyModal(true)}
              hasError={showTermsError}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              className={cn(
                "w-full h-11 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium transition-all duration-300",
                termsAccepted 
                  ? "hover:from-purple-500 hover:to-violet-500 hover:shadow-lg hover:shadow-purple-500/25" 
                  : "opacity-50 cursor-not-allowed"
              )}
              disabled={isSubmitting || isGoogleLoading}
              title={!termsAccepted ? 'Please accept the Terms of Service and Privacy Policy' : undefined}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0f] px-3 text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full h-11 bg-white/5 border-white/10 text-white transition-all duration-300",
                termsAccepted 
                  ? "hover:bg-white/10 hover:border-white/20" 
                  : "opacity-50 cursor-not-allowed"
              )}
              onClick={handleGoogleSignUp}
              disabled={isSubmitting || isGoogleLoading}
              title={!termsAccepted ? 'Please accept the Terms of Service and Privacy Policy' : undefined}
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <GoogleIcon />
                  Sign up with Google
                </>
              )}
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-gray-400 text-sm mt-4">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Legal Modals */}
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setTermsAccepted(true)}
        showAcceptButton={!termsAccepted}
      />
      
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => setTermsAccepted(true)}
        showAcceptButton={!termsAccepted}
      />
    </div>
  )
}
