'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, ChevronDown, ChevronUp, ArrowLeftRight, Edit3, Banknote, Loader2, GitBranch, Power, Copy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { colors, getProfitColor } from '@/styles/common'
import { formatTokenAmount, formatActiveTime } from '@/utils/formatters'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { useMe } from '@/contexts/MeContext'

export interface Bot {
  bot_id: string
  token_symbol: string
  token_name?: string
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
  bot_owner_id?: number
  active_seconds?: number
  owner_farcaster_username?: string
  display_name?: string
}

interface BotDetailModalProps {
  isOpen: boolean
  onClose: () => void
  bot: Bot | null
  onBotUpdated?: (updatedBot: Bot) => void
  onRefresh?: () => void
  from?: string
  userExists?: boolean
  onSignUpRequired?: (redirectUrl: string) => void
}

// Metrics categories configuration
const metricsCategories = [
  {
    title: 'Position & Trades',
    keys: ['tokenAmt', 'buyCount', 'sellCount', 'movingAvg', 'lastSellPrice']
  },
  {
    title: 'Prices',
    keys: ['currentPrice', 'prevPrice', 'initBuyPrice', 'rollingHigh', 'creationPrice', 'highSinceCreate', 'lowSinceCreate', 'highInitBuy', 'lowInitBuy', 'highLastTrade', 'lowLastTrade', 'listedBuyPrice', 'priceDiv']
  },
  {
    title: 'Moving Averages',
    keys: ['cma', 'lma', 'tma', 'prevCMA', 'prevLMA', 'lowCMASinceCreate', 'highCMASinceInit', 'lowCMASinceInit', 'highCMASinceTrade', 'lowCMASinceTrade']
  },
  {
    title: 'Volatility & Momentum',
    keys: ['mom', 'vst', 'vlt', 'ssd', 'lsd']
  },
  {
    title: 'Profitability',
    keys: ['profitLastCycle', 'profitSecondCycle', 'botProfit']
  },
  {
    title: 'Timing',
    keys: ['minSinceTrade', 'minSinceBuy', 'minSinceCreate']
  }
]

interface Trade {
  id: number
  side: string
  amount_in: string
  amount_out: string
  price: string
  tx_hash: string
  status: string
  executed_at: string
  cycle: number | null
  strategy: number | null
  step: number | null
}

interface StrategyStep {
  c: string
  a: string[]
}

interface StrategyData {
  id: string
  strategy_id: string
  creator_address: string
  owner_address: string
  compressed_strategy: string
  user_friendly_strategy: string
  created_at: string
}

export default function BotDetailModal({ isOpen, onClose, bot, onBotUpdated, onRefresh, from, userExists = true, onSignUpRequired }: BotDetailModalProps) {
  const router = useRouter()
  const { authenticate } = useQuickAuth()
  const { me } = useMe()
  const isOwner = me?.id != null && bot?.bot_owner_id != null && String(me.id) === String(bot.bot_owner_id)

  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false)
  const [metricsData, setMetricsData] = useState<Record<string, string | number | boolean> | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  const [isTradesExpanded, setIsTradesExpanded] = useState(false)
  const [tradesData, setTradesData] = useState<Trade[] | null>(null)
  const [tradesLoading, setTradesLoading] = useState(false)
  const [tradesError, setTradesError] = useState<string | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  const [isStrategyExpanded, setIsStrategyExpanded] = useState(false)
  const [strategyData, setStrategyData] = useState<StrategyData | null>(null)
  const [strategyLoading, setStrategyLoading] = useState(false)
  const [strategyError, setStrategyError] = useState<string | null>(null)
  const [strategyFetched, setStrategyFetched] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editStrategyId, setEditStrategyId] = useState('')
  const [editMovingAvg, setEditMovingAvg] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [isLiquidateOpen, setIsLiquidateOpen] = useState(false)
  const [liquidateLoading, setLiquidateLoading] = useState(false)
  const [liquidateError, setLiquidateError] = useState<string | null>(null)

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
  const [deactivateLoading, setDeactivateLoading] = useState(false)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)

  // Reset state when bot changes
  useEffect(() => {
    setIsMetricsExpanded(false)
    setMetricsData(null)
    setMetricsError(null)
    setIsTradesExpanded(false)
    setTradesData(null)
    setTradesError(null)
    setSelectedTrade(null)
    setIsStrategyExpanded(false)
    setStrategyData(null)
    setStrategyError(null)
    setStrategyFetched(false)
    setIsEditOpen(false)
    setEditError(null)
    setIsLiquidateOpen(false)
    setLiquidateError(null)
    setIsDeactivateOpen(false)
    setDeactivateError(null)
  }, [bot?.bot_id])

  // Lock body scroll and hide scrollbar when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  // Helper function to format tokenAmt
  const formatTokenAmt = (value: number): string => {
    if (value >= 1000) {
      // Show with no decimals
      return Math.floor(value).toLocaleString()
    } else if (value >= 1) {
      // Show 2-4 decimals
      const rounded = Math.round(value * 10000) / 10000
      return rounded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    } else {
      // Show up to 6 decimals, trim trailing zeros
      const fixed = value.toFixed(6)
      return parseFloat(fixed).toString()
    }
  }

  // Helper function to format metric values
  const formatMetricValue = (value: string | number | boolean, key?: string): string => {
    if (value === null || value === undefined) return '--'
    if (typeof value === 'number') {
      if (isNaN(value)) return '--'
      // Format tokenAmt specially
      if (key === 'tokenAmt') {
        return formatTokenAmt(value)
      }
      // Limit profit fields to 4 decimals
      if (key === 'botProfit' || key === 'profitLastCycle' || key === 'profitSecondCycle') {
        return value.toFixed(4)
      }
      // Limit volatility & momentum fields to 6 decimals
      if (key === 'mom' || key === 'vst' || key === 'vlt' || key === 'ssd' || key === 'lsd') {
        return value.toFixed(6)
      }
      // Check if it's a price-like value (has many decimals)
      const str = value.toString()
      if (str.includes('.') && str.split('.')[1].length > 10) {
        return value.toFixed(18)
      }
      return str
    }
    if (typeof value === 'string') {
      // Check if it's a numeric string with many decimals
      const num = parseFloat(value)
      // Format tokenAmt specially
      if (key === 'tokenAmt' && !isNaN(num)) {
        return formatTokenAmt(num)
      }
      // Limit profit fields to 4 decimals
      if ((key === 'botProfit' || key === 'profitLastCycle' || key === 'profitSecondCycle') && !isNaN(num)) {
        return num.toFixed(4)
      }
      // Limit volatility & momentum fields to 6 decimals
      if ((key === 'mom' || key === 'vst' || key === 'vlt' || key === 'ssd' || key === 'lsd') && !isNaN(num)) {
        return num.toFixed(6)
      }
      if (!isNaN(num) && value.includes('.') && value.split('.')[1].length > 10) {
        return num.toFixed(18)
      }
      // Check if it's a timestamp
      const date = new Date(value)
      if (!isNaN(date.getTime()) && value.includes('-')) {
        // Format as: YYYY-MM-DD HH:mm:ss UTC
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        const hours = String(date.getUTCHours()).padStart(2, '0')
        const minutes = String(date.getUTCMinutes()).padStart(2, '0')
        const seconds = String(date.getUTCSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`
      }
    }
    return String(value)
  }

  // Fetch metrics when expanded
  useEffect(() => {
    const fetchMetrics = async () => {
      // Only fetch if expanded, not already loaded, and not currently loading
      if (!isMetricsExpanded || metricsData || metricsLoading || !bot) return

      try {
        setMetricsLoading(true)
        setMetricsError(null)

        const token = await authenticate()
        if (!token) {
          setMetricsError('Cannot load metrics at this time.')
          return
        }

        const response = await fetch(`/api/bots/${bot.bot_id}/metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          setMetricsError('Cannot load metrics at this time.')
          return
        }

        const data = await response.json()
        // Extract just the metrics object from the response
        setMetricsData(data.metrics || data)
      } catch (error) {
        console.error('Error fetching metrics:', error)
        setMetricsError('Cannot load metrics at this time.')
      } finally {
        setMetricsLoading(false)
      }
    }

    fetchMetrics()
  }, [isMetricsExpanded, metricsData, metricsLoading, authenticate, bot])

  // Fetch trades when expanded
  useEffect(() => {
    const fetchTrades = async () => {
      if (!isTradesExpanded || tradesData || tradesLoading || !bot) return

      try {
        setTradesLoading(true)
        setTradesError(null)

        const token = await authenticate()
        if (!token) {
          setTradesError('Cannot load trades at this time.')
          return
        }

        const response = await fetch(`/api/bots/${bot.bot_id}/trades`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          setTradesError('Cannot load trades at this time.')
          return
        }

        const data = await response.json()
        const completedTrades = (data.trades || []).filter((t: Trade) => t.status === 'completed')
        setTradesData(completedTrades)
      } catch (error) {
        console.error('Error fetching trades:', error)
        setTradesError('Cannot load trades at this time.')
      } finally {
        setTradesLoading(false)
      }
    }

    fetchTrades()
  }, [isTradesExpanded, tradesData, tradesLoading, authenticate, bot])

  // Fetch strategy when expanded (only once per bot)
  useEffect(() => {
    const fetchStrategy = async () => {
      // Skip if not expanded, already fetched, currently loading, or no bot
      if (!isStrategyExpanded || strategyFetched || strategyLoading || !bot) return

      try {
        setStrategyLoading(true)
        setStrategyError(null)

        const token = await authenticate()
        if (!token) {
          setStrategyError('Cannot load strategy at this time.')
          setStrategyFetched(true)
          return
        }

        const response = await fetch(`/api/strategies/${bot.strategy_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          setStrategyError('Cannot load strategy at this time.')
          setStrategyFetched(true)
          return
        }

        const data = await response.json()
        setStrategyData(data)
        setStrategyFetched(true)
      } catch (error) {
        console.error('Error fetching strategy:', error)
        setStrategyError('Cannot load strategy at this time.')
        setStrategyFetched(true)
      } finally {
        setStrategyLoading(false)
      }
    }

    fetchStrategy()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStrategyExpanded, bot?.strategy_id])

  // Format trade timestamp
  const formatTradeTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  // Format ETH value for trades
  const formatTradeEth = (value: string): string => {
    const num = parseFloat(value)
    if (isNaN(num)) return '0.000000'
    return num.toFixed(6)
  }

  // Format trade detail timestamp (with seconds)
  const formatTradeDetailTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // Format token amount for trade details (same rules as tokenAmt)
  const formatTradeTokenAmount = (value: string): string => {
    const num = parseFloat(value)
    if (isNaN(num)) return '0'
    if (num >= 1000) {
      return Math.floor(num).toLocaleString()
    } else if (num >= 1) {
      const rounded = Math.round(num * 10000) / 10000
      return rounded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    } else {
      const fixed = num.toFixed(6)
      return parseFloat(fixed).toString()
    }
  }

  // Open edit drawer with current bot values
  const handleOpenEdit = () => {
    setEditStrategyId(bot?.strategy_id || '')
    setEditMovingAvg(bot?.moving_average?.toString() || '1')
    setEditError(null)
    setIsEditOpen(true)
  }

  // Validation for strategy ID
  const handleStrategyBlur = () => {
    if (editStrategyId === '' || editStrategyId === undefined) {
      setEditStrategyId('1')
      return
    }
    const numValue = parseFloat(editStrategyId)
    if (!isNaN(numValue)) {
      let correctedValue = Math.floor(numValue)
      if (correctedValue < 1) correctedValue = 1
      setEditStrategyId(correctedValue.toString())
    } else {
      setEditStrategyId('1')
    }
  }

  // Validation for moving average
  const handleMovingAvgBlur = () => {
    if (editMovingAvg === '' || editMovingAvg === undefined) {
      setEditMovingAvg('1')
      return
    }
    const numValue = parseFloat(editMovingAvg)
    if (!isNaN(numValue)) {
      let correctedValue = Math.floor(numValue)
      if (correctedValue < 1) correctedValue = 1
      if (correctedValue > 60) correctedValue = 60
      setEditMovingAvg(correctedValue.toString())
    } else {
      setEditMovingAvg('1')
    }
  }

  // Submit edit
  const handleEditSubmit = async () => {
    if (!bot) return

    setEditLoading(true)
    setEditError(null)

    try {
      const token = await authenticate()
      if (!token) {
        setEditError('Authentication failed')
        setEditLoading(false)
        return
      }

      const response = await fetch(`/api/bots/${bot.bot_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          strategy_id: parseInt(editStrategyId),
          moving_average: parseInt(editMovingAvg)
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update bot' }))
        setEditError(errorData.error || errorData.message || 'Failed to update bot')
        setEditLoading(false)
        return
      }

      const data = await response.json()
      const updatedBot = data.bot || data

      // Clear cached data so it gets re-fetched with new bot settings
      setMetricsData(null)
      setTradesData(null)
      setStrategyData(null)

      setIsEditOpen(false)

      if (onBotUpdated) {
        onBotUpdated(updatedBot)
      }
    } catch (error) {
      console.error('Error updating bot:', error)
      setEditError('An unexpected error occurred')
    } finally {
      setEditLoading(false)
    }
  }

  // Handle liquidate confirmation
  const handleLiquidate = async () => {
    if (!bot) return

    setLiquidateLoading(true)
    setLiquidateError(null)

    try {
      const token = await authenticate()
      if (!token) {
        setLiquidateError('Authentication failed')
        setLiquidateLoading(false)
        return
      }

      const response = await fetch(`/api/bots/${bot.bot_id}/liquidate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to liquidate. Please contact support.' }))
        setLiquidateError(errorData.error || errorData.message || 'Failed to liquidate. Please contact support.')
        setLiquidateLoading(false)
        return
      }

      const data = await response.json()

      // Update bot status in parent
      if (onBotUpdated) {
        onBotUpdated({
          ...bot,
          status: data.status
        })
      }

      // Close modal and drawer
      setIsLiquidateOpen(false)
      onClose()
    } catch (error) {
      console.error('Error liquidating bot:', error)
      setLiquidateError('An unexpected error occurred')
    } finally {
      setLiquidateLoading(false)
    }
  }

  // Handle deactivate confirmation
  const handleDeactivate = async () => {
    if (!bot) return

    setDeactivateLoading(true)
    setDeactivateError(null)

    try {
      const token = await authenticate()
      if (!token) {
        setDeactivateError('Authentication failed')
        setDeactivateLoading(false)
        return
      }

      const response = await fetch(`/api/bots/${bot.bot_id}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to deactivate bot' }))
        setDeactivateError(errorData.error || errorData.message || 'Failed to deactivate bot')
        setDeactivateLoading(false)
        return
      }

      await response.json()

      // Close modal and drawer
      setIsDeactivateOpen(false)
      onClose()

      // Refresh the bots list to reflect the deactivation
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error deactivating bot:', error)
      setDeactivateError('An unexpected error occurred')
    } finally {
      setDeactivateLoading(false)
    }
  }

  // Don't render if modal is closed or bot is null
  if (!isOpen || !bot) return null

  return (
    <>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .modal-content {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .modal-content::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '10px'
        }}
        onClick={onClose}
      >
      <div
        className="modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 16px 10px',
          borderBottom: '1px solid #f2f2f7',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#1c1c1e'
            }}>
              {(() => {
                const name = bot.display_name || `${bot.token_symbol || 'Unknown'} #${bot.bot_id}`;
                return name.length > 18 ? `${name.slice(0, 18)}...` : name;
              })()}
            </span>
            {isOwner && (
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: bot.status === 'unfunded' ? '#f59e0b' : (bot.status === 'liquidating' ? '#f59e0b' : (bot.status === 'deactivated' ? '#555' : (bot.status === 'completed' ? '#5f9ea0' : (bot.status === 'stopped' ? '#555' : (bot.status === 'funding_failed' ? '#E35B5B' : (bot.is_active ? colors.success : colors.text.secondary)))))),
              animation: (bot.status === 'unfunded' || bot.status === 'liquidating') ? 'pulse 2s ease-in-out infinite' : 'none'
            }}>
              {(bot.status === 'unfunded' || bot.status === 'liquidating') && <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>}
              {bot.status === 'unfunded' ? 'Confirming funds' : (bot.status === 'liquidating' ? 'Liquidating' : (bot.status === 'deactivated' ? 'Deactivated' : (bot.status === 'completed' ? 'Completed' : (bot.status === 'stopped' ? 'Stopped' : (bot.status === 'funding_failed' ? 'Funding failed' : (bot.is_active ? 'Active' : 'Inactive'))))))}
            </span>
            )}
          </div>
          {!isOwner && bot.owner_farcaster_username && (
            <div style={{ fontSize: '13px', color: '#666' }}>
              @{bot.owner_farcaster_username}
            </div>
          )}
          {!isOwner && bot.profit_percent != null && (
            <span style={{
              position: 'absolute',
              top: '16px',
              right: '50px',
              fontSize: '14px',
              fontWeight: '600',
              color: Number(bot.profit_percent) >= 0 ? '#34c759' : '#ff3b30'
            }}>
              {Number(bot.profit_percent) >= 0 ? '+' : ''}{Number(bot.profit_percent).toFixed(2)}%
            </span>
          )}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#8e8e93',
              padding: '4px',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        {/* Current Value Section - Owner only */}
        {isOwner && (
        <div style={{
          padding: '20px 16px 0px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '4px',
            fontWeight: '400'
          }}>
            {(bot.status === 'stopped' || bot.status === 'completed') ? 'Final Value' : (bot.status === 'funding_failed' ? 'Attempted Amount' : 'Current Value')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1c1c1e'
            }}>
              ETH {bot.status === 'funding_failed' ? (bot.init ? parseFloat(Number(bot.init).toFixed(6)).toString() : '0') : (bot.value ? parseFloat(Number(bot.value).toFixed(6)) : '0')}
            </span>
            {bot.status !== 'stopped' && bot.status !== 'funding_failed' && Number(bot.trades) > 0 && (
            <span style={{
              fontSize: '16px',
              fontWeight: '500',
              color: getProfitColor(Number(bot.profit_percent) || 0, bot.status === 'active')
            }}>
              {Number(bot.profit_percent) > 0 ? '+' : ''}{Number(bot.profit_percent || 0).toFixed(2)}%
            </span>
            )}
          </div>
        </div>
        )}

        {/* Details Section */}
        <div style={{ padding: '20px 16px' }}>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0px'
          }}>
            {/* Strategy */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Strategy</span>
              <span style={{
                padding: '2px 8px',
                backgroundColor: '#e0f7fa',
                color: '#0097a7',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                lineHeight: '1.5'
              }}>
                #{bot.strategy_id}
              </span>
            </div>

            {/* Moving Avg */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Moving Avg</span>
              <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                {bot.moving_average || '20'}
              </span>
            </div>

            {/* Total Trades - Public view only */}
            {!isOwner && bot.trades != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Total Trades</span>
              <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                {bot.trades}
              </span>
            </div>
            )}

            {/* Holdings - Owner only */}
            {isOwner && bot.status !== 'stopped' && bot.status !== 'funding_failed' && bot.status !== 'completed' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Holdings</span>
              <div style={{ textAlign: 'right' }}>
                {(() => {
                  const tokensNum = bot.tokens ? Number(bot.tokens) : 0
                  const ethNum = bot.eth ? Number(bot.eth) : 0

                  // Buy mode: only show ETH
                  if (bot.trade_mode === 'buy') {
                    return (
                      <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                        {parseFloat(ethNum.toFixed(6))} <span style={{ color: '#8e8e93', fontWeight: '500' }}>ETH</span>
                      </span>
                    )
                  }

                  // Sell mode: show tokens and/or ETH
                  const symbol = bot.token_symbol || 'Unknown'
                  const displaySymbol = symbol.length > 8 ? 'tokens' : symbol

                  if (tokensNum > 0 && ethNum > 0) {
                    return (
                      <>
                        <div style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                          {formatTokenAmount(tokensNum)} <span style={{ color: '#8e8e93', fontWeight: '500' }}>{displaySymbol}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                          {parseFloat(ethNum.toFixed(6))} <span style={{ color: '#8e8e93', fontWeight: '500' }}>ETH</span>
                        </div>
                      </>
                    )
                  } else if (tokensNum > 0) {
                    return (
                      <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                        {formatTokenAmount(tokensNum)} <span style={{ color: '#8e8e93', fontWeight: '500' }}>{displaySymbol}</span>
                      </span>
                    )
                  } else if (ethNum > 0) {
                    return (
                      <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                        {parseFloat(ethNum.toFixed(6))} <span style={{ color: '#8e8e93', fontWeight: '500' }}>ETH</span>
                      </span>
                    )
                  } else {
                    return (
                      <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                        0
                      </span>
                    )
                  }
                })()}
              </div>
            </div>
            )}

            {/* Last Action (owner) or Active For (public, only if data exists) */}
            {(isOwner || bot.active_seconds != null) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>
                {isOwner ? 'Last Action' : 'Active For'}
              </span>
              <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                {isOwner
                  ? (bot.last_action ? formatDistanceToNow(new Date(bot.last_action), { addSuffix: true }).replace('about ', '') : 'N/A')
                  : formatActiveTime(bot.active_seconds!)
                }
              </span>
            </div>
            )}

            {/* Init Value - Owner only */}
            {isOwner && bot.status !== 'funding_failed' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Initial Value</span>
              <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                {bot.init ? `${parseFloat(Number(bot.init).toFixed(6))} ETH` : '0 ETH'}
              </span>
            </div>
            )}

            {/* Bot ID - Owner only */}
            {isOwner && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Bot ID</span>
              <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                {bot.bot_id}
              </span>
            </div>
            )}
          </div>
        </div>

        {/* Expandable Sections */}
        <div style={{ padding: '0 0 20px' }}>
          {isOwner && bot.status === 'active' && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                margin: '0 16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: isMetricsExpanded ? '0' : '10px'
              }}
              onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity style={{ width: '16px', height: '16px', color: '#0891b2' }} />
                <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>View Metrics</span>
              </div>
              {isMetricsExpanded ? (
                <ChevronUp style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              ) : (
                <ChevronDown style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              )}
            </div>

            {isMetricsExpanded && (
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '12px 16px',
                margin: '8px 16px 10px'
              }}>
                {metricsLoading && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
                    <Loader2 style={{ width: '20px', height: '20px', color: '#0891b2', animation: 'spin 1s linear infinite' }} />
                  </div>
                )}

                {metricsError && (
                  <div style={{ color: '#6b7280', fontSize: '13px', padding: '10px 0', textAlign: 'center' }}>
                    {metricsError}
                  </div>
                )}

                {!metricsLoading && !metricsError && metricsData && (
                  <>
                    {metricsCategories.map((category, categoryIndex) => {
                      // Filter to only show keys that exist in the data
                      const availableKeys = category.keys.filter(key => key in metricsData)
                      if (availableKeys.length === 0) return null

                      return (
                        <div key={category.title}>
                          {/* Section Header */}
                          <div style={{
                            color: '#14b8a6',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            paddingTop: categoryIndex === 0 ? '4px' : '16px',
                            paddingBottom: '8px',
                            borderBottom: '1px solid #e5e7eb',
                            marginBottom: '4px'
                          }}>
                            {category.title}
                          </div>

                          {/* Section Items */}
                          {availableKeys.map(key => (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                              <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: '400' }}>{key}</span>
                              <span style={{ color: '#0891b2', fontSize: '13px', fontFamily: 'monospace', fontWeight: '500' }}>
                                {formatMetricValue(metricsData[key], key)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )}
          </div>
          )}

          {isOwner && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                margin: '0 16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: isTradesExpanded ? '0' : '10px'
              }}
              onClick={() => setIsTradesExpanded(!isTradesExpanded)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeftRight style={{ width: '16px', height: '16px', color: '#10b981' }} />
                <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>
                  View Trades ({bot.trades ?? 0})
                </span>
              </div>
              {isTradesExpanded ? (
                <ChevronUp style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              ) : (
                <ChevronDown style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              )}
            </div>

            {isTradesExpanded && (
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                margin: '8px 16px 10px',
                overflow: 'hidden'
              }}>
                {tradesLoading && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
                    <Loader2 style={{ width: '20px', height: '20px', color: '#0891b2', animation: 'spin 1s linear infinite' }} />
                  </div>
                )}

                {tradesError && (
                  <div style={{ color: '#6b7280', fontSize: '13px', padding: '20px', textAlign: 'center' }}>
                    {tradesError}
                  </div>
                )}

                {!tradesLoading && !tradesError && tradesData && tradesData.length === 0 && (
                  <div style={{ color: '#6b7280', fontSize: '13px', padding: '20px', textAlign: 'center' }}>
                    No trades
                  </div>
                )}

                {!tradesLoading && !tradesError && tradesData && tradesData.length > 0 && (
                  <div style={{
                    borderTop: '1px solid #f0f0f0',
                  }}>
                    {tradesData.map((trade, index) => (
                      <div
                        key={trade.id}
                        onClick={() => setSelectedTrade(trade)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 12px',
                          borderBottom: index < tradesData.length - 1 ? '1px solid #f5f5f5' : 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: trade.side.toLowerCase() === 'buy' ? '#14b8a6' : '#f97316',
                            width: '36px',
                          }}>
                            {trade.side.toUpperCase()}
                          </span>
                          <span style={{
                            fontSize: '13px',
                            color: '#888',
                            fontFamily: 'ui-monospace, monospace',
                          }}>
                            {formatTradeTime(trade.executed_at)}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#555',
                          fontFamily: 'ui-monospace, monospace',
                        }}>
                          {trade.side.toLowerCase() === 'buy' ? '−' : '+'}{formatTradeEth(trade.side.toLowerCase() === 'buy' ? trade.amount_in : trade.amount_out)} ETH
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                margin: '0 16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: isStrategyExpanded ? '0' : '10px'
              }}
              onClick={() => setIsStrategyExpanded(!isStrategyExpanded)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitBranch style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
                <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>Show Strategy</span>
              </div>
              {isStrategyExpanded ? (
                <ChevronUp style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              ) : (
                <ChevronDown style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              )}
            </div>

            {isStrategyExpanded && (
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                margin: '8px 16px 10px',
                overflow: 'hidden'
              }}>
                {strategyLoading && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
                    <Loader2 style={{ width: '20px', height: '20px', color: '#0891b2', animation: 'spin 1s linear infinite' }} />
                  </div>
                )}

                {strategyError && (
                  <div style={{ color: '#6b7280', fontSize: '13px', padding: '20px', textAlign: 'center' }}>
                    {strategyError}
                  </div>
                )}

                {!strategyLoading && !strategyError && strategyData && (
                  <div>
                    {/* Reference Link */}
                    <div style={{ padding: '12px 16px 0 16px' }}>
                      <span
                        onClick={() => router.push('/docs/gammascript-reference')}
                        style={{
                          fontSize: '13px',
                          color: '#888',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        → View GammaScript Reference
                      </span>
                    </div>

                    {/* Strategy Steps */}
                    <div style={{
                      padding: '12px 16px',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '12px',
                      color: '#333',
                    }}>
                      {(() => {
                        // Format condition string with spaces around operators
                        const formatCondition = (c: string): string => {
                          return c
                            .replace(/&&/g, ' && ')
                            .replace(/([<>!=]=?)/g, ' $1 ')
                            .replace(/\*/g, ' * ')
                            .replace(/\s+/g, ' ')
                            .trim()
                        }
                        try {
                          const steps: StrategyStep[] = JSON.parse(strategyData.user_friendly_strategy)
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {steps.map((step, index) => (
                                <div key={index}>
                                  <div style={{ display: 'flex', fontSize: '12px' }}>
                                    <span style={{ flexShrink: 0, color: '#9ca3af', fontSize: '13px' }}>{index + 1}&nbsp;&nbsp;</span>
                                    <span style={{ flexShrink: 0, color: 'rgba(139, 92, 246, 0.7)' }}>c:&nbsp;</span>
                                    <span style={{ wordBreak: 'break-word' }}>{formatCondition(step.c)}</span>
                                  </div>
                                  <div style={{ display: 'flex', marginTop: '-2px', fontSize: '12px' }}>
                                    <span style={{ flexShrink: 0, color: '#9ca3af', fontSize: '13px' }}>&nbsp;&nbsp;&nbsp;</span>
                                    <span style={{ flexShrink: 0, color: 'rgba(139, 92, 246, 0.7)' }}>a:&nbsp;</span>
                                    <span>{step.a.map(a => a === 'sell 1' ? 'sell all' : a).join(', ')}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        } catch {
                          return <div style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>Unable to parse strategy</div>
                        }
                      })()}
                    </div>

                    {/* Creator */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px 4px 16px',
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: '#888',
                      }}>
                        Creator
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={`https://basescan.org/address/${strategyData.creator_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '13px',
                            fontFamily: 'ui-monospace, monospace',
                            color: '#14b8a6',
                            textDecoration: 'none',
                          }}
                        >
                          {strategyData.creator_address.slice(0, 6)}...{strategyData.creator_address.slice(-4)}
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(strategyData.creator_address)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Owner */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 16px 12px 16px',
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: '#888',
                      }}>
                        Owner
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={`https://basescan.org/address/${strategyData.owner_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '13px',
                            fontFamily: 'ui-monospace, monospace',
                            color: '#14b8a6',
                            textDecoration: 'none',
                          }}
                        >
                          {strategyData.owner_address.slice(0, 6)}...{strategyData.owner_address.slice(-4)}
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(strategyData.owner_address)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clone Button - Public view only */}
        {!isOwner && (
        <div style={{ padding: '2px 16px 16px' }}>
          <button
            onClick={() => {
              const params = new URLSearchParams()
              if (from) params.set('from', from)
              if (bot.token_address) params.set('token_address', bot.token_address)
              if (bot.token_symbol) params.set('token_symbol', bot.token_symbol)
              if (bot.token_name) params.set('token_name', bot.token_name)
              if (bot.strategy_id) params.set('strategy_id', bot.strategy_id)
              if (bot.moving_average) params.set('moving_avg', bot.moving_average.toString())
              if (bot.profit_share !== undefined) params.set('profit_share', bot.profit_share.toString())
              if (bot.profit_threshold !== undefined) params.set('profit_threshold', bot.profit_threshold.toString())
              const redirectUrl = `/my-bots/create?${params.toString()}`
              if (!userExists && onSignUpRequired) {
                onSignUpRequired(redirectUrl)
                onClose()
                return
              }
              router.push(redirectUrl)
              onClose()
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px 16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <Copy style={{ width: '16px', height: '16px', color: '#1c1c1e' }} />
            <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>Clone</span>
          </button>
        </div>
        )}

        {/* Action Buttons - Owner only */}
        {isOwner && bot.status === 'active' && (
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={handleOpenEdit}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px 16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              cursor: 'pointer',
              border: 'none',
              marginBottom: '10px'
            }}
          >
            <Edit3 style={{ width: '16px', height: '16px', color: '#1c1c1e' }} />
            <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>Edit</span>
          </button>
          {bot.trade_mode === 'buy' ? (
            <button
              onClick={() => setIsDeactivateOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 16px',
                backgroundColor: '#e4e6e9',
                borderRadius: '12px',
                cursor: 'pointer',
                border: 'none',
                marginBottom: '10px'
              }}
            >
              <Power style={{ width: '16px', height: '16px', color: '#1c1c1e' }} />
              <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>Deactivate</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLiquidateOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              <Banknote style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              <span style={{ color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>Liquidate</span>
            </button>
          )}
          <button
            onClick={() => {
              const params = new URLSearchParams()
              if (bot.token_address) params.set('token_address', bot.token_address)
              if (bot.token_symbol) params.set('token_symbol', bot.token_symbol)
              if (bot.token_name) params.set('token_name', bot.token_name)
              if (bot.strategy_id) params.set('strategy_id', bot.strategy_id)
              if (bot.moving_average) params.set('moving_avg', bot.moving_average.toString())
              if (bot.profit_share !== undefined) params.set('profit_share', bot.profit_share.toString())
              if (bot.profit_threshold !== undefined) params.set('profit_threshold', bot.profit_threshold.toString())
              router.push(`/my-bots/create?${params.toString()}`)
              onClose()
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px 16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              cursor: 'pointer',
              border: 'none',
              marginTop: '10px'
            }}
          >
            <Copy style={{ width: '16px', height: '16px', color: '#1c1c1e' }} />
            <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>Clone</span>
          </button>
        </div>
        )}

        {/* Trade Details Drawer */}
        {selectedTrade && (
          <div
            onClick={() => setSelectedTrade(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'flex-end',
              animation: 'fadeIn 0.2s ease',
              zIndex: 1001,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                backgroundColor: '#fff',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '0 20px 32px 20px',
                animation: 'slideUp 0.25s ease',
              }}
            >
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                <div style={{ width: '36px', height: '4px', backgroundColor: '#ddd', borderRadius: '2px' }} />
              </div>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: selectedTrade.side.toLowerCase() === 'buy' ? '#14b8a6' : '#f97316' }}>
                    {selectedTrade.side.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '14px', color: '#888' }}>Trade Details</span>
                </div>
                <button
                  onClick={() => setSelectedTrade(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#888' }}>Timestamp</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#333', fontFamily: 'ui-monospace, monospace' }}>
                    {formatTradeDetailTime(selectedTrade.executed_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#888' }}>Price</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#14b8a6', fontFamily: 'ui-monospace, monospace' }}>
                    {parseFloat(selectedTrade.price).toFixed(12)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#888' }}>Token In</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#333', fontFamily: 'ui-monospace, monospace' }}>
                    {selectedTrade.side.toLowerCase() === 'buy'
                      ? `${formatTradeEth(selectedTrade.amount_in)} ETH`
                      : `${formatTradeTokenAmount(selectedTrade.amount_in)} ${bot.token_symbol}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#888' }}>Token Out</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#333', fontFamily: 'ui-monospace, monospace' }}>
                    {selectedTrade.side.toLowerCase() === 'buy'
                      ? `${formatTradeTokenAmount(selectedTrade.amount_out)} ${bot.token_symbol}`
                      : `${formatTradeEth(selectedTrade.amount_out)} ETH`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#888' }}>Strategy</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    {selectedTrade.strategy ?? '--'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#888' }}>Strategy Step</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    {selectedTrade.step ?? '--'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#888' }}>Tx Hash</span>
                  <a
                    href={`https://basescan.org/tx/${selectedTrade.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '14px', fontWeight: '500', color: '#14b8a6', fontFamily: 'ui-monospace, monospace', textDecoration: 'none' }}
                  >
                    {selectedTrade.tx_hash.slice(0, 6)}...{selectedTrade.tx_hash.slice(-4)}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Bot Drawer */}
        {isEditOpen && (
          <div
            onClick={() => setIsEditOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'flex-end',
              animation: 'fadeIn 0.2s ease',
              zIndex: 1001,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                backgroundColor: '#fff',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '0 20px 32px 20px',
                animation: 'slideUp 0.25s ease',
              }}
            >
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                <div style={{ width: '36px', height: '4px', backgroundColor: '#ddd', borderRadius: '2px' }} />
              </div>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Edit3 style={{ width: '18px', height: '18px', color: '#1c1c1e' }} />
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#1c1c1e' }}>Edit Bot</span>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Inputs Row */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Strategy ID */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                      Strategy ID
                    </label>
                    <input
                      type="number"
                      value={editStrategyId}
                      onChange={(e) => setEditStrategyId(e.target.value)}
                      onBlur={handleStrategyBlur}
                      min="1"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '16px',
                        fontWeight: '500',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: '#f9fafb',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Moving Avg */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                      Moving Avg (min)
                    </label>
                    <input
                      type="number"
                      value={editMovingAvg}
                      onChange={(e) => setEditMovingAvg(e.target.value)}
                      onBlur={handleMovingAvgBlur}
                      min="1"
                      max="60"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '16px',
                        fontWeight: '500',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: '#f9fafb',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {editError && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    color: '#dc2626',
                    fontSize: '14px',
                  }}>
                    {editError}
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleEditSubmit}
                  disabled={editLoading}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#fff',
                    backgroundColor: editLoading ? '#9ca3af' : '#14b8a6',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: editLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {editLoading ? (
                    <>
                      <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liquidate Confirmation Drawer */}
        {isLiquidateOpen && (
          <div
            onClick={() => !liquidateLoading && setIsLiquidateOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'flex-end',
              animation: 'fadeIn 0.2s ease',
              zIndex: 1001,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                backgroundColor: '#fff',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '0 20px 32px 20px',
                animation: 'slideUp 0.25s ease',
              }}
            >
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                <div style={{ width: '36px', height: '4px', backgroundColor: '#ddd', borderRadius: '2px' }} />
              </div>

              {/* Content */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '12px',
                }}>
                  Liquidate & Deactivate {bot.display_name || `${bot.token_symbol} #${bot.bot_id}`}?
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                }}>
                  This will sell all current holdings back to ETH and deactivate this bot. This cannot be undone.
                </div>
              </div>

              {/* Error Message */}
              {liquidateError && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  fontSize: '14px',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}>
                  {liquidateError}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsLiquidateOpen(false)}
                  disabled={liquidateLoading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#333',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: liquidateLoading ? 'not-allowed' : 'pointer',
                    opacity: liquidateLoading ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLiquidate}
                  disabled={liquidateLoading || !!liquidateError}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#fff',
                    backgroundColor: '#ef4444',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: (liquidateLoading || liquidateError) ? 'not-allowed' : 'pointer',
                    opacity: (liquidateLoading || liquidateError) ? 0.5 : 1,
                  }}
                >
                  {liquidateLoading ? 'Liquidating...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deactivate Confirmation Drawer */}
        {isDeactivateOpen && (
          <div
            onClick={() => !deactivateLoading && setIsDeactivateOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'flex-end',
              animation: 'fadeIn 0.2s ease',
              zIndex: 1001,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                backgroundColor: '#fff',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '0 20px 32px 20px',
                animation: 'slideUp 0.25s ease',
              }}
            >
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                <div style={{ width: '36px', height: '4px', backgroundColor: '#ddd', borderRadius: '2px' }} />
              </div>

              {/* Content */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '12px',
                }}>
                  Deactivate {bot.display_name || `${bot.token_symbol} #${bot.bot_id}`}?
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                }}>
                  This will deactivate this bot.
                </div>
              </div>

              {/* Error Message */}
              {deactivateError && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  fontSize: '14px',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}>
                  {deactivateError}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsDeactivateOpen(false)}
                  disabled={deactivateLoading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#333',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: deactivateLoading ? 'not-allowed' : 'pointer',
                    opacity: deactivateLoading ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={deactivateLoading || !!deactivateError}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#fff',
                    backgroundColor: '#ef4444',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: (deactivateLoading || deactivateError) ? 'not-allowed' : 'pointer',
                    opacity: (deactivateLoading || deactivateError) ? 0.5 : 1,
                  }}
                >
                  {deactivateLoading ? 'Deactivating...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
