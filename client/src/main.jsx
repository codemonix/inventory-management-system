import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import './index.css'
import App from './App.jsx'
import './setupGlobalLogger.js'

document.body.classList.add('bg-gray-100')

createRoot(document.getElementById('root')).render(
  // <StrictMode>
        <App />
  // </StrictMode>,
)
