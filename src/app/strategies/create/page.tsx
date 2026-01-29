'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'
import { colors } from '@/styles/common'

function CreateStrategyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  // If strategy param is present, redirect to GammaScript page with it
  useEffect(() => {
    const strategy = searchParams.get('strategy')
    if (strategy) {
      router.replace(`/strategies/create/gammascript?strategy=${encodeURIComponent(strategy)}`)
    }
  }, [searchParams, router])

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
        {/* Back Link */}
        <button
          onClick={() => router.push('/strategies')}
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
          Strategies
        </button>

        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1a1a1a',
          margin: 0,
        }}>
          Create Strategy
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '4px 0 0 0',
        }}>
          Choose how you want to build your strategy
        </p>
      </div>

      {/* Selection Cards */}
      <div style={{
        flex: 1,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Use Builder Card */}
        <style>{`
          .create-card {
            background-color: #fff;
            border-radius: 16px;
            padding: 24px;
            border: 2px solid #e5e5e5;
            cursor: pointer;
            text-align: left;
            transition: background-color 0.15s, border-color 0.15s;
          }
          .create-card:hover {
            background-color: #fafafa;
          }
          .create-card:active {
            background-color: #f5f5f5;
          }
          .create-card-builder:hover {
            border-color: #14b8a6;
          }
          .create-card-gammascript:hover {
            border-color: #8b5cf6;
          }
        `}</style>
        <button
          className="create-card create-card-builder"
          onClick={() => router.push('/strategies/create/builder')}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#e0f7f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: 0,
            }}>
              Use Builder
            </h2>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '0 0 4px 0',
          }}>
            Visually build your trading strategy
          </p>
          <p style={{
            fontSize: '13px',
            color: '#14b8a6',
            fontWeight: '600',
            margin: 0,
          }}>
            Best for most users
          </p>
        </button>

        {/* Write GammaScript Card */}
        <button
          className="create-card create-card-gammascript"
          onClick={() => router.push('/strategies/create/gammascript')}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#f3e8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: 0,
            }}>
              Write GammaScript
            </h2>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '0 0 4px 0',
          }}>
            Write or paste GammaScript JSON
          </p>
          <p style={{
            fontSize: '13px',
            color: '#8b5cf6',
            fontWeight: '600',
            margin: 0,
          }}>
            Advanced users only
          </p>
        </button>

        {/* GammaScript Reference Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '8px',
        }}>
          <span
            onClick={() => router.push('/docs/gammascript-reference')}
            style={{
              fontSize: '14px',
              color: '#14b8a6',
              cursor: 'pointer',
            }}
          >
            → View GammaScript Reference
          </span>
        </div>
      </div>

      <BottomNavigation activeTab="strategies" />
    </div>
  )
}

export default function CreateStrategyPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#888' }}>Loading...</span>
      </div>
    }>
      <CreateStrategyPageContent />
    </Suspense>
  )
}
