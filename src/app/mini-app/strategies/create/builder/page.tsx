'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { useMintStrategy } from '@/hooks/useMintStrategy'
import BottomNavigation from '@/components/BottomNavigation'
import StrategyBuilder from '@/components/strategy-builder/StrategyBuilder'
import InsufficientBalanceCard from '@/components/InsufficientBalanceCard'
import { styles, colors } from '@/styles/common'

export default function BuilderPage() {
  const router = useRouter()
  const { authLoading, authError, authenticate, clearAuthError } = useQuickAuth()
  const [token, setToken] = useState<string | null>(null)
  const [strategyData, setStrategyData] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const {
    submitStage,
    submitErrors,
    submitWarning,
    duplicateTokenId,
    insufficientBalance,
    isSubmitting,
    hasErrors,
    clearErrors,
    mint,
  } = useMintStrategy()

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

  const handleStrategyChange = useCallback((script: string, valid: boolean) => {
    setStrategyData(script)
    setIsFormValid(valid)
    if (hasErrors) clearErrors()
  }, [hasErrors, clearErrors])

  const handleSubmit = () => {
    mint(strategyData)
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
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px 16px',
        backgroundColor: '#fff',
      }}>
        <button
          onClick={() => router.push('/mini-app/strategies/create')}
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
          Strategy Builder
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '4px 0 0 0',
        }}>
          Visually build your trading strategy
        </p>
        <span
          onClick={() => router.push('/mini-app/docs/gammascript-reference')}
          style={{
            fontSize: '13px',
            color: '#14b8a6',
            cursor: 'pointer',
            marginTop: '8px',
            display: 'inline-block',
          }}
        >
          → View GammaScript Reference
        </span>
      </div>

      {/* Strategy Builder */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px 16px',
      }}>
        <StrategyBuilder onStrategyChange={handleStrategyChange} />

        {submitErrors.length > 0 && !duplicateTokenId && (
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
              {submitErrors.length === 1 ? 'Error' : 'Errors'}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#c00',
            }}>
              {submitErrors.length === 1 ? (
                submitErrors[0]
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {submitErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {insufficientBalance && (
          <InsufficientBalanceCard info={insufficientBalance} />
        )}

        {duplicateTokenId && (
          <div style={{
            backgroundColor: '#fffbeb',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            border: '1px solid #fcd34d',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#78350f',
              marginBottom: '4px',
            }}>
              Strategy already exists
            </div>
            <div style={{
              fontSize: '13px',
              color: '#92400e',
            }}>
              This strategy has already been minted. You can reuse the existing strategy or view it.
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '12px',
              fontSize: '13px',
            }}>
              <button
                onClick={() => router.push(`/mini-app/my-bots/create?strategy_id=${duplicateTokenId}&from=strategies`)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#14b8a6',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Use This Strategy
              </button>
              <button
                onClick={() => router.push(`/mini-app/strategies?view=${duplicateTokenId}`)}
                style={{
                  padding: '8px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#666',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                View Strategy #{duplicateTokenId}
              </button>
            </div>
          </div>
        )}

        {submitWarning && (
          <div style={{
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            border: '1px solid #fcd34d',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '4px',
            }}>
              Warning
            </div>
            <div style={{
              fontSize: '13px',
              color: '#92400e',
            }}>
              {submitWarning}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid || strategyData.length > 5000 || hasErrors}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '16px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: submitStage === 'finalizing' ? '#8adcd3' : (isSubmitting || !isFormValid || strategyData.length > 5000 || hasErrors ? '#999' : '#14b8a6'),
            border: 'none',
            borderRadius: '12px',
            cursor: isSubmitting || !isFormValid || strategyData.length > 5000 || hasErrors ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {(submitStage === 'validating' || submitStage === 'approving' || submitStage === 'finalizing') && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          )}
          {submitStage === 'idle' && 'Mint Strategy'}
          {submitStage === 'validating' && 'Validating...'}
          {submitStage === 'approving' && 'Approving...'}
          {submitStage === 'minting' && 'Minting...'}
          {submitStage === 'finalizing' && 'Finalizing...'}
        </button>
      </div>

      <BottomNavigation activeTab="strategies" />
    </div>
  )
}
