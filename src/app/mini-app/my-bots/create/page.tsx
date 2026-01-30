'use client'

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { styles, colors } from '@/styles/common'

function CreateBotContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authError, authenticate } = useQuickAuth()
  const [isReady, setIsReady] = useState(false)
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)
  const [formData, setFormData] = useState(() => {
    // Initialize with defaults, will be updated from query params in useEffect
    return {
      tokenAddress: '',
      ethAmount: '0.001',
      movingAverage: '6',
      strategyId: '',
      profitShare: '50',
      profitThreshold: '15'
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Strategy options state
  const [strategyOptions, setStrategyOptions] = useState<Array<{ strategy_id: string; label: string; bot_count: number; creator_handle?: string }>>([])
  const [strategyOptionsLoading, setStrategyOptionsLoading] = useState(false)
  const [isStrategyPickerOpen, setIsStrategyPickerOpen] = useState(false)
  const [strategySearchQuery, setStrategySearchQuery] = useState('')

  // Moving Average state - separate input state for typing
  const [movingAvgInput, setMovingAvgInput] = useState('6')

  // Token validation state
  const [tokenValidation, setTokenValidation] = useState<{
    status: 'empty' | 'pending' | 'found' | 'not_found' | 'invalid_format'
    symbol?: string
    name?: string
    chain?: string
    error?: string
  }>({ status: 'empty' })

  // Refs for token validation
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastLookedUpAddressRef = useRef<string>('')
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Ethereum address validation regex
  const isValidAddressFormat = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address)

  // Form validity - single source of truth for button enablement and review box
  const isFormValid = useMemo(() => {
    // Token must be valid
    if (tokenValidation.status !== 'found') return false

    // Strategy must be selected
    if (!formData.strategyId) return false

    // ETH amount must be present and valid
    const ethNum = parseFloat(formData.ethAmount)
    if (!formData.ethAmount || isNaN(ethNum) || ethNum <= 0) return false

    // Moving average must be valid (already enforced to be 1-60)
    const movingAvgNum = parseInt(formData.movingAverage, 10)
    if (isNaN(movingAvgNum) || movingAvgNum < 1 || movingAvgNum > 60) return false

    return true
  }, [tokenValidation.status, formData.strategyId, formData.ethAmount, formData.movingAverage])

  // Get selected strategy label for review box
  const selectedStrategyLabel = useMemo(() => {
    const strategy = strategyOptions.find(s => s.strategy_id === formData.strategyId)
    return strategy?.label || `#${formData.strategyId}`
  }, [strategyOptions, formData.strategyId])

  // Token lookup function
  const lookupToken = useCallback(async (address: string) => {
    // Skip if same as last lookup
    if (address === lastLookedUpAddressRef.current) {
      return
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Update last looked up address
    lastLookedUpAddressRef.current = address

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setTokenValidation({ status: 'pending' })

    try {
      // Get auth token
      const token = await authenticate()
      if (!token) {
        setTokenValidation({
          status: 'not_found',
          error: 'Authentication required'
        })
        return
      }

      const response = await fetch(`/api/tokens/lookup?address=${encodeURIComponent(address)}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.valid) {
        setTokenValidation({
          status: 'found',
          symbol: data.token_symbol,
          name: data.token_name,
          chain: data.chain
        })
      } else {
        setTokenValidation({
          status: 'not_found',
          chain: data.chain,
          error: data.error || 'Token not found'
        })
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      setTokenValidation({
        status: 'not_found',
        error: 'Failed to validate token'
      })
    }
  }, [authenticate])

  // Handle token address change with debounce
  const handleTokenAddressChange = useCallback((value: string, skipDebounce = false) => {
    setFormData(prev => ({ ...prev, tokenAddress: value }))

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // If empty, reset validation
    if (!value.trim()) {
      setTokenValidation({ status: 'empty' })
      lastLookedUpAddressRef.current = ''
      return
    }

    // Check format
    if (!isValidAddressFormat(value)) {
      setTokenValidation({ status: 'invalid_format' })
      return
    }

    // If skipping debounce (e.g., paste), lookup immediately
    if (skipDebounce) {
      lookupToken(value)
      return
    }

    // Debounce the lookup
    debounceTimerRef.current = setTimeout(() => {
      lookupToken(value)
    }, 400)
  }, [lookupToken])

  // Pre-populate form from query params (for cloning)
  // Use searchParams.toString() as dependency to ensure effect runs when URL changes
  const searchParamsString = searchParams.toString()
  useEffect(() => {
    const tokenAddress = searchParams.get('token_address')
    const tokenSymbol = searchParams.get('token_symbol')
    const tokenName = searchParams.get('token_name')
    const strategyId = searchParams.get('strategy_id')
    const movingAvg = searchParams.get('moving_avg')
    const profitShare = searchParams.get('profit_share')
    const profitThreshold = searchParams.get('profit_threshold')

    console.log('🔍 Create page params:', { tokenAddress, tokenSymbol, tokenName, strategyId, movingAvg, profitShare, profitThreshold })

    if (tokenAddress || strategyId || movingAvg || profitShare || profitThreshold) {
      const newMovingAvg = movingAvg || '6'

      setFormData(prev => ({
        ...prev,
        tokenAddress: tokenAddress || prev.tokenAddress,
        strategyId: strategyId || prev.strategyId,
        movingAverage: newMovingAvg,
        profitShare: profitShare || prev.profitShare,
        profitThreshold: profitThreshold || prev.profitThreshold,
        // ETH amount stays empty for clones
      }))

      // Sync movingAvgInput with pre-populated value
      setMovingAvgInput(newMovingAvg)

      // If cloning with token_symbol, skip validation and mark as found
      if (tokenAddress && tokenSymbol) {
        lastLookedUpAddressRef.current = tokenAddress
        setTokenValidation({
          status: 'found',
          symbol: tokenSymbol,
          name: tokenName || undefined,
        })
      }
    }
  }, [searchParams, searchParamsString])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Fetch strategy options on page load
  useEffect(() => {
    const fetchStrategyOptions = async () => {
      setStrategyOptionsLoading(true)
      try {
        const token = await authenticate()
        if (!token) {
          setStrategyOptionsLoading(false)
          return
        }

        const response = await fetch('/api/strategies/options', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Strategy options response:', data)
          // Handle different response structures
          const options = Array.isArray(data) ? data : (data.strategies || data.options || [])
          setStrategyOptions(options)
        }
      } catch (error) {
        console.error('Error fetching strategy options:', error)
      } finally {
        setStrategyOptionsLoading(false)
      }
    }

    fetchStrategyOptions()
  }, [authenticate])

  useEffect(() => {
    async function initializePage() {
      try {
        setIsReady(true)

        const { sdk } = await import('@farcaster/miniapp-sdk')
        const inMiniApp = await sdk.isInMiniApp()
        setIsMiniApp(inMiniApp)

        if (inMiniApp) {
          await sdk.actions.ready()
          console.log('Create Bot page is ready!')
        } else {
          console.log('Not running in Mini App environment')
        }
      } catch (err) {
        console.error('Error initializing page:', err)
        setIsReady(true)
      }
    }

    initializePage()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    // For ethAmount, limit to 3 decimal places
    if (field === 'ethAmount') {
      const parts = value.split('.')
      if (parts[1] && parts[1].length > 3) {
        value = parts[0] + '.' + parts[1].substring(0, 3)
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEthAmountBlur = () => {
    const numValue = parseFloat(formData.ethAmount)
    if (formData.ethAmount !== '' && !isNaN(numValue) && numValue < 0.001) {
      setFormData(prev => ({
        ...prev,
        ethAmount: '0.001'
      }))
    }
  }

  // Handle slider change - updates both formData and input immediately
  const handleMovingAvgSliderChange = (value: string) => {
    setFormData(prev => ({ ...prev, movingAverage: value }))
    setMovingAvgInput(value)
  }

  // Handle input change - only updates input state while typing
  const handleMovingAvgInputChange = (value: string) => {
    setMovingAvgInput(value)
  }

  // Handle input blur/Enter - parse, clamp, and sync both states
  const handleMovingAvgInputCommit = () => {
    const value = movingAvgInput.trim()

    // If empty, revert to last valid value
    if (value === '') {
      setMovingAvgInput(formData.movingAverage)
      return
    }

    const numValue = parseInt(value, 10)
    if (!isNaN(numValue)) {
      // Clamp to [1, 60]
      let clampedValue = numValue
      if (clampedValue < 1) clampedValue = 1
      if (clampedValue > 60) clampedValue = 60

      const strValue = clampedValue.toString()
      setFormData(prev => ({ ...prev, movingAverage: strValue }))
      setMovingAvgInput(strValue)
    } else {
      // Invalid input, revert to last valid value
      setMovingAvgInput(formData.movingAverage)
    }
  }

  // Handle Enter key in input
  const handleMovingAvgInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleMovingAvgInputCommit()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const token = await authenticate()
      if (!token) {
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token_address: formData.tokenAddress,
          eth_amount: parseFloat(formData.ethAmount),
          moving_average: parseInt(formData.movingAverage),
          strategy_id: parseInt(formData.strategyId)
        })
      })

      console.log('Create Bot response status:', response.status, 'ok:', response.ok)

      if (response.ok) {
        const responseData = await response.json()
        console.log('Create Bot API response:', responseData)

        // Handle payment if required
        if (responseData.payment && isMiniApp) {
          try {
            console.log('Payment required:', responseData.payment)
            
            const { sdk } = await import('@farcaster/miniapp-sdk')
            
            // Check if we're on mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            console.log('Is mobile:', isMobile)
            
            let result
            try {
              // First get the user's account
              const accounts = await sdk.wallet.ethProvider.request({
                method: 'eth_requestAccounts',
              })
              
              console.log('Connected accounts:', accounts)
              
              if (!accounts || accounts.length === 0) {
                throw new Error('No accounts available')
              }
              
              // Ensure value is in correct format (hex string with 0x prefix)
              let valueHex = responseData.payment.value
              if (!valueHex.startsWith('0x')) {
                valueHex = `0x${parseInt(valueHex).toString(16)}`
              }
              
              console.log('Sending transaction with params:', {
                from: accounts[0],
                to: responseData.payment.to,
                value: valueHex
              })
              
              // Send ETH transaction
              result = await sdk.wallet.ethProvider.request({
                method: 'eth_sendTransaction',
                params: [{
                  from: accounts[0],
                  to: responseData.payment.to,
                  value: valueHex,
                }]
              })
              
              console.log('Payment transaction successful:', result)
            } catch (walletError: unknown) {
              // Check if user rejected the transaction
              const errorMessage = walletError instanceof Error ? walletError.message : String(walletError)
              const isUserRejection = errorMessage.toLowerCase().includes('user rejected') ||
                (walletError as { name?: string })?.name === 'UserRejectedRequestError'

              if (isUserRejection) {
                console.log('User cancelled wallet transaction')
                // User cancelled the transaction - cancel the pending bot funding
                console.log('User rejected transaction, cancelling funding for bot:', responseData.bot_id)
                try {
                  await fetch(`/api/bots/${responseData.bot_id}/cancel-funding`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  })
                } catch (cancelError) {
                  console.error('Failed to cancel funding:', cancelError)
                }
                // Silently redirect to My Bots
                router.push('/mini-app/my-bots')
                return
              }

              // Log actual errors
              console.error('Wallet transaction error:', walletError)
              throw walletError
            }
            
            // Send transaction hash to backend to confirm funding
            const botId = responseData.bot_id
            console.log('Sending tx_hash to fund endpoint for bot:', botId)
            
            await fetch(`/api/bots/${botId}/fund`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                tx_hash: result
              })
            })
            
          } catch (paymentError) {
            console.error('Payment transaction failed:', paymentError)
            alert('Bot created but payment failed. You can retry payment later from your bots list.')
            // Continue to redirect even if payment fails - user can retry later
          }
        }

        router.push('/mini-app/my-bots')
      } else {
        // Handle error response
        const responseText = await response.text()
        console.log('Raw response text:', responseText)
        let errorData = null
        try {
          errorData = JSON.parse(responseText)
          console.log('Parsed error response data:', JSON.stringify(errorData, null, 2))
        } catch (e) {
          console.log('Failed to parse response as JSON')
        }
        const errorMessage = errorData?.error || errorData?.message || `Failed to create bot (${response.status})`
        console.log('Error message to display:', errorMessage)
        setSubmitError(errorMessage)
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.error('Error creating bot:', err)
      setSubmitError('An unexpected error occurred. Please try again.')
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isReady) {
    return (
      <div style={styles.loadingContainerLight}>
        <p style={{ color: colors.white }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={styles.formContainer}>
      {/* Back Link */}
      <button
        onClick={() => {
          const from = searchParams.get('from')
          if (from === 'strategies') router.push('/mini-app/strategies')
          else if (from === 'leaderboard') router.push('/mini-app/leaderboard')
          else if (from === 'dashboard') router.push('/mini-app')
          else router.push('/mini-app/my-bots')
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          padding: '0',
          marginBottom: '16px',
          cursor: 'pointer',
          color: colors.primary,
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {(() => {
          const from = searchParams.get('from')
          if (from === 'strategies') return 'Strategies'
          if (from === 'leaderboard') return 'Leaderboard'
          if (from === 'dashboard') return 'Dashboard'
          return 'My Bots'
        })()}
      </button>

      {/* Header */}
      <div style={styles.formHeader}>
        <div>
          <h1 style={styles.formTitle}>
            Create Bot
          </h1>
          <p style={styles.formSubtitle}>
            Create a new bot
          </p>
        </div>
      </div>

      {/* Auth Error */}
      {authError && (
        <div style={styles.errorCard}>
          <h3 style={styles.errorTitle}>
            Authentication Error
          </h3>
          <p style={styles.errorText}>
            {authError}
          </p>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div style={{
          backgroundColor: '#fee',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: '#c00'
          }}>
            Error Creating Bot
          </h3>
          <p style={{
            color: '#c00',
            margin: 0,
            fontSize: '14px'
          }}>
            {submitError}
          </p>
        </div>
      )}

      {/* Form */}
      {!authError && (
        <form onSubmit={handleSubmit}>
          {/* Token Address */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Token Address
            </label>
            <input
              type="text"
              value={formData.tokenAddress}
              onChange={(e) => handleTokenAddressChange(e.target.value)}
              onPaste={(e) => {
                // Get pasted text and trigger immediate lookup
                const pastedText = e.clipboardData.getData('text')
                setTimeout(() => handleTokenAddressChange(pastedText, true), 0)
              }}
              placeholder="0x..."
              style={{
                ...styles.formInput,
                fontSize: '14px',
                borderColor: tokenValidation.status === 'found' ? '#22c55e' :
                             tokenValidation.status === 'not_found' ? '#ef4444' :
                             undefined
              }}
            />
            {/* Token validation status */}
            {tokenValidation.status === 'empty' && (
              <p style={{
                margin: '4px 0 0 0',
                color: colors.text.secondary,
                fontSize: '14px'
              }}>
                The Base contract address of the token
              </p>
            )}
            {tokenValidation.status === 'invalid_format' && (
              <p style={{
                margin: '4px 0 0 0',
                color: colors.text.secondary,
                fontSize: '14px'
              }}>
                Enter a valid Ethereum address (0x...)
              </p>
            )}
            {tokenValidation.status === 'pending' && (
              <p style={{
                margin: '4px 0 0 0',
                color: colors.text.secondary,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid #e5e5e5',
                  borderTopColor: colors.primary,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Validating token...
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </p>
            )}
            {tokenValidation.status === 'found' && (
              <p style={{
                margin: '4px 0 0 0',
                color: '#22c55e',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ✓ {tokenValidation.symbol} ({tokenValidation.name}) · {tokenValidation.chain}
              </p>
            )}
            {tokenValidation.status === 'not_found' && (
              <p style={{
                margin: '4px 0 0 0',
                color: '#ef4444',
                fontSize: '14px'
              }}>
                Token not found{tokenValidation.chain ? ` on ${tokenValidation.chain}` : ''}
              </p>
            )}
          </div>

          {/* ETH Amount */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              ETH Amount
            </label>
            <input
              type="number"
              value={formData.ethAmount}
              onChange={(e) => handleInputChange('ethAmount', e.target.value)}
              onBlur={handleEthAmountBlur}
              step="0.001"
              min="0.001"
              style={styles.formInput}
            />
          </div>

          {/* Strategy */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Strategy
            </label>
            <div
              onClick={() => setIsStrategyPickerOpen(true)}
              style={{
                ...styles.formInput,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: formData.strategyId ? colors.text.primary : '#9ca3af' }}>
                {formData.strategyId ? `#${formData.strategyId}` : 'Select...'}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Moving Average */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Moving Average (minutes)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={Math.min(20, Math.max(1, parseInt(formData.movingAverage) || 6))}
                onChange={(e) => handleMovingAvgSliderChange(e.target.value)}
                style={{
                  flex: 1,
                  height: '4px',
                  cursor: 'pointer',
                  accentColor: colors.primary,
                }}
              />
              <input
                type="text"
                inputMode="numeric"
                value={movingAvgInput}
                onChange={(e) => handleMovingAvgInputChange(e.target.value)}
                onBlur={handleMovingAvgInputCommit}
                onKeyDown={handleMovingAvgInputKeyDown}
                style={{
                  width: '48px',
                  padding: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: colors.background.card,
                  color: colors.text.primary,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Review Box - only shown when form is valid */}
          {isFormValid && (
            <div
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                animation: 'reviewFadeIn 0.15s ease-out',
              }}
            >
              <style>{`
                @keyframes reviewFadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(4px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Token</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#1c1c1e' }}>
                    {tokenValidation.symbol}
                    {tokenValidation.chain && <span style={{ color: '#888', fontWeight: '400' }}> · {tokenValidation.chain}</span>}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Address</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#1c1c1e', fontFamily: 'ui-monospace, monospace' }}>
                    {formData.tokenAddress.slice(0, 6)}…{formData.tokenAddress.slice(-4)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Strategy</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#1c1c1e' }}>
                    {selectedStrategyLabel}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Moving Avg</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#1c1c1e' }}>
                    {formData.movingAverage} min
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>ETH Amount</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#1c1c1e' }}>
                    {formData.ethAmount} ETH
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            style={isSubmitting || !isFormValid ? styles.submitButtonDisabled : styles.submitButton}
          >
            {isSubmitting ? 'Creating Bot...' : 'Create Bot'}
          </button>
        </form>
      )}

      {/* Strategy Picker Bottom Sheet */}
      {isStrategyPickerOpen && (
        <>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
          <div
            onClick={() => {
              setIsStrategyPickerOpen(false)
              setStrategySearchQuery('')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'flex-end',
              animation: 'fadeIn 0.2s ease',
              zIndex: 1001,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxHeight: '70vh',
                backgroundColor: '#fff',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                animation: 'slideUp 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                <div style={{ width: '36px', height: '4px', backgroundColor: '#ddd', borderRadius: '2px' }} />
              </div>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 16px 20px' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#1c1c1e' }}>Select Strategy</span>
                <button
                  onClick={() => {
                    setIsStrategyPickerOpen(false)
                    setStrategySearchQuery('')
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Input */}
              <div style={{ padding: '0 20px 12px 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '10px',
                  padding: '10px 14px',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search strategies..."
                    value={strategySearchQuery}
                    onChange={(e) => setStrategySearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'none',
                      marginLeft: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      color: '#333',
                    }}
                  />
                </div>
              </div>

              {/* Options List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 20px 12px 20px',
              }}>
                {strategyOptionsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                    Loading...
                  </div>
                ) : (
                  (() => {
                    const filteredOptions = strategyOptions.filter(option =>
                      option.label.toLowerCase().includes(strategySearchQuery.toLowerCase()) ||
                      option.strategy_id.includes(strategySearchQuery)
                    )

                    if (filteredOptions.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                          No strategies found
                        </div>
                      )
                    }

                    return filteredOptions.map((option) => (
                      <div
                        key={option.strategy_id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, strategyId: option.strategy_id }))
                          setIsStrategyPickerOpen(false)
                          setStrategySearchQuery('')
                        }}
                        style={{
                          padding: '2px 16px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          backgroundColor: formData.strategyId === option.strategy_id ? '#e0f7fa' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <span style={{
                            fontSize: '15px',
                            fontWeight: formData.strategyId === option.strategy_id ? '600' : '400',
                            color: formData.strategyId === option.strategy_id ? '#0097a7' : '#1c1c1e',
                          }}>
                            {option.label}
                          </span>
                          <div style={{
                            fontSize: '13px',
                            color: '#999',
                            fontWeight: '400',
                            marginTop: '1px',
                            marginLeft: '8px',
                          }}>
                            {option.creator_handle && <>by @{option.creator_handle}{option.bot_count > 0 && ' · '}</>}{option.bot_count > 0 && <>Used by <span style={{ color: '#777' }}>{option.bot_count}</span> bot{option.bot_count !== 1 ? 's' : ''}</>}
                          </div>
                        </div>
                        {formData.strategyId === option.strategy_id && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0097a7" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    ))
                  })()
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="my-bots" />
    </div>
  )
}

export default function CreateBotPage() {
  return (
    <Suspense fallback={<div style={styles.loadingContainerLight}><p style={{ color: colors.white }}>Loading...</p></div>}>
      <CreateBotContent />
    </Suspense>
  )
}