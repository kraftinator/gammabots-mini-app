'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'

export type MintStage = 'idle' | 'validating' | 'minting' | 'finalizing'

interface UseMintStrategyResult {
  submitStage: MintStage
  submitErrors: string[]
  submitWarning: string | null
  duplicateTokenId: string | null
  isSubmitting: boolean
  hasErrors: boolean
  clearErrors: () => void
  mint: (strategyData: string) => Promise<void>
}

export function useMintStrategy(): UseMintStrategyResult {
  const router = useRouter()
  const { authenticate } = useQuickAuth()
  const [submitStage, setSubmitStage] = useState<MintStage>('idle')
  const [submitErrors, setSubmitErrors] = useState<string[]>([])
  const [submitWarning, setSubmitWarning] = useState<string | null>(null)
  const [duplicateTokenId, setDuplicateTokenId] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const clearErrors = useCallback(() => {
    setSubmitErrors([])
    setDuplicateTokenId(null)
  }, [])

  const mint = useCallback(async (strategyData: string) => {
    if (!strategyData.trim()) {
      setSubmitErrors(['Strategy is required'])
      return
    }

    if (strategyData.length > 5000) {
      setSubmitErrors(['Strategy must be 5000 characters or less'])
      return
    }

    const token = await authenticate()
    if (!token) {
      setSubmitErrors(['Authentication required'])
      return
    }

    setSubmitStage('validating')
    setSubmitErrors([])
    setSubmitWarning(null)
    setDuplicateTokenId(null)

    try {
      const response = await fetch('/api/strategies/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          strategy: strategyData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setSubmitErrors(errorData.errors)
        } else {
          setSubmitErrors([errorData.message || errorData.error || 'Failed to validate strategy'])
        }
        if (errorData.duplicate_nft_token_id) {
          setDuplicateTokenId(errorData.duplicate_nft_token_id)
        }
        return
      }

      const result = await response.json()

      if (result.valid) {
        setSubmitStage('minting')
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          const { encodeMintStrategy, STRATEGY_NFT_CONTRACT } = await import('@/contracts')

          const inMiniApp = await sdk.isInMiniApp()
          if (!inMiniApp) {
            console.warn('Not in Mini App environment, skipping NFT minting')
            router.push('/strategies')
            return
          }

          const accounts = await sdk.wallet.ethProvider.request({
            method: 'eth_requestAccounts',
          })

          if (!accounts || accounts.length === 0) {
            throw new Error('No wallet accounts available')
          }

          const data = encodeMintStrategy(result.compressed || strategyData)

          const txHash = await sdk.wallet.ethProvider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: accounts[0],
              to: STRATEGY_NFT_CONTRACT,
              data: data,
            }]
          })

          setSubmitStage('finalizing')

          // Register strategy with backend
          const registerResponse = await fetch('/api/strategies', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mint_tx_hash: txHash
            })
          })

          if (!registerResponse.ok) {
            throw new Error('Failed to register strategy')
          }

          const registerData = await registerResponse.json()
          const strategyId = registerData.id

          // Poll for mint confirmation
          const POLL_INTERVAL = 1000 // 1 second
          const TIMEOUT = 60000 // 60 seconds
          const startTime = Date.now()

          while (isMountedRef.current) {
            const statusResponse = await fetch(`/api/strategies/${strategyId}/mint_status`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })

            // Stop if unmounted during fetch
            if (!isMountedRef.current) return

            if (statusResponse.ok) {
              const statusData = await statusResponse.json()

              if (statusData.mint_status === 'confirmed' && statusData.nft_token_id) {
                // Success - redirect (only if still mounted)
                if (isMountedRef.current) {
                  router.push('/strategies')
                }
                return
              }

              if (statusData.mint_status === 'failed') {
                if (isMountedRef.current) {
                  setSubmitErrors(['Minting failed. Please try again.'])
                }
                return
              }
            }

            // Check timeout
            if (Date.now() - startTime > TIMEOUT) {
              if (isMountedRef.current) {
                setSubmitWarning('Still confirming… check Strategies later')
                setTimeout(() => {
                  if (isMountedRef.current) {
                    router.push('/strategies')
                  }
                }, 2000)
              }
              return
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
          }

        } catch (mintError) {
          console.error('NFT minting failed:', mintError)
          setSubmitErrors(['Strategy validated but NFT minting failed. Please try again.'])
          return
        }
      } else {
        // Validation returned 200 but valid: false with errors
        if (result.errors && Array.isArray(result.errors)) {
          setSubmitErrors(result.errors)
        } else {
          setSubmitErrors(['Strategy validation failed'])
        }
        if (result.duplicate_nft_token_id) {
          setDuplicateTokenId(result.duplicate_nft_token_id)
        }
        return
      }

    } catch (error) {
      console.error('Error creating strategy:', error)
      setSubmitErrors([error instanceof Error ? error.message : 'Failed to create strategy'])
    } finally {
      setSubmitStage('idle')
    }
  }, [authenticate, router])

  return {
    submitStage,
    submitErrors,
    submitWarning,
    duplicateTokenId,
    isSubmitting: submitStage !== 'idle',
    hasErrors: submitErrors.length > 0,
    clearErrors,
    mint,
  }
}
