// Clean React bootstrap: wrap App with BrowserRouter and AuthProvider
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import App from './App'
import './index.css'

function mount() {
  const el = document.getElementById('root')
  if (!el) throw new Error('Root element not found')

  createRoot(el).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}

mount()
