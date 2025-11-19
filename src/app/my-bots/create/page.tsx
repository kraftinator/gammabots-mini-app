'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { styles, colors } from '@/styles/common'

export default function CreateBotPage() {
  const router = useRouter()
  const { authLoading, authError, authenticate } = useQuickAuth()
  const [isReady, setIsReady] = useState(false)
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)
  const [formData, setFormData] = useState({
    tokenAddress: '',
    ethAmount: '0.01',
    movingAverage: '6',
    strategyId: '',
    profitShare: '50',
    profitThreshold: '15'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
      } catch (error) {
        console.error('Error initializing page:', error)
        setIsReady(true)
      }
    }

    initializePage()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    // For ethAmount, limit to 4 decimal places
    if (field === 'ethAmount') {
      const parts = value.split('.')
      if (parts[1] && parts[1].length > 4) {
        value = parts[0] + '.' + parts[1].substring(0, 4)
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEthAmountBlur = () => {
    const numValue = parseFloat(formData.ethAmount)
    if (formData.ethAmount !== '' && !isNaN(numValue) && numValue < 0.0001) {
      setFormData(prev => ({
        ...prev,
        ethAmount: '0.0001'
      }))
    }
  }

  const handlePercentageBlur = (field: 'profitShare' | 'profitThreshold', defaultValue: string) => {
    const value = formData[field]

    // If empty, set to default
    if (value === '' || value === undefined) {
      setFormData(prev => ({
        ...prev,
        [field]: defaultValue
      }))
      return
    }

    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      // Truncate to whole number
      let correctedValue = Math.floor(numValue)
      if (correctedValue < 0) correctedValue = 0
      if (correctedValue > 100) correctedValue = 100

      setFormData(prev => ({
        ...prev,
        [field]: correctedValue.toString()
      }))
    } else {
      // If not a valid number, set to default
      setFormData(prev => ({
        ...prev,
        [field]: defaultValue
      }))
    }
  }

  const handleStrategyBlur = () => {
    const value = formData.strategyId

    // If empty, set to default
    if (value === '' || value === undefined) {
      setFormData(prev => ({
        ...prev,
        strategyId: '1'
      }))
      return
    }

    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      // Truncate to whole number, minimum 1
      let correctedValue = Math.floor(numValue)
      if (correctedValue < 1) correctedValue = 1

      setFormData(prev => ({
        ...prev,
        strategyId: correctedValue.toString()
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        strategyId: '1'
      }))
    }
  }

  const handleMovingAverageBlur = () => {
    const value = formData.movingAverage

    // If empty, set to default
    if (value === '' || value === undefined) {
      setFormData(prev => ({
        ...prev,
        movingAverage: '6'
      }))
      return
    }

    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      // Truncate to whole number, range 1-60
      let correctedValue = Math.floor(numValue)
      if (correctedValue < 1) correctedValue = 1
      if (correctedValue > 60) correctedValue = 60

      setFormData(prev => ({
        ...prev,
        movingAverage: correctedValue.toString()
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        movingAverage: '6'
      }))
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
            } catch (walletError) {
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
        
        router.push('/my-bots')
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
    } catch (error) {
      console.error('Error creating bot:', error)
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
      {/* Header */}
      <div style={styles.formHeader}>
        <div>
          <h1 style={styles.formTitle}>
            Create Bot
          </h1>
          <p style={styles.formSubtitle}>
            Set up your new trading bot
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
              onChange={(e) => handleInputChange('tokenAddress', e.target.value)}
              placeholder="0x..."
              style={styles.formInput}
            />
            <p style={{
              margin: '4px 0 0 0',
              color: colors.text.secondary,
              fontSize: '14px'
            }}>
              The Base contract address of the token
            </p>
          </div>

          {/* ETH Amount */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Starting ETH Amount
            </label>
            <input
              type="number"
              value={formData.ethAmount}
              onChange={(e) => handleInputChange('ethAmount', e.target.value)}
              onBlur={handleEthAmountBlur}
              step="0.0001"
              min="0.0001"
              style={styles.formInput}
            />
            <p style={{
              margin: '4px 0 0 0',
              color: colors.text.secondary,
              fontSize: '14px'
            }}>
              Amount of ETH to fund the bot
            </p>
          </div>

          {/* Strategy and Moving Average */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.formLabel}>
                Strategy
              </label>
              <style>{`
                input[type=number].no-spinner::-webkit-outer-spin-button,
                input[type=number].no-spinner::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                input[type=number].no-spinner {
                  -moz-appearance: textfield;
                }
              `}</style>
              <input
                type="number"
                className="no-spinner"
                value={formData.strategyId}
                onChange={(e) => handleInputChange('strategyId', e.target.value)}
                onBlur={handleStrategyBlur}
                min="1"
                step="1"
                style={styles.formInput}
              />
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.formLabel}>
                Moving Average
              </label>
              <input
                type="number"
                value={formData.movingAverage}
                onChange={(e) => handleInputChange('movingAverage', e.target.value)}
                onBlur={handleMovingAverageBlur}
                min="1"
                max="60"
                step="1"
                style={styles.formInput}
              />
            </div>
          </div>

          {/* Profit Share and Profit Threshold */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.formLabel}>
                Profit Share
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={formData.profitShare}
                  onChange={(e) => handleInputChange('profitShare', e.target.value)}
                  onBlur={() => handlePercentageBlur('profitShare', '50')}
                  min="0"
                  max="100"
                  step="1"
                  style={{ ...styles.formInput, paddingRight: '32px' }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.text.secondary,
                  pointerEvents: 'none'
                }}>%</span>
              </div>
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.formLabel}>
                Profit Threshold
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={formData.profitThreshold}
                  onChange={(e) => handleInputChange('profitThreshold', e.target.value)}
                  onBlur={() => handlePercentageBlur('profitThreshold', '15')}
                  min="0"
                  max="100"
                  step="1"
                  style={{ ...styles.formInput, paddingRight: '32px' }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.text.secondary,
                  pointerEvents: 'none'
                }}>%</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={isSubmitting ? styles.submitButtonDisabled : styles.submitButton}
          >
            {isSubmitting ? 'Creating Bot...' : 'Create Trading Bot'}
          </button>
        </form>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="my-bots" />
    </div>
  )
}