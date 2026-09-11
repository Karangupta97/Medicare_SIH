import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
// Import HelmetProvider from react-helmet-async
import { HelmetProvider } from 'react-helmet-async'
// Import error handling setup
import setupErrorHandling from './utils/errorHandling.js'

// Initialize error handling before rendering the app
setupErrorHandling();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
