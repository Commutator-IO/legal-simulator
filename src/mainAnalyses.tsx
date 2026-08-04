import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageAnalyses from './PageAnalyses.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageAnalyses />
  </StrictMode>,
)
