import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PagePerimetre from './PagePerimetre.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PagePerimetre />
  </StrictMode>,
)
