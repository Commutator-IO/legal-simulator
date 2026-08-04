import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageIa from './PageIa.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageIa />
  </StrictMode>,
)
