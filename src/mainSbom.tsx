import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageSbom from './PageSbom.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageSbom />
  </StrictMode>,
)
