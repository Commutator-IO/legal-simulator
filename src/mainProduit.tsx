import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageProduit from './PageProduit.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageProduit />
  </StrictMode>,
)
