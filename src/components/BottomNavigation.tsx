'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuickAuth } from '@/hooks/useQuickAuth'

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
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "420px",
      maxWidth: "100vw",
      background: "white",
      borderTop: "1px solid #f2f2f7",
      display: "flex",
      zIndex: 5,
      boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.08)",
      borderRadius: "20px 20px 0 0"
    }}>
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
    flex: 1,
    padding: "12px 8px 16px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: active ? "#8b5cf6" : "#8e8e93",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: "8px 4px",
    position: "relative" as const,
    textDecoration: "none"
  }

  const content = (
    <>
      {loading ? "..." : label}
      {active && (
        <div style={{
          content: '',
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "20px",
          height: "3px",
          background: "#8b5cf6",
          borderRadius: "1px"
        }}></div>
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