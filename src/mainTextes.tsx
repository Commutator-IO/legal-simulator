import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageTextes from './PageTextes.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageTextes />
  </StrictMode>,
)
