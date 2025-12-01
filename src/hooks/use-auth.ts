import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    store.initialize()
  }, [])

  return store
}

export function useUser() {
  return useAuthStore((state) => state.user)
}

export function useProfile() {
  return useAuthStore((state) => state.profile)
}

export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated)
}

