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

  useEffect(() => {
    const initAuth = async () => {
      const authToken = await authenticate()
      if (authToken) {
        setToken(authToken)
      }
    }

    initAuth()
  }, [authenticate])

  useEffect(() => {
    const initSdk = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.ready()
      } catch (error) {
        console.error('Failed to initialize SDK:', error)
      }
    }

    initSdk()
  }, [])

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
        <h1 style={styles.formTitle}>Create Strategy</h1>
        <p style={styles.formSubtitle}>Set up your new trading strategy</p>
      </div>

      {/* Form Content - Placeholder for now */}
      <div style={styles.formCard}>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#8e8e93'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1c1c1e',
            marginBottom: '12px' 
          }}>
            Coming Soon
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
            Strategy creation functionality will be available soon.
          </p>
          <button
            onClick={() => router.push('/strategies')}
            style={{
              ...styles.submitButton,
              marginTop: '24px',
              backgroundColor: '#8e8e93'
            }}
          >
            Back to Strategies
          </button>
        </div>
      </div>

      <BottomNavigation activeTab="strategies" />
    </div>
  )
}