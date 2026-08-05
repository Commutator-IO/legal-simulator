import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageLectures from './PageLectures.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageLectures />
  </StrictMode>,
)
