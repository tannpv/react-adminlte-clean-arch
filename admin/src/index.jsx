import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './infra/query/client'
import { AuthProvider } from './presentation/context/AuthContext'

// Styles: Bootstrap first, then AdminLTE and Font Awesome
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'admin-lte/dist/css/adminlte.min.css'

// Scripts: expose jQuery globally, then Bootstrap bundle and AdminLTE
import $ from 'jquery'
window.$ = window.jQuery = $
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'admin-lte/dist/js/adminlte.min.js'

const root = createRoot(document.getElementById('root'))
root.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
  </QueryClientProvider>
)
