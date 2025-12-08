import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/shared/logo'

/**
 * OAuth Callback Handler
 * 
 * This page handles the redirect from OAuth providers (Google, etc.)
 * and email verification links.
 * 
 * Flow:
 * 1. User clicks "Sign in with Google" or email verification link
 * 2. They're redirected to provider/email link
 * 3. After success, they're redirected here with auth tokens
 * 4. We exchange tokens for session and redirect to dashboard
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('[Auth Callback] Processing auth callback...')
      
      try {
        // Get the auth code from URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Auth Callback] Error:', error)
          setError(error.message)
          return
        }

        if (data.session) {
          console.log('[Auth Callback] Session established:', data.session.user.email)
          
          // Check if this is a new OAuth user - create profile if needed
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.session.user.id)
            .single()

          if (!profile) {
            console.log('[Auth Callback] Creating profile for new OAuth user')
            
            // Get user metadata
            const metadata = data.session.user.user_metadata
            
            await supabase.from('profiles').insert({
              id: data.session.user.id,
              email: data.session.user.email!,
              full_name: metadata?.full_name || metadata?.name || 'User',
              avatar_url: metadata?.avatar_url || metadata?.picture,
              role: 'admin',
              plan_type: 'free',
            })
          }

          // Redirect to dashboard
          navigate('/dashboard', { replace: true })
        } else {
          console.log('[Auth Callback] No session found')
          setError('Authentication failed. Please try again.')
        }
      } catch (err) {
        console.error('[Auth Callback] Exception:', err)
        setError('An error occurred during authentication.')
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-6">
        <div className="text-center">
          <Logo className="mx-auto mb-6" size="lg" />
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Authentication Error</h2>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 text-purple-400 hover:text-purple-300 text-sm"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-6">
      <div className="text-center">
        <Logo className="mx-auto mb-6" size="lg" />
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-gray-400">Completing sign in...</span>
        </div>
      </div>
    </div>
  )
}

