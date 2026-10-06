'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CreateStrategyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function initializePage() {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.ready()
      } catch (error) {
        console.error('Error initializing page:', error)
      }
    }
    initializePage()
  }, [])

  // The builder is hidden for now, so this chooser forwards straight to the
  // GammaScript editor, carrying the strategy param when copying one.
  // /strategies/create/builder still works if visited directly.
  useEffect(() => {
    const strategy = searchParams.get('strategy')
    router.replace(
      strategy
        ? `/mini-app/strategies/create/gammascript?strategy=${encodeURIComponent(strategy)}`
        : '/mini-app/strategies/create/gammascript'
    )
  }, [searchParams, router])

  return null
}

export default function CreateStrategyPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#888' }}>Loading...</span>
      </div>
    }>
      <CreateStrategyPageContent />
    </Suspense>
  )
}
