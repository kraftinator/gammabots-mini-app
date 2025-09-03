'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { styles, colors } from '@/styles/common'

interface BottomNavigationProps {
  activeTab: 'home' | 'my-bots' | 'leaderboard' | 'strategies'
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const router = useRouter()
  const { authLoading, navigateToMyBots } = useQuickAuth()

  // Handle My Bots navigation with Quick Auth
  const handleMyBotsClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    await navigateToMyBots()
  }
  return (
    <div style={styles.bottomNav}>
      <NavItem 
        label="HOME" 
        active={activeTab === 'home'} 
        href="/" 
      />
      <NavItem 
        label="MY BOTS" 
        active={activeTab === 'my-bots'} 
        href="/my-bots"
        onClick={activeTab !== 'my-bots' ? handleMyBotsClick : undefined}
        loading={authLoading}
      />
      <NavItem 
        label="LEADERBOARD" 
        active={activeTab === 'leaderboard'} 
        href="/leaderboard" 
      />
      <NavItem 
        label="STRATEGIES" 
        active={activeTab === 'strategies'} 
        href="/strategies" 
      />
    </div>
  )
}

function NavItem({ 
  label, 
  active = false, 
  href, 
  onClick, 
  loading = false 
}: { 
  label: string; 
  active?: boolean; 
  href?: string; 
  onClick?: (e: React.MouseEvent) => void;
  loading?: boolean;
}) {
  const style = {
    ...styles.navItem,
    color: active ? colors.secondary : colors.text.secondary
  }

  const content = (
    <>
      {loading ? "..." : label}
      {active && (
        <div style={styles.navIndicator}></div>
      )}
    </>
  )

  // If there's an onClick handler, use a div with onClick
  if (onClick && !active) {
    return (
      <div style={style} onClick={onClick}>
        {content}
      </div>
    )
  }

  // If there's a href and no onClick, use Link
  if (href && !active && !onClick) {
    return (
      <Link href={href} style={style}>
        {content}
      </Link>
    )
  }

  // Active tab or fallback
  return (
    <div style={style}>
      {content}
    </div>
  )
}