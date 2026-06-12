import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Seed a default mock token if not present to ensure seamless local development/mock views
if (!localStorage.getItem("workerToken") || localStorage.getItem("workerToken")?.startsWith("eyJ")) {
  const mockToken = "mock-token";
  localStorage.setItem("workerToken", mockToken);
  localStorage.setItem("token", mockToken);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
