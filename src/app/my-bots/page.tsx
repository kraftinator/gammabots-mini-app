'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { styles, colors, getProfitColor } from '@/styles/common'
import BottomNavigation from '@/components/BottomNavigation'
import BotDetailModal from '@/components/modals/BotDetailModal'
import { formatDistanceToNow } from 'date-fns'

interface Bot {
  bot_id: string
  token_symbol: string
  token_address?: string
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
  profit_share?: number
  profit_threshold?: number
  trade_mode?: 'buy' | 'sell'
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
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  // Modal state
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch bots function
  const fetchBots = useCallback(async (token: string, botStatus: 'active' | 'inactive' = 'active') => {
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

  // Auto-refresh when there are unfunded or liquidating bots
  useEffect(() => {
    const hasUnfundedBots = bots.some(bot => bot.status === 'unfunded')
    const hasLiquidatingBots = bots.some(bot => bot.status === 'liquidating')

    if (!hasUnfundedBots && !hasLiquidatingBots) {
      return // No transitional bots, no need to poll
    }

    console.log('Starting auto-refresh for transitional bots...')

    const intervalId = setInterval(async () => {
      try {
        const token = await authenticate()
        if (token) {
          console.log('Auto-refreshing bots data...')
          await fetchBots(token, status)
        }
      } catch (error) {
        console.error('Error during auto-refresh:', error)
      }
    }, 5000) // Poll every 5 seconds

    // Cleanup function
    return () => {
      console.log('Stopping auto-refresh')
      clearInterval(intervalId)
    }
  }, [bots, authenticate, fetchBots, status])

  // Handle status change and fetch new bots
  const handleStatusChange = useCallback(async (newStatus: 'active' | 'inactive') => {
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

  // Handle bot click to open modal
  const handleBotClick = (bot: Bot) => {
    setSelectedBot(bot)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBot(null)
  }

  // Handle bot updated from modal
  const handleBotUpdated = (updatedBot: Bot) => {
    // Update the bot in the list
    setBots(prevBots => prevBots.map(b => b.bot_id === updatedBot.bot_id ? updatedBot : b))
    // Update the selected bot so modal shows new data
    setSelectedBot(updatedBot)
  }

  // Clone bot - navigate to create page with pre-filled values
  const handleClone = (bot: Bot, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the modal

    const params = new URLSearchParams()
    if (bot.token_address) params.set('token_address', bot.token_address)
    if (bot.strategy_id) params.set('strategy_id', bot.strategy_id)
    if (bot.moving_average) params.set('moving_avg', bot.moving_average.toString())
    if (bot.profit_share !== undefined) params.set('profit_share', bot.profit_share.toString())
    if (bot.profit_threshold !== undefined) params.set('profit_threshold', bot.profit_threshold.toString())

    router.push(`/my-bots/create?${params.toString()}`)
  }

  // Helper function to format token amounts
  const formatTokenAmount = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 10000) {
      return `${(value / 1000).toFixed(0)}K`
    } else if (value >= 1) {
      return Math.round(value).toLocaleString()
    } else {
      return Number(value).toFixed(2)
    }
  }

  const filteredAndSortedBots = useMemo(() => {
    const filtered = bots.filter(bot => {
      const matchesSearch = bot.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bot.bot_id?.toString().includes(searchQuery)
      return matchesSearch
    })

    return filtered.sort((a, b) => {
      // Liquidating bots always sort to top
      const aLiquidating = a.status === 'liquidating' ? 1 : 0
      const bLiquidating = b.status === 'liquidating' ? 1 : 0
      if (aLiquidating !== bLiquidating) {
        return bLiquidating - aLiquidating
      }

      switch (sortBy) {
        case 'profit':
          return Number(b.profit_percent || 0) - Number(a.profit_percent || 0)
        case 'value':
          return Number(b.value || 0) - Number(a.value || 0)
        case 'recent':
          // Sort by last_action timestamp (most recent first)
          const aTime = a.last_action ? new Date(a.last_action).getTime() : 0
          const bTime = b.last_action ? new Date(b.last_action).getTime() : 0
          return bTime - aTime
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
            <option value="id">Sort by ID</option>
          </select>
          
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as 'active' | 'inactive')}
            style={styles.myBotsSelect}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
              <div
                key={bot.bot_id}
                style={styles.myBotCard}
                onClick={() => handleBotClick(bot)}
              >
                <div style={{
                  ...styles.myBotCardContent,
                  flexDirection: 'column',
                  alignItems: 'stretch'
                }}>
                  {/* Header with horizontal line */}
                  <div style={{
                    ...styles.myBotHeader,
                    marginBottom: '0px',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={styles.myBotTokenInfo}>
                      <span style={{ whiteSpace: 'nowrap' }}>
                        {(() => {
                          const symbol = bot.token_symbol || 'Unknown';
                          return symbol.length > 15 ? `${symbol.slice(0, 15)}...` : symbol;
                        })()}
                      </span>
                      <span style={styles.myBotId}>#{bot.bot_id}</span>
                      <span style={{
                        ...styles.myBotStatus,
                        whiteSpace: 'nowrap',
                        color: bot.status === 'unfunded' ? colors.error : (bot.status === 'liquidating' ? '#f59e0b' : (bot.status === 'completed' ? '#5f9ea0' : (bot.status === 'stopped' ? '#555' : (bot.status === 'funding_failed' ? '#E35B5B' : (bot.is_active ? colors.success : colors.text.secondary))))),
                        fontStyle: bot.status === 'liquidating' ? 'italic' : 'normal'
                      }}>
                        {bot.status === 'unfunded' ? 'Awaiting funding' : (bot.status === 'liquidating' ? 'Liquidating...' : (bot.status === 'completed' ? 'Completed' : (bot.status === 'stopped' ? 'Stopped' : (bot.status === 'funding_failed' ? 'Funding failed' : (bot.is_active ? 'Active' : 'Inactive')))))}
                      </span>
                    </span>
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
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      Clone
                    </button>
                  </div>

                  {/* Details and Values side by side */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ ...styles.myBotDetails, flex: 1 }}>
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Strategy:</span>
                        <span style={styles.myBotStrategyPill}>
                          #{bot.strategy_id || 'N/A'}
                        </span>
                      </div>
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Moving Avg:</span>
                        <span style={styles.myBotDetailValue}>{bot.moving_average || '20'}</span>
                      </div>
                      {bot.status === 'active' && (
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Holdings:</span>
                        <div style={styles.myBotHoldings}>
                          {(() => {
                            const tokensNum = bot.tokens ? Number(bot.tokens) : 0;
                            const ethNum = bot.eth ? Number(bot.eth) : 0;

                            // Check displayed values, not raw values
                            const tokensDisplay = Math.floor(tokensNum);
                            const ethDisplay = Number(ethNum.toFixed(6));

                            // Truncate token symbol
                            const symbol = bot.token_symbol || '';
                            const truncatedSymbol = symbol.length > 15 ? `${symbol.slice(0, 15)}...` : symbol;

                            if (tokensDisplay > 0 && ethDisplay > 0) {
                              return (
                                <>
                                  <div>{formatTokenAmount(tokensDisplay)} {truncatedSymbol}</div>
                                  <div>{parseFloat(ethDisplay.toFixed(6))} ETH</div>
                                </>
                              );
                            } else if (tokensDisplay > 0) {
                              return `${formatTokenAmount(tokensDisplay)} ${truncatedSymbol}`;
                            } else if (ethDisplay > 0) {
                              return `${parseFloat(ethDisplay.toFixed(6))} ETH`;
                            } else {
                              return '0';
                            }
                          })()}
                        </div>
                      </div>
                      )}
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Last Action:</span>
                        <span style={styles.myBotDetailValue}>{bot.last_action ? formatDistanceToNow(new Date(bot.last_action), { addSuffix: true }) : 'N/A'}</span>
                      </div>
                      {(bot.status === 'completed' || bot.status === 'stopped') && (
                      <div style={styles.myBotDetailRow}>
                        <span style={styles.myBotDetailLabel}>Final Value:</span>
                        <span style={styles.myBotDetailValue}>{bot.value ? `${parseFloat(Number(bot.value).toFixed(6))} ETH` : '0 ETH'}</span>
                      </div>
                      )}
                    </div>

                    {bot.status === 'active' && (
                    <div style={styles.myBotValues}>
                      <div style={styles.myBotValue}>
                        ETH {bot.value ? parseFloat(Number(bot.value).toFixed(6)) : '0'}
                      </div>
                      {(Number(bot.trades) > 0) && (
                      <div style={{
                        ...styles.myBotProfit,
                        color: getProfitColor(Number(bot.profit_percent) || 0)
                      }}>
                        {Number(bot.profit_percent) > 0 ? '+' : ''}{Number(bot.profit_percent || 0).toFixed(2)}%
                      </div>
                      )}
                    </div>
                    )}
                    {bot.status === 'completed' && (
                    <div style={styles.myBotValues}>
                      <div style={{
                        ...styles.myBotProfit,
                        color: getProfitColor(Number(bot.profit_percent) || 0)
                      }}>
                        {bot.profit_percent && Number(bot.profit_percent) > 0 ? '+' : ''}{Number(bot.profit_percent || 0).toFixed(2)}%
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <BottomNavigation activeTab="my-bots" />

      <BotDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bot={selectedBot}
        onBotUpdated={handleBotUpdated}
      />
    </div>
  )
}
