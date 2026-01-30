'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'
import Footer from '@/components/layout/Footer'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { useMe } from '@/contexts/MeContext'
import SignUpModal from '@/components/modals/SignUpModal'

export default function SettingsPage() {
  const router = useRouter()
  const { authenticate } = useQuickAuth()
  const { me, fetchMe } = useMe()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)

  // Check if user exists (has signed up)
  const userExists = me?.user_exists === true
  const walletAddress = me?.wallet_address

  useEffect(() => {
    const initPage = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.ready()

        const token = await authenticate()
        if (!token) {
          setError('Settings cannot be loaded at this time. Please try again later.')
          setLoading(false)
          return
        }

        // Fetch user data
        await fetchMe(token)
      } catch (err) {
        console.error('Error loading settings:', err)
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [authenticate, fetchMe])

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px 16px',
        backgroundColor: '#fff',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1a1a1a',
          margin: 0,
        }}>
          Settings
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 16px' }}>
        {loading && (
          <p style={{ fontSize: '14px', color: '#8e8e93' }}>
            Loading...
          </p>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #fcc',
          }}>
            <p style={{ fontSize: '14px', color: '#c00', margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Sign Up Button - shown if user hasn't signed up */}
        {!loading && !error && !userExists && (
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setSignUpModalOpen(true)}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {!loading && !error && walletAddress && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e5e5e5',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#8e8e93',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Gammabots Wallet Address
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1c1c1e',
                fontFamily: 'monospace',
              }}>
                {truncateAddress(walletAddress)}
              </span>
              <button
                onClick={copyAddress}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  backgroundColor: copied ? '#d1fae5' : '#f5f5f5',
                  border: '1px solid',
                  borderColor: copied ? '#6ee7b7' : '#e5e5e5',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: copied ? '#047857' : '#666',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Documentation */}
        {!loading && !error && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e5e5e5',
            marginTop: '16px',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#8e8e93',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Help & Documentation
            </div>
            <span
              onClick={() => router.push('/mini-app/docs')}
              style={{
                fontSize: '15px',
                color: '#14b8a6',
                cursor: 'pointer',
              }}
            >
              → View Documentation
            </span>
          </div>
        )}
      </div>

      {/* Spacer to push footer to bottom */}
      <div style={{ flex: 1 }} />

      <Footer />
      <BottomNavigation activeTab="settings" />

      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        onSuccess={async () => {
          const token = await authenticate()
          if (token) {
            await fetchMe(token)
          }
        }}
        redirectTo="/mini-app/settings"
      />
    </div>
  )
}
