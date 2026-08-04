import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageRgpd from './PageRgpd.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageRgpd />
  </StrictMode>,
)
