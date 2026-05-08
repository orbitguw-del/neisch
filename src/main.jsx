import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './index.css'
import { initCapacitor } from './lib/capacitor'
import ErrorBoundary from './components/ErrorBoundary'

// Initialise Capacitor plugins (status bar, deep links, etc.)
// Safe to call on web too — capacitor stubs are no-ops on non-native
initCapacitor(router)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
)
