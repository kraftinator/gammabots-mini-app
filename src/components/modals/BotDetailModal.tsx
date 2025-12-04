'use client'

import { useState, useEffect } from 'react'
import { Activity, ChevronDown, ChevronUp, RefreshCw, Code, Copy, Edit3, ArrowDownToLine, Loader2 } from 'lucide-react'
import { colors, getProfitColor } from '@/styles/common'
import { useQuickAuth } from '@/hooks/useQuickAuth'

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
}

interface BotDetailModalProps {
  isOpen: boolean
  onClose: () => void
  bot: Bot | null
}

// Metrics categories configuration
const metricsCategories = [
  {
    title: 'Position & Trades',
    keys: ['tokenAmt', 'buyCount', 'sellCount', 'movingAvg', 'lastSellPrice']
  },
  {
    title: 'Price Snapshot & Extremes',
    keys: ['currentPrice', 'prevPrice', 'rollingHigh', 'creationPrice', 'highSinceCreate', 'lowSinceCreate', 'highInitBuy', 'lowInitBuy', 'highLastTrade', 'lowLastTrade', 'priceDiv']
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

export default function BotDetailModal({ isOpen, onClose, bot }: BotDetailModalProps) {
  const { authenticate } = useQuickAuth()
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false)
  const [metricsData, setMetricsData] = useState<Record<string, any> | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  // Reset metrics state when bot changes
  useEffect(() => {
    setIsMetricsExpanded(false)
    setMetricsData(null)
    setMetricsError(null)
  }, [bot?.bot_id])

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
  const formatMetricValue = (value: any, key?: string): string => {
    if (value === null || value === undefined) return '--'
    if (typeof value === 'number') {
      if (isNaN(value)) return '--'
      // Format tokenAmt specially
      if (key === 'tokenAmt') {
        return formatTokenAmt(value)
      }
      // Limit botProfit to 4 decimals
      if (key === 'botProfit') {
        return value.toFixed(4)
      }
      // Check if it's a price-like value (has many decimals)
      const str = value.toString()
      if (str.includes('.') && str.split('.')[1].length > 8) {
        return value.toFixed(8)
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
      // Limit botProfit to 4 decimals
      if (key === 'botProfit' && !isNaN(num)) {
        return num.toFixed(4)
      }
      if (!isNaN(num) && value.includes('.') && value.split('.')[1].length > 8) {
        return num.toFixed(8)
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
          padding: '20px'
        }}
        onClick={onClose}
      >
      <div
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
          padding: '24px 24px 10px',
          borderBottom: '1px solid #f2f2f7',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#1c1c1e'
            }}>
              {bot.token_symbol}
            </span>
            <span style={{
              fontSize: '11px',
              color: '#8e8e93',
              fontWeight: '500'
            }}>
              #{bot.bot_id}
            </span>
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: bot.status === 'unfunded' ? colors.error : (bot.is_active ? colors.success : colors.text.secondary)
            }}>
              {bot.status === 'unfunded' ? 'Awaiting funding' : (bot.is_active ? 'Active' : 'Inactive')}
            </span>
          </div>
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

        {/* Current Value Section */}
        <div style={{
          padding: '20px 24px 0px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '4px',
            fontWeight: '400'
          }}>
            Current Value
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1c1c1e'
            }}>
              ETH {bot.value ? Number(bot.value).toFixed(4) : '0.0000'}
            </span>
            <span style={{
              fontSize: '16px',
              fontWeight: '500',
              color: getProfitColor(Number(bot.profit_percent) || 0)
            }}>
              {bot.profit_percent && Number(bot.profit_percent) > 0 ? '+' : ''}{Number(bot.profit_percent || 0).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div style={{ padding: '20px 24px' }}>
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

            {/* Holdings */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Holdings</span>
              <div style={{ textAlign: 'right' }}>
                {(() => {
                  const tokensNum = bot.tokens ? Number(bot.tokens) : 0
                  const ethNum = bot.eth ? Number(bot.eth) : 0

                  if (tokensNum > 0 && ethNum > 0) {
                    return (
                      <>
                        <div style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                          {formatTokenAmount(tokensNum)} {bot.token_symbol}
                        </div>
                        <div style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                          {ethNum.toFixed(4)} ETH
                        </div>
                      </>
                    )
                  } else if (tokensNum > 0) {
                    return (
                      <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                        {formatTokenAmount(tokensNum)} {bot.token_symbol}
                      </span>
                    )
                  } else if (ethNum > 0) {
                    return (
                      <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                        {ethNum.toFixed(4)} ETH
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

            {/* Last Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Last Action</span>
              <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                {bot.last_action || 'N/A'}
              </span>
            </div>

            {/* Init Value */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Initial Value</span>
              <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                {bot.init ? `${Number(bot.init).toFixed(4)} ETH` : '0.0000 ETH'}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Sections */}
        <div style={{ padding: '0 24px 20px' }}>
          <div>
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
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
                marginTop: '8px',
                marginBottom: '10px'
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

          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw style={{ width: '16px', height: '16px', color: '#10b981' }} />
              <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>
                View Cycles {bot.cycles ? `(${bot.cycles})` : ''}
              </span>
            </div>
            <ChevronDown style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          </div>

          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
              <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>Show Strategy JSON</span>
            </div>
            <ChevronDown style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px 16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              cursor: 'pointer',
              border: 'none'
            }}>
              <Copy style={{ width: '16px', height: '16px', color: '#1c1c1e' }} />
              <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>Copy</span>
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px 16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              cursor: 'pointer',
              border: 'none'
            }}>
              <Edit3 style={{ width: '16px', height: '16px', color: '#1c1c1e' }} />
              <span style={{ color: '#1c1c1e', fontSize: '14px', fontWeight: '500' }}>Edit</span>
            </button>
          </div>
          <button style={{
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
          }}>
            <ArrowDownToLine style={{ width: '16px', height: '16px', color: '#dc2626' }} />
            <span style={{ color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>Liquidate &amp; Deactivate</span>
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
