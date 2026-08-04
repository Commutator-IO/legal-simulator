import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageQualification from './PageQualification.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageQualification />
  </StrictMode>,
)
