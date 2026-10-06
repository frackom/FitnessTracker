import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from '@emotion/react'
import fitnessTheme from './themes/fitnessTheme.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={fitnessTheme}>
    <App />
    </ThemeProvider>
  </StrictMode>,
)
