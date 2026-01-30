'use client'

import Link from 'next/link'
import { Home, Bot, Trophy, GitBranch, Settings } from 'lucide-react'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { styles, colors } from '@/styles/common'

interface BottomNavigationProps {
  activeTab: 'home' | 'my-bots' | 'leaderboard' | 'strategies' | 'settings'
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const { authLoading, navigateToMyBots } = useQuickAuth()

  // Handle My Bots navigation with Quick Auth
  const handleMyBotsClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    await navigateToMyBots()
  }
  return (
    <div style={styles.bottomNav}>
      <NavItem
        label="Home"
        icon={Home}
        active={activeTab === 'home'}
        href="/mini-app"
      />
      <NavItem
        label="My Bots"
        icon={Bot}
        active={activeTab === 'my-bots'}
        href="/mini-app/my-bots"
        onClick={activeTab !== 'my-bots' ? handleMyBotsClick : undefined}
        loading={authLoading}
      />
      <NavItem
        label="Leaderboard"
        icon={Trophy}
        active={activeTab === 'leaderboard'}
        href="/mini-app/leaderboard"
      />
      <NavItem
        label="Strategies"
        icon={GitBranch}
        active={activeTab === 'strategies'}
        href="/mini-app/strategies"
      />
      <NavItem
        label="Settings"
        icon={Settings}
        active={activeTab === 'settings'}
        href="/mini-app/settings"
      />
    </div>
  )
}

function NavItem({
  label,
  icon: Icon,
  active = false,
  href,
  onClick,
  loading = false
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  active?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  loading?: boolean;
}) {
  const color = active ? colors.secondary : '#c7c7cc'

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flex: 1,
    padding: '8px 0',
    textDecoration: 'none',
    cursor: active ? 'default' : 'pointer',
    color
  }

  const content = (
    <>
      <Icon size={30} color={color} />
      <div style={{
        width: 20,
        height: 3,
        backgroundColor: active ? colors.secondary : 'transparent',
        borderRadius: 2,
        marginTop: 4
      }} />
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