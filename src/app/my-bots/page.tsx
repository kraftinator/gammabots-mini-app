'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { styles, colors, getProfitColor } from '@/styles/common'
import BottomNavigation from '@/components/BottomNavigation'

interface Bot {
  bot_id: string
  token_symbol: string
  strategy_id: string
  status?: string
  tokens?: number
  eth?: number
  init?: number
  value?: number
  profit_percent?: number
  profit_eth?: number
  cycles?: number
  trades?: number
  errors?: number
  last_action?: string
  is_active?: boolean
  moving_average?: number
  // Add other fields as we discover them
}

export default function MyBotsPage() {
  const router = useRouter()
  const { authLoading, authError, authenticate } = useQuickAuth()
  const [isReady, setIsReady] = useState(false)
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)
  const [username, setUsername] = useState<string>('kraft')
  const [bots, setBots] = useState<Bot[]>([])
  const [botsLoading, setBotsLoading] = useState(false)
  const [botsError, setBotsError] = useState<string | null>(null)
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [status, setStatus] = useState<'active' | 'retired'>('active')

  // Fetch bots function
  const fetchBots = useCallback(async (token: string, botStatus: 'active' | 'retired' = 'active') => {
    try {
      setBotsLoading(true)
      setBotsError(null)
      setBots([]) // Clear existing bots when fetching new status

      const url = new URL('/api/bots', window.location.origin)
      url.searchParams.append('status', botStatus)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Raw API response:', data)
      
        const botsArray = Array.isArray(data) ? data : data.bots || []
        console.log('Processed bots array:', botsArray)
        setBots(botsArray)    } catch (error: unknown) {
      console.error('Failed to fetch bots:', error)
      setBotsError(error instanceof Error ? error.message : 'Failed to fetch bots')
    } finally {
      setBotsLoading(false)
    }
  }, [setBots, setBotsLoading, setBotsError])

  useEffect(() => {
    async function initializePage() {
      try {
        setIsReady(true)
        
        // Try to load the SDK
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
        // Check if we're running in a Mini App environment
        const inMiniApp = await sdk.isInMiniApp()
        setIsMiniApp(inMiniApp)

        if (inMiniApp) {
          // We're in a Mini App, call ready to hide splash screen
          await sdk.actions.ready()
          console.log('My Bots page is ready!')
          
          // Get user context to display actual username
          try {
            const context = await sdk.context
            if (context?.user?.username) {
              setUsername(context.user.username)
            }
          } catch (contextError) {
            console.log('Could not get user context:', contextError)
          }

          // Now perform Quick Auth and fetch bots
          const token = await authenticate()
          if (token) {
            await fetchBots(token, status)
          }
        } else {
          console.log('Not running in Mini App environment')
          // authError will be set by the hook
        }
      } catch (error) {
        console.error('Error initializing page:', error)
        setIsReady(true)
      }
    }

    initializePage()
  }, [authenticate, fetchBots])

  // Handle status change and fetch new bots
  const handleStatusChange = useCallback(async (newStatus: 'active' | 'retired') => {
    setStatus(newStatus)
    
    try {
      const token = await authenticate()
      if (token) {
        await fetchBots(token, newStatus)
      }
    } catch (error) {
      console.error('Error fetching bots for status change:', error)
    }
  }, [authenticate, fetchBots])

  const filteredAndSortedBots = useMemo(() => {
    const filtered = bots.filter(bot => {
      const matchesSearch = bot.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bot.bot_id?.toString().includes(searchQuery)
      return matchesSearch
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'profit':
          return Number(b.profit_percent || 0) - Number(a.profit_percent || 0)
        case 'value':
          return Number(b.value || 0) - Number(a.value || 0)
        case 'recent':
          // For now, sort by bot_id as a proxy for recent
          return parseInt(b.bot_id) - parseInt(a.bot_id)
        case 'strategy':
          return parseInt(a.strategy_id) - parseInt(b.strategy_id)
        case 'id':
          return parseInt(b.bot_id) - parseInt(a.bot_id)
        default:
          return 0
      }
    })
  }, [bots, searchQuery, sortBy])

  if (!isReady) {
    return (
      <div style={styles.loadingContainerLight}>
        <p style={{ color: colors.white }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={styles.myBotsContainer}>
      {/* Header */}
      <div style={{
        ...styles.formHeader,
        padding: '20px 20px 20px 20px',
        marginBottom: '0',
        backgroundColor: 'white'
      }}>
        <div>
          <h1 style={styles.formTitle}>
            My Bots
          </h1>
        </div>
      </div>

      {/* Auth Error */}
      {authError && (
        <div style={styles.errorCard}>
          <h3 style={styles.errorTitle}>
            Authentication Error
          </h3>
          <p style={styles.errorText}>
            {authError}
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <div style={styles.myBotsFilters}>
        <div style={styles.myBotsSearchContainer}>
          <Search style={styles.myBotsSearchIcon} />
          <input
            type="text"
            placeholder="Search token or bot ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.myBotsSearchInput}
          />
        </div>

        <div style={styles.myBotsSelectContainer}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.myBotsSelect}
          >
            <option value="recent">Sort by Recent</option>
            <option value="profit">Sort by Profit</option>
            <option value="value">Sort by Value</option>
            <option value="strategy">Sort by Strategy</option>
            <option value="id">Sort by Bot ID</option>
          </select>
          
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as 'active' | 'retired')}
            style={styles.myBotsSelect}
          >
            <option value="active">Active</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {botsLoading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading bots...</p>
        </div>
      )}

      {/* Error State */}
      {botsError && (
        <div style={styles.errorCard}>
          <h3 style={styles.errorTitle}>Error Loading Bots</h3>
          <p style={styles.errorText}>{botsError}</p>
        </div>
      )}

      {/* Bots List */}
      {!botsLoading && !botsError && (
        <div style={styles.myBotsList}>
          {filteredAndSortedBots.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: colors.text.secondary
            }}>
              <p>No bots found</p>
              {searchQuery && <p>Try adjusting your search or filters</p>}
            </div>
          ) : (
            filteredAndSortedBots.map((bot) => (
              <div key={bot.bot_id} style={styles.myBotCard}>
                <div style={styles.myBotCardContent}>
                  <div style={styles.myBotInfo}>
                    <div style={styles.myBotHeader}>
                      <span style={styles.myBotTokenInfo}>
                        <span>{bot.token_symbol || 'Unknown'}</span>
                        <span style={styles.myBotId}>#{bot.bot_id}</span>
                      </span>
                      <span style={{
                        ...styles.myBotStatus,
                        whiteSpace: 'nowrap',
                        color: bot.status === 'unfunded' ? colors.error : (bot.is_active ? colors.success : colors.text.secondary)
                      }}>
                        {bot.status === 'unfunded' ? 'Awaiting funding' : (bot.is_active ? 'Active' : 'Inactive')}
                      </span>
                    </div>
                    
                    <div style={styles.myBotDetails}>
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Strategy:</span>
                        <span style={styles.myBotDetailValue}>{bot.strategy_id || 'N/A'}</span>
                      </div>
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>MA:</span>
                        <span style={styles.myBotDetailValue}>{bot.moving_average || '20'}</span>
                      </div>
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Holdings:</span>
                        <div style={styles.myBotHoldings}>
                          {(() => {
                            const tokensNum = bot.tokens ? Number(bot.tokens) : 0;
                            const ethNum = bot.eth ? Number(bot.eth) : 0;
                            
                            if (tokensNum > 0 && ethNum > 0) {
                              return (
                                <>
                                  <div>{Math.floor(tokensNum).toLocaleString()} {bot.token_symbol}</div>
                                  <div>{ethNum.toFixed(4)} ETH</div>
                                </>
                              );
                            } else if (tokensNum > 0) {
                              return `${Math.floor(tokensNum).toLocaleString()} ${bot.token_symbol}`;
                            } else if (ethNum > 0) {
                              return `${ethNum.toFixed(4)} ETH`;
                            } else {
                              return '0';
                            }
                          })()}
                        </div>
                      </div>
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Cycles:</span>
                        <span style={styles.myBotDetailValue}>{bot.cycles || 0}</span>
                      </div>
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Trades:</span>
                        <span style={styles.myBotDetailValue}>{bot.trades || 0}</span>
                      </div>
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Init Value:</span>
                        <span style={styles.myBotDetailValue}>{bot.init ? Number(bot.init).toFixed(4) : '0.0000'} ETH</span>
                      </div>
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Last Action:</span>
                        <span style={styles.myBotDetailValue}>{bot.last_action || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.myBotValues}>
                    <div style={styles.myBotValue}>
                      ETH {bot.value ? Number(bot.value).toFixed(4) : '0.0000'}
                    </div>
                    <div style={{
                      ...styles.myBotProfit,
                      color: getProfitColor(Number(bot.profit_percent) || 0)
                    }}>
                      {bot.profit_percent && Number(bot.profit_percent) > 0 ? '+' : ''}{Number(bot.profit_percent || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <BottomNavigation activeTab="my-bots" />
    </div>
  )
}
