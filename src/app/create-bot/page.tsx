'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { styles, colors } from '@/styles/common'

export default function CreateBotPage() {
  const router = useRouter()
  const { authLoading, authError, authenticate } = useQuickAuth()
  const [formData, setFormData] = useState({
    tokenAddress: '',
    ethAmount: '0.1',
    movingAverage: '20',
    strategyId: '1'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement bot creation logic
    console.log('Creating bot with data:', formData)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.black,
      color: colors.white,
      ...styles.contentPadding
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={styles.heading1}>
            Create Bot
          </h1>
          <p style={{
            margin: 0,
            color: colors.text.secondary,
            fontSize: '14px'
          }}>
            Set up your new trading bot
          </p>
        </div>
      </div>

      {/* Auth Error */}
      {authError && (
        <div style={{
          backgroundColor: '#332211',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid #664433'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: colors.warning
          }}>
            Authentication Required
          </h3>
          <p style={{
            color: colors.warning,
            margin: 0,
            fontSize: '14px'
          }}>
            {authError}
          </p>
        </div>
      )}

      {/* Form */}
      {!authError && (
        <form onSubmit={handleSubmit}>
          {/* Token Address */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px',
              color: colors.white
            }}>
              Token Address
            </label>
            <input
              type="text"
              value={formData.tokenAddress}
              onChange={(e) => handleInputChange('tokenAddress', e.target.value)}
              placeholder="0x..."
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #333',
                backgroundColor: colors.background.darkCard,
                color: colors.white,
                fontSize: '16px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
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
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px',
              color: colors.white
            }}>
              ETH Amount
            </label>
            <input
              type="number"
              value={formData.ethAmount}
              onChange={(e) => handleInputChange('ethAmount', e.target.value)}
              step="0.01"
              min="0"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #333',
                backgroundColor: colors.background.darkCard,
                color: colors.white,
                fontSize: '16px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
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
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px',
              color: colors.white
            }}>
              Moving Average
            </label>
            <input
              type="number"
              value={formData.movingAverage}
              onChange={(e) => handleInputChange('movingAverage', e.target.value)}
              min="1"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #333',
                backgroundColor: colors.background.darkCard,
                color: colors.white,
                fontSize: '16px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
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
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px',
              color: colors.white
            }}>
              Strategy ID
            </label>
            <input
              type="number"
              value={formData.strategyId}
              onChange={(e) => handleInputChange('strategyId', e.target.value)}
              min="1"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #333',
                backgroundColor: colors.background.darkCard,
                color: colors.white,
                fontSize: '16px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <p style={{
              margin: '4px 0 0 0',
              color: colors.text.secondary,
              fontSize: '14px'
            }}>
              Trading strategy identifier
            </p>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div style={{
              backgroundColor: '#331111',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #664444'
            }}>
              <p style={{
                color: colors.error,
                margin: 0,
                fontSize: '14px'
              }}>
                {submitError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            style={{
              ...styles.buttonPrimary,
              width: '100%',
              backgroundColor: isSubmitting ? colors.gray[600] : colors.secondary,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1
            }}
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