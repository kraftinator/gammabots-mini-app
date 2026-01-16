'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { useMe } from '@/contexts/MeContext'
import { getProfitColor } from '@/styles/common'
import { formatActiveTime } from '@/utils/formatters'
import BottomNavigation from '@/components/BottomNavigation'
import BotDetailModal, { Bot } from '@/components/modals/BotDetailModal'
import SignUpModal from '@/components/modals/SignUpModal'

interface LeaderboardBot {
  rank: number
  bot_id: string
  token_symbol: string
  token_name?: string
  token_address?: string
  strategy_id: string
  owner_farcaster_username: string
  owner_farcaster_avatar_url?: string
  active_seconds: number
  performance_pct: number
  cloneable: boolean
  moving_average?: number
  profit_share?: number
  profit_threshold?: number
  trades?: number
  display_name: string
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { authenticate } = useQuickAuth()
  const { me, fetchMe } = useMe()
  const [bots, setBots] = useState<LeaderboardBot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [timePeriod, setTimePeriod] = useState('all_time')

  // Bot detail modal state
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sign up modal state
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)
  const [signUpRedirectTo, setSignUpRedirectTo] = useState<string>('/my-bots')

  // Check if user exists (has signed up)
  const userExists = me?.user_exists === true

  useEffect(() => {
    const initSdk = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.ready()

        // Fetch user data to check if signed up
        const token = await authenticate()
        if (token) {
          await fetchMe(token)
        }
      } catch (err) {
        console.error('Failed to initialize SDK:', err)
      }
    }
    initSdk()
  }, [])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/leaderboard?timeframe=${timePeriod}`)

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard')
        }

        const data = await response.json()
        setBots(Array.isArray(data) ? data : data.bots || [])
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        setError('Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [timePeriod])

  // Client-side search filtering
  const filteredBots = useMemo(() => {
    if (!searchQuery.trim()) return bots

    const query = searchQuery.toLowerCase()
    return bots.filter(bot =>
      bot.display_name?.toLowerCase().includes(query) ||
      bot.token_symbol?.toLowerCase().includes(query) ||
      bot.owner_farcaster_username?.toLowerCase().includes(query)
    )
  }, [bots, searchQuery])

  // Handle bot click to show details (public view only)
  const handleBotClick = (bot: LeaderboardBot) => {
    setSelectedBot({
      bot_id: bot.bot_id,
      token_symbol: bot.token_symbol,
      token_name: bot.token_name,
      token_address: bot.token_address,
      strategy_id: bot.strategy_id,
      moving_average: bot.moving_average,
      profit_share: bot.profit_share,
      profit_threshold: bot.profit_threshold,
      profit_percent: bot.performance_pct,
      trades: bot.trades,
      active_seconds: bot.active_seconds,
      owner_farcaster_username: bot.owner_farcaster_username,
      status: 'active',
      display_name: bot.display_name,
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBot(null)
  }

  const handleClone = async (bot: LeaderboardBot, e: React.MouseEvent) => {
    e.stopPropagation()

    const params = new URLSearchParams()
    params.set('from', 'leaderboard')
    if (bot.token_address) params.set('token_address', bot.token_address)
    if (bot.token_symbol) params.set('token_symbol', bot.token_symbol)
    if (bot.token_name) params.set('token_name', bot.token_name)
    if (bot.strategy_id) params.set('strategy_id', bot.strategy_id)
    if (bot.moving_average) params.set('moving_avg', bot.moving_average.toString())
    if (bot.profit_share !== undefined) params.set('profit_share', bot.profit_share.toString())
    if (bot.profit_threshold !== undefined) params.set('profit_threshold', bot.profit_threshold.toString())

    const redirectUrl = `/my-bots/create?${params.toString()}`

    // If user hasn't signed up, show signup modal
    if (!userExists) {
      setSignUpRedirectTo(redirectUrl)
      setSignUpModalOpen(true)
      return
    }

    // Try to authenticate
    const token = await authenticate()
    if (!token) {
      return
    }

    router.push(redirectUrl)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px'
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
          margin: '0 0 16px 0',
        }}>
          Leaderboard
        </h1>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '12px',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search bot, token, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              marginLeft: '10px',
              fontSize: '14px',
              outline: 'none',
              color: '#333',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#333',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">All Bots</option>
            <option value="strategy" disabled>By Strategy</option>
            <option value="token" disabled>By Token</option>
          </select>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#333',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all_time">All-time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Bot List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px 16px',
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            Loading...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {!loading && !error && filteredBots.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            No bots found
          </div>
        )}

        {!loading && !error && filteredBots.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredBots.map((bot) => (
              <div
                key={bot.bot_id}
                onClick={() => handleBotClick(bot)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {/* Rank Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '12px',
                  backgroundColor: '#aaa',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '1px 8px',
                  borderRadius: '10px',
                  minWidth: '38px',
                  textAlign: 'center',
                }}>
                  {bot.rank}
                </div>

                {/* Header Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  marginTop: '0px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Avatar */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      {bot.owner_farcaster_avatar_url ? (
                        <img
                          src={bot.owner_farcaster_avatar_url.replace('/rectcrop3', '/original')}
                          alt={bot.owner_farcaster_username}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <span style={{ color: '#888' }}>?</span>
                      )}
                    </div>
                    {/* Name + Owner */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1c1c1e' }}>
                          {bot.display_name.length > 18 ? `${bot.display_name.slice(0, 18)}...` : bot.display_name}
                        </span>
                      </div>
                      <span style={{ fontSize: '13px', color: '#666' }}>
                        @{bot.owner_farcaster_username || 'unknown'}
                      </span>
                    </div>
                  </div>
                  {/* Clone Button */}
                  <button
                    onClick={(e) => handleClone(bot, e)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#f5f5f5',
                      border: '1px solid #e5e5e5',
                      fontSize: '11px',
                      color: '#666',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '3px 10px',
                      borderRadius: '14px',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Clone
                  </button>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {/* Left side - details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#adadad', width: '80px', fontWeight: '400', flexShrink: 0 }}>Strategy:</span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0097a7',
                        backgroundColor: '#e0f7fa',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        lineHeight: '18px',
                      }}>
                        #{bot.strategy_id}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#adadad', width: '80px', fontWeight: '400', flexShrink: 0 }}>Active For:</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1c1c1e' }}>
                        {formatActiveTime(Number(bot.active_seconds) || 0)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#adadad', width: '80px', fontWeight: '400', flexShrink: 0 }}>Total Trades:</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1c1c1e' }}>
                        {Number(bot.trades) || 0}
                      </span>
                    </div>
                  </div>

                  {/* Right side - performance */}
                  <div style={{ textAlign: 'right', marginTop: '2px' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: getProfitColor(Number(bot.performance_pct) || 0),
                    }}>
                      {Number(bot.performance_pct) > 0 ? '+' : ''}{Number(bot.performance_pct || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation activeTab="leaderboard" />

      <BotDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bot={selectedBot}
        from="leaderboard"
        userExists={userExists}
        onSignUpRequired={(redirectUrl) => {
          setSignUpRedirectTo(redirectUrl)
          setSignUpModalOpen(true)
        }}
      />

      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        onSuccess={async () => {
          const token = await authenticate()
          if (token) {
            await fetchMe(token)
          }
        }}
        redirectTo={signUpRedirectTo}
      />
    </div>
  )
}
