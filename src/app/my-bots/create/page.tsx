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
    tokenAddress: '0x18b6f6049a0af4ed2bbe0090319174eeef89f53a',
    ethAmount: '0.0001',
    movingAverage: '20',
    strategyId: '1'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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
      }
    } catch (error) {
      console.error('Error creating bot:', error)
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
              Enter the contract address of the token
            </p>
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
              step="0.001"
              min="0.0001"
              style={styles.formInput}
            />
            <p style={{
              margin: '4px 0 0 0',
              color: colors.text.secondary,
              fontSize: '14px'
            }}>
              Amount of ETH to use per trade
            </p>
          </div>

          {/* Moving Average */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Moving Average
            </label>
            <input
              type="number"
              value={formData.movingAverage}
              onChange={(e) => handleInputChange('movingAverage', e.target.value)}
              min="1"
              style={styles.formInput}
            />
            <p style={{
              margin: '4px 0 0 0',
              color: colors.text.secondary,
              fontSize: '14px'
            }}>
              Moving average period
            </p>
          </div>

          {/* Strategy ID */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              Strategy ID
            </label>
            <input
              type="number"
              value={formData.strategyId}
              onChange={(e) => handleInputChange('strategyId', e.target.value)}
              min="1"
              style={styles.formInput}
            />
            <p style={{
              margin: '4px 0 0 0',
              color: colors.text.secondary,
              fontSize: '14px'
            }}>
              Trading strategy identifier
            </p>
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