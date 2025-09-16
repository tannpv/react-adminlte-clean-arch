import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

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
root.render(<App />)
