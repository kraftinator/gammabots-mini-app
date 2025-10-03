'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import BottomNavigation from '@/components/BottomNavigation'
import { styles } from '@/styles/common'

export default function CreateStrategyPage() {
  const router = useRouter()
  const { authLoading, authError, authenticate, clearAuthError } = useQuickAuth()
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [strategyData, setStrategyData] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    async function initializePage() {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
        await sdk.actions.ready()
        console.log('Create Strategy page is ready!')
      } catch (error) {
        console.error('Error initializing page:', error)
        setIsReady(true)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      // First, validate the strategy
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
      console.log('Strategy validated successfully:', result)

      // If strategy is valid, mint the NFT
      if (result.valid) {
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          const { encodeMintStrategy, STRATEGY_NFT_CONTRACT } = await import('@/contracts')

          // Check if we're in Mini App environment
          const inMiniApp = await sdk.isInMiniApp()
          if (!inMiniApp) {
            console.warn('Not in Mini App environment, skipping NFT minting')
            router.push('/strategies')
            return
          }

          // Get the user's account
          const accounts = await sdk.wallet.ethProvider.request({
            method: 'eth_requestAccounts',
          })
          
          if (!accounts || accounts.length === 0) {
            throw new Error('No wallet accounts available')
          }

          // Encode the contract call data
          //const data = encodeMintStrategy('test2')
          const data = encodeMintStrategy(result.compressed || strategyData)

          // Send the mint transaction
          const txHash = await sdk.wallet.ethProvider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: accounts[0],
              to: STRATEGY_NFT_CONTRACT,
              data: data,
            }]
          })
          
          console.log('Strategy NFT minted successfully:', txHash)
          
        } catch (mintError) {
          console.error('NFT minting failed:', mintError)
          setSubmitError('Strategy validated but NFT minting failed. Please try again.')
          return
        }
      } else {
        setSubmitError('Strategy validation failed')
        return
      }
      
      // Redirect to strategies page
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
    <div style={styles.formContainer}>
      {/* Header */}
      <div style={styles.formHeader}>
        <div>
          <h1 style={styles.formTitle}>
            Create Strategy
          </h1>
          <p style={styles.formSubtitle}>
            Set up your new trading strategy
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={styles.formCard}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Strategy
            </label>
            <textarea
              value={strategyData}
              onChange={(e) => setStrategyData(e.target.value)}
              placeholder='{"c":"bcn==0 && crt>60","a":["deact force"]},{"c":"bcn==0 && cpr>ppr","a":["buy init"]},{"c":"bcn>0 && cpr>ibp*1.2 && cma<lma","a":["sell all","deact"]}'
              style={{
                ...styles.formInput,
                minHeight: '200px',
                resize: 'vertical' as const,
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
              required
            />
            <div style={{
              fontSize: '12px',
              color: strategyData.length > 5000 ? '#ff3b30' : '#8e8e93',
              marginTop: '4px'
            }}>
              {strategyData.length} / 5000 characters maximum
            </div>
          </div>

          {submitError && (
            <div style={{
              ...styles.errorCard,
              margin: '16px 0'
            }}>
              <div style={styles.errorText}>{submitError}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || strategyData.length > 5000}
            style={{
              ...styles.submitButton,
              opacity: isSubmitting || strategyData.length > 5000 ? 0.6 : 1,
              cursor: isSubmitting || strategyData.length > 5000 ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Validating & Minting NFT...' : 'Create Strategy'}
          </button>
        </div>
      </form>

      <BottomNavigation activeTab="strategies" />
    </div>
  )
}