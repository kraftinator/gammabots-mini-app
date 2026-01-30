'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseQuickAuthReturn {
  authLoading: boolean
  authError: string | null
  authenticate: () => Promise<string | null>
  navigateToMyBots: () => Promise<void>
  clearAuthError: () => void
}

export function useQuickAuth(): UseQuickAuthReturn {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const authenticate = useCallback(async (): Promise<string | null> => {
    try {
      setAuthLoading(true)
      setAuthError(null)

      // Load the SDK
      const { sdk } = await import('@farcaster/miniapp-sdk')

      // Check if we're in a Mini App environment
      const inMiniApp = await sdk.isInMiniApp()
      
      if (!inMiniApp) {
        setAuthError('Not running in Farcaster Mini App environment')
        return null
      }

      // Perform Quick Auth
      const { token } = await sdk.quickAuth.getToken()

      if (typeof token !== "string" || token.length === 0) {
        setAuthError("Quick Auth did not return a token.")
        return null
      }

      return token

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Quick Auth failed."
      setAuthError(errorMessage)
      return null
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const navigateToMyBots = useCallback(async (): Promise<void> => {
    const token = await authenticate()
    if (token) {
      router.push("/mini-app/my-bots")
    }
  }, [authenticate, router])

  return {
    authLoading,
    authError,
    authenticate,
    navigateToMyBots,
    clearAuthError
  }
}