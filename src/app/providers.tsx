'use client'

import { MeProvider } from '@/contexts/MeContext'
import { ChainProvider } from '@/contexts/ChainContext'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MeProvider>
      <ChainProvider>
        {children}
      </ChainProvider>
    </MeProvider>
  )
}
