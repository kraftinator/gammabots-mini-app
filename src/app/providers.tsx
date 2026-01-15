'use client'

import { MeProvider } from '@/contexts/MeContext'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MeProvider>
      {children}
    </MeProvider>
  )
}
