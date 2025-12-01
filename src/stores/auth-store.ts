import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

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
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  signup: (email: string, password: string, fullName: string, companyName?: string) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  initialize: () => Promise<void>
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

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          set({ user: data.user, isAuthenticated: true })
          await get().fetchProfile()
          return { error: null }
        } catch (error) {
          console.error('Login error:', error)
          return { error: error as Error }
        } finally {
          set({ isLoading: false })
        }
      },

      signup: async (email, password, fullName, companyName) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                company_name: companyName,
              },
            },
          })

          if (error) throw error

          // Create profile after signup
          if (data.user) {
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
              console.error('Error creating profile:', profileError)
            }

            set({ user: data.user, isAuthenticated: true })
            await get().fetchProfile()
          }

          return { error: null }
        } catch (error) {
          console.error('Signup error:', error)
          return { error: error as Error }
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await supabase.auth.signOut()
        } catch (error) {
          console.error('Logout error:', error)
        }
        set({ user: null, profile: null, isAuthenticated: false, isLoading: false })
      },

      fetchProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
            return
          }
          set({ profile: data })
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      },

      initialize: async () => {
        // Prevent multiple initializations
        if (get().isInitialized) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        console.log('Initializing auth...')
        
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise<null>((_, reject) => {
            setTimeout(() => reject(new Error('Auth initialization timeout')), 5000)
          })

          const sessionPromise = supabase.auth.getSession()

          const result = await Promise.race([sessionPromise, timeoutPromise])
          
          if (result && 'data' in result) {
            const { data: { session } } = result
            console.log('Session found:', !!session)
            
            if (session?.user) {
              set({ user: session.user, isAuthenticated: true })
              // Fetch profile in background, don't block
              get().fetchProfile().catch(console.error)
            }
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
          // On error, just continue as not authenticated
        } finally {
          console.log('Auth initialization complete')
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
  console.log('Auth state changed:', event)
  const { setUser, setProfile, fetchProfile, isInitialized } = useAuthStore.getState()
  
  // Only handle auth changes after initial load
  if (!isInitialized) return
  
  if (event === 'SIGNED_IN' && session?.user) {
    setUser(session.user)
    await fetchProfile()
  } else if (event === 'SIGNED_OUT') {
    setUser(null)
    setProfile(null)
  }
})
