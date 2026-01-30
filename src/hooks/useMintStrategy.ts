'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'

export type MintStage = 'idle' | 'validating' | 'approving' | 'minting' | 'finalizing'

export interface InsufficientBalanceInfo {
  required: string
  current: string
  symbol: string
  tokenAddress: string
}

interface UseMintStrategyResult {
  submitStage: MintStage
  submitErrors: string[]
  submitWarning: string | null
  duplicateTokenId: string | null
  insufficientBalance: InsufficientBalanceInfo | null
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
  const [insufficientBalance, setInsufficientBalance] = useState<InsufficientBalanceInfo | null>(null)
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
    setInsufficientBalance(null)
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
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          const { encodeMintStrategy, encodeApprove, STRATEGY_NFT_CONTRACT } = await import('@/contracts')

          const inMiniApp = await sdk.isInMiniApp()
          if (!inMiniApp) {
            console.warn('Not in Mini App environment, skipping NFT minting')
            router.push('/mini-app/strategies')
            return
          }

          const accounts = await sdk.wallet.ethProvider.request({
            method: 'eth_requestAccounts',
          })

          if (!accounts || accounts.length === 0) {
            throw new Error('No wallet accounts available')
          }

          // Get mint details to check if approval is needed
          const mintDetailsResponse = await fetch(`/api/strategies/mint_details?wallet_address=${accounts[0]}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!mintDetailsResponse.ok) {
            throw new Error('Failed to get mint details')
          }

          const mintDetails = await mintDetailsResponse.json()

          // Check if user has enough balance
          const userBalance = BigInt(mintDetails.userBalance)
          const mintFee = BigInt(mintDetails.mintFee)

          if (userBalance < mintFee) {
            const requiredAmount = Number(mintFee) / Math.pow(10, mintDetails.feeTokenDecimals)
            const currentAmount = Number(userBalance) / Math.pow(10, mintDetails.feeTokenDecimals)
            setInsufficientBalance({
              required: String(requiredAmount),
              current: String(currentAmount),
              symbol: mintDetails.feeTokenSymbol,
              tokenAddress: mintDetails.feeToken,
            })
            return
          }

          // Handle token approval if needed
          if (mintDetails.needsApproval) {
            setSubmitStage('approving')

            const approveData = encodeApprove(
              STRATEGY_NFT_CONTRACT,
              BigInt(mintDetails.mintFee)
            )

            await sdk.wallet.ethProvider.request({
              method: 'eth_sendTransaction',
              params: [{
                from: accounts[0],
                to: mintDetails.feeToken as `0x${string}`,
                data: approveData,
              }]
            })

            // Wait for approval to be confirmed by polling mint_details
            const APPROVAL_POLL_INTERVAL = 2000
            const APPROVAL_TIMEOUT = 60000
            const approvalStartTime = Date.now()

            while (isMountedRef.current) {
              await new Promise(resolve => setTimeout(resolve, APPROVAL_POLL_INTERVAL))

              const checkResponse = await fetch(`/api/strategies/mint_details?wallet_address=${accounts[0]}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })

              if (!isMountedRef.current) return

              if (checkResponse.ok) {
                const updatedDetails = await checkResponse.json()
                if (!updatedDetails.needsApproval) {
                  // Approval confirmed
                  break
                }
              }

              if (Date.now() - approvalStartTime > APPROVAL_TIMEOUT) {
                throw new Error('Approval confirmation timed out')
              }
            }

            if (!isMountedRef.current) return
          }

          // Proceed with minting
          setSubmitStage('minting')

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
                // Success - redirect to strategies with modal open (only if still mounted)
                if (isMountedRef.current) {
                  router.push(`/mini-app/strategies?view=${statusData.nft_token_id}`)
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
                    router.push('/mini-app/strategies')
                  }
                }, 2000)
              }
              return
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
          }

        } catch (mintError: unknown) {
          // Check if user rejected/cancelled the transaction
          const errorName = mintError instanceof Error ? mintError.name : ''
          const errorMessage = mintError instanceof Error ? mintError.message : String(mintError)

          if (errorName.includes('UserRejected') || errorMessage.includes('rejected')) {
            // User cancelled - silently return to idle
            return
          }

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
    insufficientBalance,
    isSubmitting: submitStage !== 'idle',
    hasErrors: submitErrors.length > 0,
    clearErrors,
    mint,
  }
}
