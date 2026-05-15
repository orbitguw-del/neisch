import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './index.css'

// Recover from stale chunk references after a redeploy.
// Vite fires `vite:preloadError` when a dynamic import 404s; one reload pulls the new build.
// sessionStorage gate prevents an infinite loop if the new build is also broken.
window.addEventListener('vite:preloadError', (event) => {
  if (sessionStorage.getItem('chunk-reload-attempted')) return
  sessionStorage.setItem('chunk-reload-attempted', '1')
  event.preventDefault()
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
