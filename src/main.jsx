import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css?inline'
import './App.css?inline'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
