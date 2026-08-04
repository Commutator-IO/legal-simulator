import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageResponsabilites from './PageResponsabilites.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageResponsabilites />
  </StrictMode>,
)
