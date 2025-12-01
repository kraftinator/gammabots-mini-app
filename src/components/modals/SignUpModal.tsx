'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import TermsContent from '../content/TermsContent'
import PrivacyContent from '../content/PrivacyContent'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  redirectTo?: string
}

export default function SignUpModal({ isOpen, onClose, onSuccess, redirectTo = '/my-bots' }: SignUpModalProps) {
  const router = useRouter()
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [currentView, setCurrentView] = useState<'signup' | 'terms' | 'privacy'>('signup')
  const { authenticate } = useQuickAuth()

  const handleContinue = async () => {
    try {
      console.log('Starting sign up...')

      // Get auth token first
      const token = await authenticate()
      if (!token) {
        alert('Unable to authenticate. Please try again.')
        return
      }
      console.log('Auth token obtained')

      // Load Farcaster SDK
      const { sdk } = await import('@farcaster/miniapp-sdk')
      console.log('SDK loaded')

      // Check if in mini app
      const inMiniApp = await sdk.isInMiniApp()
      console.log('In mini app:', inMiniApp)

      if (!inMiniApp) {
        alert('This feature is only available in the Farcaster Mini App')
        return
      }

      // Get user context
      const context = await sdk.context
      console.log('User context:', context)

      if (!context?.user) {
        alert('Unable to get user information')
        return
      }

      // Get wallet accounts
      console.log('Requesting accounts...')
      const accounts = await sdk.wallet.ethProvider.request({
        method: 'eth_requestAccounts',
      })
      console.log('Accounts:', accounts)

      if (!accounts || accounts.length === 0) {
        alert('No wallet accounts available')
        return
      }

      const walletAddress = accounts[0]
      const timestamp = new Date().toISOString()
      const message = `Gammabots Sign Up

I confirm that I own this wallet and agree to the Gammabots Terms of Service and Privacy Policy.

This signature does NOT perform an on-chain transaction and is free of gas fees.


FID: ${context.user.fid}
Timestamp: ${timestamp}`

      // Convert message to hex
      const messageHex = '0x' + Array.from(new TextEncoder().encode(message))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      console.log('Requesting signature for message:', message)
      console.log('Message hex:', messageHex)

      // Request signature
      const signature = await sdk.wallet.ethProvider.request({
        method: 'personal_sign',
        params: [messageHex, walletAddress]
      })

      console.log('Signature received:', signature)

      // POST to /api/users
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          signature,
          message,
          wallet_address: walletAddress,
          farcaster_username: context.user.username,
          farcaster_avatar: context.user.pfpUrl,
          fid: context.user.fid,
          signed_at: timestamp
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create account')
        return
      }

      // Success - close modal, refresh dashboard, and redirect
      onClose()
      if (onSuccess) {
        onSuccess()
      }
      router.push(redirectTo)
    } catch (error) {
      console.error('Sign up error:', error)
      alert('An error occurred during sign up. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '400px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: '1px solid #e5e5e7',
          position: 'relative'
        }}>
          {currentView !== 'signup' ? (
            <button
              onClick={() => setCurrentView('signup')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                color: '#7c65c1',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← Back
            </button>
          ) : (
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1c1c1e',
              margin: 0,
              paddingRight: '40px'
            }}>
              Create Your Account
            </h2>
          )}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#8e8e93',
              padding: '4px',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        {currentView === 'terms' ? (
          <div style={{ padding: '24px', fontSize: '14px', lineHeight: '1.6', color: '#1c1c1e', overflowY: 'auto', maxHeight: '70vh' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>Terms of Service</h2>
            <TermsContent />
          </div>
        ) : currentView === 'privacy' ? (
          <div style={{ padding: '24px', fontSize: '14px', lineHeight: '1.6', color: '#1c1c1e', overflowY: 'auto', maxHeight: '70vh' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>Privacy Policy</h2>
            <PrivacyContent />
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#1c1c1e',
              marginBottom: '24px'
            }}>
              We&apos;ll create a secure trading wallet for your bots. This is free &mdash; no gas or transactions required.
            </p>

            {/* Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '2px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              />
              <span style={{
                fontSize: '14px',
                color: '#1c1c1e',
                lineHeight: '1.5'
              }}>
                I agree to the{' '}
                <span
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentView('terms')
                  }}
                  style={{
                    color: '#7c65c1',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Terms of Service
                </span>
                {' '}and{' '}
                <span
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentView('privacy')
                  }}
                  style={{
                    color: '#7c65c1',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Privacy Policy
                </span>
                .
              </span>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!agreedToTerms}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: agreedToTerms ? '#7c65c1' : '#d1d1d6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: agreedToTerms ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
