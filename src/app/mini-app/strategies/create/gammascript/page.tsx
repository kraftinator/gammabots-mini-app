'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { useMintStrategy } from '@/hooks/useMintStrategy'
import BottomNavigation from '@/components/BottomNavigation'
import InsufficientBalanceCard from '@/components/InsufficientBalanceCard'
import { styles, colors } from '@/styles/common'

function GammaScriptPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authLoading, authError, authenticate, clearAuthError } = useQuickAuth()
  const [token, setToken] = useState<string | null>(null)
  const [strategyData, setStrategyData] = useState('')
  const [isPrefilledUnmodified, setIsPrefilledUnmodified] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationSuccess, setValidationSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationDuplicateId, setValidationDuplicateId] = useState<string | null>(null)

  // Pre-populate from query param
  useEffect(() => {
    const strategy = searchParams.get('strategy')
    if (strategy) {
      // Decode JSON unicode escapes (e.g., \u003e -> >)
      let decoded = strategy
      try {
        decoded = JSON.parse(`"${strategy.replace(/"/g, '\\"')}"`)
      } catch {
        // If parsing fails, use the original string
      }
      setStrategyData(decoded)
      setIsPrefilledUnmodified(true)
      // Clear the query parameter from URL
      router.replace('/mini-app/strategies/create/gammascript', { scroll: false })
    }
  }, [searchParams, router])
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

  const handleValidate = async () => {
    if (!strategyData.trim()) return

    const authToken = await authenticate()
    if (!authToken) return

    setIsValidating(true)
    setValidationSuccess(false)
    setValidationErrors([])
    setValidationDuplicateId(null)

    try {
      const response = await fetch('/api/strategies/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ strategy: strategyData })
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.duplicate_nft_token_id) {
          // Duplicate means the GammaScript is valid
          setValidationSuccess(true)
          setValidationDuplicateId(result.duplicate_nft_token_id)
        } else if (result.errors && Array.isArray(result.errors)) {
          setValidationErrors(result.errors)
        } else {
          setValidationErrors([result.message || result.error || 'Validation failed'])
        }
      } else if (result.valid) {
        setValidationSuccess(true)
        if (result.duplicate_nft_token_id) {
          setValidationDuplicateId(result.duplicate_nft_token_id)
        }
      } else {
        if (result.duplicate_nft_token_id) {
          // Duplicate means the GammaScript is valid
          setValidationSuccess(true)
          setValidationDuplicateId(result.duplicate_nft_token_id)
        } else if (result.errors && Array.isArray(result.errors)) {
          setValidationErrors(result.errors)
        } else {
          setValidationErrors(['Strategy validation failed'])
        }
      }
    } catch (error) {
      setValidationErrors(['Failed to validate strategy'])
    } finally {
      setIsValidating(false)
    }
  }

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
          Write GammaScript
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '4px 0 0 0',
        }}>
          Write or paste your GammaScript here
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
          → GammaScript Reference
        </span>
        <br />
        <span
          onClick={() => router.push('/mini-app/docs/gammascript-for-llms')}
          style={{
            fontSize: '13px',
            color: '#14b8a6',
            cursor: 'pointer',
            marginTop: '4px',
            display: 'inline-block',
          }}
        >
          → Generate with AI (copy prompt)
        </span>
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
            onChange={(e) => {
              setStrategyData(e.target.value)
              if (isPrefilledUnmodified) setIsPrefilledUnmodified(false)
              if (hasErrors) clearErrors()
              if (validationSuccess) setValidationSuccess(false)
              if (validationErrors.length > 0) setValidationErrors([])
              if (validationDuplicateId) setValidationDuplicateId(null)
            }}
            placeholder="Enter GammaScript here…"
            disabled={isSubmitting}
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
              opacity: isSubmitting ? 0.5 : 1,
              backgroundColor: isSubmitting ? '#f5f5f5' : '#fff',
            }}
          />
        </div>

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

        {/* Validation Success */}
        {validationSuccess && !validationDuplicateId && (
          <div style={{
            backgroundColor: '#ecfdf5',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            border: '1px solid #6ee7b7',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#065f46',
            }}>
              Strategy validated!
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && !validationDuplicateId && (
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
              {validationErrors.length === 1 ? 'Error' : 'Errors'}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#c00',
            }}>
              {validationErrors.length === 1 ? (
                validationErrors[0]
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Validation Duplicate Warning */}
        {validationDuplicateId && (
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
                onClick={() => router.push(`/mini-app/my-bots/create?strategy_id=${validationDuplicateId}&from=strategies`)}
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
                onClick={() => router.push(`/mini-app/strategies?view=${validationDuplicateId}`)}
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
                View Strategy #{validationDuplicateId}
              </button>
            </div>
          </div>
        )}

        {/* Validate Button */}
        <button
          onClick={handleValidate}
          disabled={isValidating || isSubmitting || !strategyData.trim() || strategyData.length > 5000 || validationErrors.length > 0 || validationSuccess}
          style={{
            width: '100%',
            padding: '14px',
            marginTop: '16px',
            fontSize: '15px',
            fontWeight: '600',
            color: isValidating || isSubmitting || !strategyData.trim() || strategyData.length > 5000 || validationErrors.length > 0 || validationSuccess ? '#999' : '#8b5cf6',
            backgroundColor: '#fff',
            border: isValidating || isSubmitting || !strategyData.trim() || strategyData.length > 5000 || validationErrors.length > 0 || validationSuccess ? '1px solid #ccc' : '1px solid #8b5cf6',
            borderRadius: '12px',
            cursor: isValidating || isSubmitting || !strategyData.trim() || strategyData.length > 5000 || validationErrors.length > 0 || validationSuccess ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isValidating && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          )}
          {isValidating ? 'Validating...' : 'Validate Script'}
        </button>

        {/* Mint Button - hidden when duplicate */}
        {!validationDuplicateId && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !strategyData.trim() || strategyData.length > 5000 || hasErrors || isPrefilledUnmodified || validationErrors.length > 0}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: submitStage === 'finalizing' ? '#c5aefb' : (isSubmitting || !strategyData.trim() || strategyData.length > 5000 || hasErrors || isPrefilledUnmodified || validationErrors.length > 0 ? '#999' : '#8b5cf6'),
            border: 'none',
            borderRadius: '12px',
            cursor: isSubmitting || !strategyData.trim() || strategyData.length > 5000 || hasErrors || isPrefilledUnmodified || validationErrors.length > 0 ? 'not-allowed' : 'pointer',
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
          {submitStage === 'idle' && 'Mint Strategy NFT'}
          {submitStage === 'validating' && 'Validating...'}
          {submitStage === 'approving' && 'Approving...'}
          {submitStage === 'minting' && 'Minting...'}
          {submitStage === 'finalizing' && 'Finalizing...'}
        </button>
        )}
      </div>

      <BottomNavigation activeTab="strategies" />
    </div>
  )
}

export default function GammaScriptPage() {
  return (
    <Suspense fallback={
      <div style={styles.formContainer}>
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
        </div>
        <BottomNavigation activeTab="strategies" />
      </div>
    }>
      <GammaScriptPageContent />
    </Suspense>
  )
}
