'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import BottomNavigation from '@/components/BottomNavigation'
import { styles, colors } from '@/styles/common'

export default function GammaScriptPage() {
  const router = useRouter()
  const { authLoading, authError, authenticate, clearAuthError } = useQuickAuth()
  const [token, setToken] = useState<string | null>(null)
  const [strategyData, setStrategyData] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  useEffect(() => {
    const initAuth = async () => {
      const authToken = await authenticate()
      if (authToken) {
        setToken(authToken)
      }
    }
    initAuth()
  }, [authenticate])

  const handleSubmit = async () => {
    if (!strategyData.trim()) {
      setSubmitError('Strategy is required')
      return
    }

    if (strategyData.length > 5000) {
      setSubmitError('Strategy must be 5000 characters or less')
      return
    }

    if (!token) {
      setSubmitError('Authentication required')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

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
        throw new Error(errorData.message || 'Failed to validate strategy')
      }

      const result = await response.json()

      if (result.valid) {
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

          try {
            await fetch('/api/strategies', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                mint_tx_hash: txHash
              })
            })
          } catch (backendError) {
            console.error('Failed to register strategy with backend:', backendError)
          }

        } catch (mintError) {
          console.error('NFT minting failed:', mintError)
          setSubmitError('Strategy validated but NFT minting failed. Please try again.')
          return
        }
      } else {
        setSubmitError('Strategy validation failed')
        return
      }

      router.push('/strategies')

    } catch (error) {
      console.error('Error creating strategy:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create strategy')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div style={styles.formContainer}>
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
        </div>
        <BottomNavigation activeTab="strategies" />
      </div>
    )
  }

  if (authError) {
    return (
      <div style={styles.formContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorTitle}>Authentication Error</div>
          <div style={styles.errorText}>{authError}</div>
          <button
            onClick={clearAuthError}
            style={{
              ...styles.submitButton,
              marginTop: '16px'
            }}
          >
            Try Again
          </button>
        </div>
        <BottomNavigation activeTab="strategies" />
      </div>
    )
  }

  if (!token) {
    return (
      <div style={styles.formContainer}>
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: '16px', color: '#666' }}>Authentication required</div>
        </div>
        <BottomNavigation activeTab="strategies" />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px 16px',
        backgroundColor: '#fff',
      }}>
        <button
          onClick={() => router.push('/strategies/create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            padding: '0',
            marginBottom: '12px',
            cursor: 'pointer',
            color: colors.primary,
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1a1a1a',
          margin: 0,
        }}>
          Write GammaScript
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '4px 0 0 0',
        }}>
          Write or paste GammaScript JSON
        </p>
      </div>

      {/* GammaScript Editor */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px 16px',
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
              GammaScript
            </span>
            <span style={{
              fontSize: '12px',
              color: strategyData.length > 5000 ? '#c00' : '#888'
            }}>
              {strategyData.length} / 5000
            </span>
          </div>

          <textarea
            value={strategyData}
            onChange={(e) => setStrategyData(e.target.value)}
            placeholder="Enter GammaScript here…"
            style={{
              width: '100%',
              minHeight: '250px',
              padding: '12px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '13px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              resize: 'vertical',
              boxSizing: 'border-box',
              lineHeight: '1.5',
            }}
          />
        </div>

        {submitError && (
          <div style={{
            backgroundColor: '#fee',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            border: '1px solid #fcc',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#c00',
              marginBottom: '4px',
            }}>
              Error
            </div>
            <div style={{
              fontSize: '13px',
              color: '#c00',
            }}>
              {submitError}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !strategyData.trim() || strategyData.length > 5000}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '16px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: isSubmitting || !strategyData.trim() || strategyData.length > 5000 ? '#999' : '#8b5cf6',
            border: 'none',
            borderRadius: '12px',
            cursor: isSubmitting || !strategyData.trim() || strategyData.length > 5000 ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Validating & Minting NFT...' : 'Mint Strategy'}
        </button>
      </div>

      <BottomNavigation activeTab="strategies" />
    </div>
  )
}
