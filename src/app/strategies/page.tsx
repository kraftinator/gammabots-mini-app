'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import BottomNavigation from '@/components/BottomNavigation'
import { styles } from '@/styles/common'

export default function StrategiesPage() {
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

  const handleCreateStrategy = () => {
    router.push('/strategies/create')
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
      <div style={{
        backgroundColor: 'white',
        padding: '20px 20px 20px',
        marginBottom: '0'
      }}>
        <h1 style={styles.formTitle}>Strategies</h1>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        minHeight: '400px'
      }}>
        <button
          onClick={handleCreateStrategy}
          style={{
            ...styles.submitButton,
            fontSize: '18px',
            fontWeight: '600',
            padding: '16px 32px',
            minWidth: '200px'
          }}
        >
          Create Strategy
        </button>
      </div>

      <BottomNavigation activeTab="strategies" />
    </div>
  )
}