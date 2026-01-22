'use client'

import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'

export default function WhatIsGammascriptPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px'
    }}>
      <div style={{
        padding: '16px',
        backgroundColor: '#fff',
      }}>
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            padding: '0',
            marginBottom: '16px',
            cursor: 'pointer',
            color: '#14b8a6',
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
          What is Gammascript?
        </h1>
      </div>

      <div style={{
        flex: 1,
        padding: '16px',
      }}>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Documentation content coming soon.
        </p>
      </div>

      <BottomNavigation />
    </div>
  )
}
