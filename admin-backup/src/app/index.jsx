import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '../features/auth/context/AuthProvider'
import { queryClient } from '../shared/lib/queryClient'
import App from './App'

// Styles: Tailwind CSS and Font Awesome only
import '@fortawesome/fontawesome-free/css/all.min.css'
import './tailwind.css'
import './theme.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
  </QueryClientProvider>
)
