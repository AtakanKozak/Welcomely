import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Check, ArrowRight, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/shared/logo'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

/**
 * Reset Password Page
 * 
 * Users arrive here after clicking the password reset link in their email.
 * They can enter a new password to update their account.
 */

// Password strength indicator component
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

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const updatePassword = useAuthStore((state) => state.updatePassword)
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Password validation
  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }
  
  const isPasswordStrong = Object.values(passwordStrength).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!isPasswordStrong) {
      setError('Please meet all password requirements.')
      return
    }
    
    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    console.log('[Reset Password] Submitting new password')
    
    const { error } = await updatePassword(password)

    if (error) {
      setError(error.message)
      setIsSubmitting(false)
    } else {
      setSuccess(true)
      // Clear password fields for security
      setPassword('')
      setConfirmPassword('')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    }
  }, [password, confirmPassword, isPasswordStrong, passwordsMatch, updatePassword, navigate])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-6">
        <div className="w-full max-w-sm text-center">
          <Logo className="mx-auto mb-8" size="lg" />
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Password Updated!</h2>
            <p className="text-gray-400 text-sm mb-4">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <p className="text-gray-500 text-xs">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-6" size="lg" />
          <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
          <p className="text-gray-400 text-sm">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20 animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
              New Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password Strength */}
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300",
                  confirmPassword && !passwordsMatch && "border-red-500/50 focus:border-red-500"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
                Passwords do not match
              </p>
            )}
            {passwordsMatch && (
              <p className="text-sm text-green-400 animate-in slide-in-from-top-1 duration-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !isPasswordStrong || !passwordsMatch}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating password...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                Update Password
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-gray-400 text-sm mt-6">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

