import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import CurrentUserProvider from './context/CurrentUserProvider.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CurrentUserProvider>
        <App />
      </CurrentUserProvider>
    </BrowserRouter>
  </StrictMode>
)
