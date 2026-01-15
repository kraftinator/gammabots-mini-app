'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { useMe } from '@/contexts/MeContext'
import { getProfitColor } from '@/styles/common'
import BottomNavigation from '@/components/BottomNavigation'
import StrategyDetailModal from '@/components/modals/StrategyDetailModal'
import SignUpModal from '@/components/modals/SignUpModal'
import { formatDistanceToNow } from 'date-fns'

interface Strategy {
  strategy_id: string
  creator_address: string
  creator_handle?: string
  created_at: string
  bots_count: number
  performance_pct?: number
}

function StrategiesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authenticate } = useQuickAuth()
  const { me, fetchMe } = useMe()
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('performance')
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)

  // Sign up modal state
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)
  const [signUpRedirectTo, setSignUpRedirectTo] = useState<string>('/my-bots')

  // Check if user exists (has signed up)
  const userExists = me?.user_exists === true

  // Check for view query parameter to open modal
  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId) {
      setSelectedStrategyId(viewId)
      // Clear the query parameter from URL without navigation
      router.replace('/strategies', { scroll: false })
    }
  }, [searchParams, router])

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
    const fetchStrategies = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/strategies')

        if (!response.ok) {
          throw new Error('Failed to fetch strategies')
        }

        const data = await response.json()
        console.log('Strategies API response:', data)
        setStrategies(Array.isArray(data) ? data : data.strategies || [])
      } catch (err) {
        console.error('Error fetching strategies:', err)
        setError('Failed to load strategies')
      } finally {
        setLoading(false)
      }
    }

    fetchStrategies()
  }, [])

  // Client-side search filtering and sorting
  const filteredAndSortedStrategies = useMemo(() => {
    let filtered = strategies

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = strategies.filter(strategy =>
        strategy.strategy_id?.toLowerCase().includes(query) ||
        strategy.creator_handle?.toLowerCase().includes(query)
      )
    }

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return parseInt(a.strategy_id) - parseInt(b.strategy_id)
        case 'bots':
          return (Number(b.bots_count) || 0) - (Number(a.bots_count) || 0)
        case 'performance':
          return (Number(b.performance_pct) || 0) - (Number(a.performance_pct) || 0)
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'creator':
          return (a.creator_handle || '').localeCompare(b.creator_handle || '')
        default:
          return 0
      }
    })
  }, [strategies, searchQuery, sortBy])

  // Handle Create Strategy - requires auth
  const handleCreateStrategy = async () => {
    const redirectUrl = '/strategies/create'

    // If user hasn't signed up, show signup modal
    if (!userExists) {
      setSignUpRedirectTo(redirectUrl)
      setSignUpModalOpen(true)
      return
    }

    const token = await authenticate()
    if (!token) {
      return
    }
    router.push(redirectUrl)
  }

  // Handle Create Bot - requires auth
  const handleCreateBot = async (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation()

    const redirectUrl = `/my-bots/create?strategy_id=${strategy.strategy_id}&from=strategies`

    // If user hasn't signed up, show signup modal
    if (!userExists) {
      setSignUpRedirectTo(redirectUrl)
      setSignUpModalOpen(true)
      return
    }

    const token = await authenticate()
    if (!token) {
      return
    }

    router.push(redirectUrl)
  }

  // Format created date
  const formatCreatedDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px'
    }}>
      {/* Header - Title + Create Strategy (scrolls away) */}
      <div style={{
        padding: '16px 16px 12px 16px',
        backgroundColor: '#fff',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0,
          }}>
            Strategies
          </h1>
          <button
            onClick={handleCreateStrategy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#14b8a6',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Strategy
          </button>
        </div>
      </div>

      {/* Sticky Controls - Search + Sort */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
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
            placeholder="Search strategies..."
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

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            width: '100%',
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
          <option value="id">Sort by ID</option>
          <option value="bots"># of Bots</option>
          <option value="performance">Performance</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="creator">Creator</option>
        </select>
      </div>

      {/* Strategy List */}
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

        {!loading && !error && filteredAndSortedStrategies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            No strategies found
          </div>
        )}

        {!loading && !error && filteredAndSortedStrategies.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAndSortedStrategies.map((strategy, index) => (
              <div
                key={`${strategy.strategy_id}-${strategy.creator_address}-${index}`}
                onClick={() => setSelectedStrategyId(strategy.strategy_id)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                }}
              >
                {/* Header Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <div>
                    {/* Strategy ID Pill */}
                    <span style={{
                      backgroundColor: '#e0f7f5',
                      color: '#14b8a6',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minWidth: '76px',
                      textAlign: 'center',
                      display: 'inline-block',
                    }}>
                      #{strategy.strategy_id}
                    </span>
                    {/* Creator */}
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
                      by @{strategy.creator_handle || 'unknown'}
                    </div>
                  </div>
                  {/* Create Bot Button */}
                  <button
                    onClick={(e) => handleCreateBot(strategy, e)}
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
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create Bot
                  </button>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {/* Left side - details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#adadad', width: '65px', fontWeight: '400', flexShrink: 0 }}>Bots:</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1c1c1e' }}>
                        {Number(strategy.bots_count) || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#adadad', width: '65px', fontWeight: '400', flexShrink: 0 }}>Created:</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1c1c1e' }}>
                        {formatCreatedDate(strategy.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Right side - performance (only show if not null) */}
                  {strategy.performance_pct != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: getProfitColor(Number(strategy.performance_pct) || 0),
                      }}>
                        {Number(strategy.performance_pct) > 0 ? '+' : ''}{Number(strategy.performance_pct || 0).toFixed(2)}%
                      </span>
                      <span style={{ fontSize: '13px', color: '#888' }}>
                        avg
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation activeTab="strategies" />

      <StrategyDetailModal
        isOpen={selectedStrategyId !== null}
        onClose={() => setSelectedStrategyId(null)}
        strategyId={selectedStrategyId}
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

export default function StrategiesPage() {
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
      <StrategiesPageContent />
    </Suspense>
  )
}
