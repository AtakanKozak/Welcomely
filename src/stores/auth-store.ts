import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'
import { clearWorkspaceCache } from '@/lib/workspace'

/**
 * Supabase Dashboard Configuration Required:
 * 
 * 1. Authentication → Providers → Enable Google OAuth
 *    - Add Google Client ID and Secret from Google Cloud Console
 *    - Configure OAuth consent screen in Google Cloud
 * 
 * 2. Authentication → URL Configuration → Add redirect URLs:
 *    - http://localhost:5173/auth/callback (development)
 *    - https://yourdomain.com/auth/callback (production)
 *    - https://yourdomain.com/reset-password (for password reset)
 * 
 * 3. Authentication → Email Templates → Customize if needed
 *    - Confirm signup email
 *    - Reset password email
 *    - Magic link email
 * 
 * 4. Authentication → Policies → Set up RLS policies
 */

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isInitialized: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<{ error: Error | null; needsVerification?: boolean }>
  signup: (email: string, password: string, fullName: string, companyName?: string) => Promise<{ error: Error | null; needsVerification?: boolean }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  initialize: () => Promise<void>
}

/**
 * Parse Supabase auth errors into user-friendly messages
 */
function parseAuthError(error: Error): string {
  const message = error.message.toLowerCase()
  
  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return 'Invalid email or password. Please try again.'
  }
  if (message.includes('email not confirmed')) {
    return 'Please verify your email before signing in.'
  }
  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'This email is already registered. Try signing in instead.'
  }
  if (message.includes('password') && message.includes('weak')) {
    return 'Password is too weak. Use at least 8 characters with uppercase, lowercase, and numbers.'
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your internet connection.'
  }
  if (message.includes('email')) {
    return 'Please enter a valid email address.'
  }
  
  // Return original message if no match
  return error.message || 'An unexpected error occurred. Please try again.'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      isInitialized: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),

      /**
       * Email/Password Sign In
       * Uses Supabase signInWithPassword method
       */
      login: async (email, password) => {
        set({ isLoading: true })
        console.log('[Auth] Attempting login for:', email)
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            console.error('[Auth] Login error:', error)
            throw new Error(parseAuthError(error))
          }

          // Check if email is verified (for email confirmation flow)
          if (data.user && !data.user.email_confirmed_at) {
            console.log('[Auth] Email not verified')
            return { error: null, needsVerification: true }
          }

          console.log('[Auth] Login successful:', data.user?.email)
          set({ user: data.user, isAuthenticated: true })
          await get().fetchProfile()
          return { error: null }
        } catch (error) {
          console.error('[Auth] Login exception:', error)
          return { error: error as Error }
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * Email/Password Sign Up
       * Creates new user with metadata and profile
       */
      signup: async (email, password, fullName, companyName) => {
        set({ isLoading: true })
        console.log('[Auth] Attempting signup for:', email)
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                company_name: companyName,
              },
              // Redirect URL after email verification
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            console.error('[Auth] Signup error:', error)
            throw new Error(parseAuthError(error))
          }

          // Check if email confirmation is required
          if (data.user && !data.session) {
            console.log('[Auth] Signup successful - email verification required')
            return { error: null, needsVerification: true }
          }

          // If auto-confirm is enabled, user is logged in immediately
          if (data.user && data.session) {
            console.log('[Auth] Signup successful - auto confirmed')
            
            // Create profile after signup
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                full_name: fullName,
                company_name: companyName,
                role: 'admin',
                plan_type: 'free',
              })

            if (profileError) {
              console.error('[Auth] Error creating profile:', profileError)
              // Don't fail signup if profile creation fails
            }

            set({ user: data.user, isAuthenticated: true })
            await get().fetchProfile()
          }

          return { error: null }
        } catch (error) {
          console.error('[Auth] Signup exception:', error)
          return { error: error as Error }
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * Google OAuth Sign In
       * Initiates OAuth flow with Google provider
       * 
       * TODO: Configure in Supabase Dashboard:
       * 1. Enable Google provider in Authentication → Providers
       * 2. Add Google OAuth credentials (Client ID & Secret)
       * 3. Add redirect URL to allowed list
       */
      signInWithGoogle: async () => {
        console.log('[Auth] Initiating Google OAuth')
        
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          })

          if (error) {
            console.error('[Auth] Google OAuth error:', error)
            throw new Error(parseAuthError(error))
          }

          console.log('[Auth] Google OAuth initiated:', data)
          return { error: null }
        } catch (error) {
          console.error('[Auth] Google OAuth exception:', error)
          return { error: error as Error }
        }
      },

      /**
       * Password Reset Request
       * Sends password reset email to user
       */
      resetPassword: async (email) => {
        console.log('[Auth] Requesting password reset for:', email)
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (error) {
            console.error('[Auth] Password reset error:', error)
            throw new Error(parseAuthError(error))
          }

          console.log('[Auth] Password reset email sent')
          return { error: null }
        } catch (error) {
          console.error('[Auth] Password reset exception:', error)
          return { error: error as Error }
        }
      },

      /**
       * Update Password
       * Called after user clicks reset link and enters new password
       */
      updatePassword: async (newPassword) => {
        console.log('[Auth] Updating password')
        
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          })

          if (error) {
            console.error('[Auth] Update password error:', error)
            throw new Error(parseAuthError(error))
          }

          console.log('[Auth] Password updated successfully')
          return { error: null }
        } catch (error) {
          console.error('[Auth] Update password exception:', error)
          return { error: error as Error }
        }
      },

      logout: async () => {
        set({ isLoading: true })
        console.log('[Auth] Logging out')
        
        try {
          await supabase.auth.signOut()
          clearWorkspaceCache()
        } catch (error) {
          console.error('[Auth] Logout error:', error)
        }
        set({ user: null, profile: null, isAuthenticated: false, isLoading: false })
      },

      fetchProfile: async () => {
        const { user } = get()
        if (!user) return

        console.log('[Auth] Fetching profile for:', user.id)
        
        try {
          // First try to get existing profile
          let { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          // If no profile exists, create one from user metadata
          if (error && error.code === 'PGRST116') {
            console.log('[Auth] No profile found, creating from user metadata')
            
            const fullName = user.user_metadata?.full_name || 
                            user.user_metadata?.name ||
                            user.email?.split('@')[0] || 
                            'User'
            const companyName = user.user_metadata?.company_name || null
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email!,
                full_name: fullName,
                company_name: companyName,
                role: 'admin',
                plan_type: 'free',
              })
              .select()
              .single()
            
            if (insertError) {
              console.error('[Auth] Error creating profile:', insertError)
              // Create a fallback profile from user metadata
              set({ 
                profile: {
                  id: user.id,
                  email: user.email!,
                  full_name: fullName,
                  company_name: companyName,
                  avatar_url: user.user_metadata?.avatar_url || null,
                  role: 'admin',
                  plan_type: 'free',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                } as Profile
              })
              return
            }
            
            data = newProfile
          } else if (error) {
            console.error('[Auth] Error fetching profile:', error)
            return
          }

          // Ensure full_name has a value (fallback to user metadata)
          if (data && !data.full_name) {
            data.full_name = user.user_metadata?.full_name || 
                            user.user_metadata?.name ||
                            user.email?.split('@')[0] || 
                            'User'
          }
          
          console.log('[Auth] Profile fetched:', data?.email, data?.full_name)
          set({ profile: data })
        } catch (error) {
          console.error('[Auth] Error fetching profile:', error)
        }
      },

      initialize: async () => {
        // Prevent multiple initializations
        if (get().isInitialized) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        console.log('[Auth] Initializing auth...')
        
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise<null>((_, reject) => {
            setTimeout(() => reject(new Error('Auth initialization timeout')), 5000)
          })

          const sessionPromise = supabase.auth.getSession()

          const result = await Promise.race([sessionPromise, timeoutPromise])
          
          if (result && 'data' in result) {
            const { data: { session } } = result
            console.log('[Auth] Session found:', !!session)
            
            if (session?.user) {
              set({ user: session.user, isAuthenticated: true })
              // Fetch profile in background, don't block
              get().fetchProfile().catch(console.error)
            }
          }
        } catch (error) {
          console.error('[Auth] Error initializing auth:', error)
          // On error, just continue as not authenticated
        } finally {
          console.log('[Auth] Auth initialization complete')
          set({ isLoading: false, isInitialized: true })
        }
      },
    }),
    {
      name: 'welcomely-auth',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
)

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('[Auth] Auth state changed:', event)
  const { setUser, setProfile, fetchProfile, isInitialized } = useAuthStore.getState()
  
  // Only handle auth changes after initial load
  if (!isInitialized) return
  
  if (event === 'SIGNED_IN' && session?.user) {
    setUser(session.user)
    await fetchProfile()
  } else if (event === 'SIGNED_OUT') {
    setUser(null)
    setProfile(null)
    clearWorkspaceCache()
  } else if (event === 'PASSWORD_RECOVERY') {
    // User clicked password reset link
    console.log('[Auth] Password recovery mode')
  } else if (event === 'USER_UPDATED') {
    // User updated their profile/password
    console.log('[Auth] User updated')
    if (session?.user) {
      setUser(session.user)
    }
  }
})
