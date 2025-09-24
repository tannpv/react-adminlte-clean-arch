import React from 'react'
import { createRoot } from 'react-dom/client'
import AppTailwind from './AppTailwind'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '../shared/lib/queryClient'
import { AuthProvider } from '../features/auth/context/AuthProvider'

// Import Tailwind CSS instead of AdminLTE
import './tailwind.css'
import './theme.css' // Keep custom theme overrides

const root = createRoot(document.getElementById('root'))
root.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppTailwind />
    </AuthProvider>
    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
  </QueryClientProvider>
)
