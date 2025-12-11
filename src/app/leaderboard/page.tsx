'use client'

import { useEffect } from 'react'
import BottomNavigation from '@/components/BottomNavigation'
import { styles } from '@/styles/common'

export default function LeaderboardPage() {
  useEffect(() => {
    const initSdk = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.ready()
      } catch (error) {
        console.error('Failed to initialize SDK:', error)
      }
    }

    initSdk()
  }, [])

  return (
    <div style={styles.formContainer}>
      <div style={{ padding: '20px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1c1c1e',
          marginBottom: '8px'
        }}>
          Leaderboard
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#8e8e93'
        }}>
          Coming soon
        </p>
      </div>
      <BottomNavigation activeTab="leaderboard" />
    </div>
  )
}
