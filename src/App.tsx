import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Toaster } from '@/components/ui/toaster'

// Initialize theme
import '@/stores/theme-store'

// Optimized QueryClient configuration for instant UI feedback
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 2 minutes - no refetch during this time
      staleTime: 1000 * 60 * 2,
      // Keep unused data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Don't refetch on window focus for smoother UX
      refetchOnWindowFocus: false,
      // Only retry once on failure
      retry: 1,
      // Retry delay exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Use cached data while fetching in background
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry mutations once on network failure
      retry: 1,
      retryDelay: 1000,
    },
  },
})

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
