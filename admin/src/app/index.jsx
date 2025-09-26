import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Styles: Tailwind CSS and Font Awesome only
import '@fortawesome/fontawesome-free/css/all.min.css'
import './tailwind.css'

const root = createRoot(document.getElementById('root'))
root.render(<App />)
