'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { GitBranch, ChevronDown, ChevronUp } from 'lucide-react'
import { getProfitColor } from '@/styles/common'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { copyToClipboard } from '@/utils/clipboard'

interface StrategyStats {
  id: string
  strategy_id: string
  creator_address: string
  creator_handle?: string
  owner_address: string
  compressed_strategy: string
  user_friendly_strategy: string
  mint_status: string
  status: string
  created_at: string
  bots_count: number
  performance_pct?: number
  total_profit_pct?: number
  win_rate_pct?: number
  gamma_score?: number
  top_bot?: {
    bot_id: string
    token_symbol: string
    owner_handle?: string
    profit_pct: number
    bot_display_name?: string
  }
}

interface StrategyStep {
  c: string
  a: string[]
}

interface StrategyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  strategyId: string | null
  userExists?: boolean
  onSignUpRequired?: (redirectUrl: string) => void
}

export default function StrategyDetailModal({ isOpen, onClose, strategyId, userExists = true, onSignUpRequired }: StrategyDetailModalProps) {
  const router = useRouter()
  const { authenticate } = useQuickAuth()

  const [stats, setStats] = useState<StrategyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isStrategyExpanded, setIsStrategyExpanded] = useState(true)
  const [strategyView, setStrategyView] = useState<'logic' | 'gammascript'>('logic')

  // Reset state when modal closes or strategy changes
  useEffect(() => {
    if (!isOpen) {
      setStats(null)
      setError(null)
      setIsStrategyExpanded(true)
      setStrategyView('logic')
    }
  }, [isOpen])

  // Fetch stats when modal opens
  useEffect(() => {
    const fetchStats = async () => {
      if (!isOpen || !strategyId) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/strategies/${strategyId}/stats`)

        if (!response.ok) {
          throw new Error('Failed to fetch strategy stats')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching strategy stats:', err)
        setError('Failed to load strategy details')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isOpen, strategyId])

  // Lock body scroll when modal is open
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

  // Handle Create Bot - requires auth
  const handleCreateBot = async () => {
    const redirectUrl = `/mini-app/my-bots/create?strategy_id=${strategyId}&from=strategies`

    // If user hasn't signed up, show signup modal
    if (!userExists && onSignUpRequired) {
      onSignUpRequired(redirectUrl)
      onClose()
      return
    }

    const token = await authenticate()
    if (!token) return

    router.push(redirectUrl)
    onClose()
  }

  // Handle Copy Strategy - requires auth
  const handleCopyStrategy = async () => {
    if (!stats) return

    const redirectUrl = `/mini-app/strategies/create?strategy=${encodeURIComponent(stats.user_friendly_strategy)}`

    // If user hasn't signed up, show signup modal
    if (!userExists && onSignUpRequired) {
      onSignUpRequired(redirectUrl)
      onClose()
      return
    }

    const token = await authenticate()
    if (!token) return

    router.push(redirectUrl)
    onClose()
  }

  // Format created date
  const formatCreatedDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true }).replace('about ', '')
    } catch {
      return 'Unknown'
    }
  }

  // Format address
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }


  if (!isOpen) return null

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .strategy-modal-content {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .strategy-modal-content::-webkit-scrollbar {
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
          padding: '10px',
        }}
        onClick={onClose}
      >
        <div
          className="strategy-modal-content"
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            minHeight: '400px',
            overflowY: 'auto',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Loading State */}
          {loading && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#888' }}>
              Loading...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {/* Content */}
          {!loading && !error && stats && (
            <>
              {/* Header */}
              <div style={{
                padding: '20px 16px 16px 16px',
                borderBottom: '1px solid #eee',
                position: 'relative',
              }}>
                {/* Close Button */}
                <button
                  onClick={onClose}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>

                {/* Strategy ID + Creator on same line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    #{stats.strategy_id}
                  </span>
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    by @{stats.creator_handle || 'unknown'}
                  </span>
                </div>
              </div>

              {/* Stats Card */}
              <div style={{ padding: '16px' }}>
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* GammaScore */}
                    {stats.gamma_score != null && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
                        <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>GammaScore</span>
                        <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                          {(Number(stats.gamma_score) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Bots */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Bots</span>
                      <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                        {Number(stats.bots_count) || 0}
                      </span>
                    </div>

                    {/* Avg Return */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Avg Return (30d)</span>
                      {stats.performance_pct != null ? (
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          lineHeight: '1.5',
                          color: getProfitColor(Number(stats.performance_pct) || 0, false),
                        }}>
                          {Number(stats.performance_pct) > 0 ? '+' : ''}{Number(stats.performance_pct || 0).toFixed(2)}%
                        </span>
                      ) : (
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#adadad', lineHeight: '1.5' }}>N/A</span>
                      )}
                    </div>

                    {/* Win Rate */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Win Rate (30d)</span>
                      {stats.win_rate_pct != null ? (
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          lineHeight: '1.5',
                          color: Number(stats.win_rate_pct) > 50 ? '#34c759' : Number(stats.win_rate_pct) < 50 ? '#ff3b30' : '#1c1c1e',
                        }}>
                          {Number(stats.win_rate_pct || 0).toFixed(1)}%
                        </span>
                      ) : (
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#adadad', lineHeight: '1.5' }}>N/A</span>
                      )}
                    </div>

                    {/* Created */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Created</span>
                      <span style={{ fontSize: '13px', color: '#1c1c1e', fontWeight: '500', lineHeight: '1.5' }}>
                        {formatCreatedDate(stats.created_at)}
                      </span>
                    </div>

                    {/* Top Bot (only show if exists) */}
                    {stats.top_bot && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: '20px' }}>
                        <span style={{ fontSize: '13px', color: '#adadad', fontWeight: '400', lineHeight: '1.5' }}>Top Bot</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#1c1c1e', lineHeight: '1.5' }}>
                            {stats.top_bot.bot_display_name || `${stats.top_bot.token_symbol} #${stats.top_bot.bot_id}`}{' '}
                            <span style={{ color: getProfitColor(Number(stats.top_bot.profit_pct) || 0) }}>
                              {Number(stats.top_bot.profit_pct) > 0 ? '+' : ''}{Number(stats.top_bot.profit_pct || 0).toFixed(2)}%
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#adadad', lineHeight: '1.5' }}>
                            by @{stats.top_bot.owner_handle || 'unknown'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Create Bot Button */}
              <div style={{ padding: '0 16px 16px 16px' }}>
                <button
                  onClick={handleCreateBot}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#14b8a6',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Create Bot
                </button>
              </div>

              {/* Strategy Accordion */}
              <div style={{ padding: '0 16px 16px 16px' }}>
                {/* Accordion Header */}
                <div
                  onClick={() => setIsStrategyExpanded(!isStrategyExpanded)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GitBranch style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1c1c1e' }}>
                      Show Strategy
                    </span>
                  </div>
                  {isStrategyExpanded ? (
                    <ChevronUp style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  ) : (
                    <ChevronDown style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  )}
                </div>

                {/* Accordion Content - separate box with margin for white gap */}
                {isStrategyExpanded && (
                  <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    marginTop: '8px',
                    overflow: 'hidden',
                  }}>
                    {/* View Toggle */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                    }}>
                      <button
                        onClick={() => setStrategyView('logic')}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: strategyView === 'logic' ? '600' : '400',
                          color: strategyView === 'logic' ? '#8b5cf6' : '#888',
                          cursor: 'pointer',
                          padding: '0',
                        }}
                      >
                        Readable
                      </button>
                      <span style={{ fontSize: '13px', color: '#ccc' }}>|</span>
                      <button
                        onClick={() => setStrategyView('gammascript')}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: strategyView === 'gammascript' ? '600' : '400',
                          color: strategyView === 'gammascript' ? '#8b5cf6' : '#888',
                          cursor: 'pointer',
                          padding: '0',
                        }}
                      >
                        Raw
                      </button>
                    </div>

                    {/* Reference Link */}
                    <div style={{ padding: '0 16px 8px 16px' }}>
                      <span
                        onClick={() => router.push('/mini-app/docs/gammascript-reference')}
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

                    {/* Logic View */}
                    {strategyView === 'logic' && (
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
                            const steps: StrategyStep[] = JSON.parse(stats.user_friendly_strategy)
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
                            return <div style={{ padding: '12px', color: '#888', fontSize: '13px' }}>Unable to parse strategy</div>
                          }
                        })()}
                      </div>
                    )}

                    {/* Raw View */}
                    {strategyView === 'gammascript' && (
                      <div style={{
                        backgroundColor: '#f0f0f0',
                        margin: '0 16px 16px 16px',
                        borderRadius: '8px',
                        padding: '12px',
                        position: 'relative',
                      }}>
                        <button
                          onClick={() => {
                            try {
                              const parsed = JSON.parse(stats.user_friendly_strategy)
                              const formatted = '[\n' + parsed.map((r: StrategyStep) => {
                                const formattedC = r.c
                                  .replace(/&&/g, ' && ')
                                  .replace(/([<>!=]=?)/g, ' $1 ')
                                  .replace(/\*/g, ' * ')
                                  .replace(/\s+/g, ' ')
                                  .trim()
                                const actionsStr = JSON.stringify(r.a)
                                return `  {\n    "c": "${formattedC}",\n    "a": ${actionsStr}\n  }`
                              }).join(',\n') + '\n]'
                              copyToClipboard(formatted)
                            } catch {
                              copyToClipboard(stats.user_friendly_strategy)
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        </button>
                        <div style={{
                          fontFamily: 'ui-monospace, monospace',
                          fontSize: '12px',
                          color: '#333',
                          whiteSpace: 'pre',
                          overflowX: 'auto',
                          paddingRight: '24px',
                        }}>
                          {(() => {
                            try {
                              const parsed = JSON.parse(stats.user_friendly_strategy)
                              const lines = parsed.map((r: StrategyStep) => {
                                const formattedC = r.c
                                  .replace(/&&/g, ' && ')
                                  .replace(/([<>!=]=?)/g, ' $1 ')
                                  .replace(/\*/g, ' * ')
                                  .replace(/\s+/g, ' ')
                                  .trim()
                                const actionsStr = JSON.stringify(r.a)
                                return `  {\n    "c": "${formattedC}",\n    "a": ${actionsStr}\n  }`
                              })
                              return `[\n${lines.join(',\n')}\n]`
                            } catch {
                              return stats.user_friendly_strategy
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Creator */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px 4px 16px',
                    }}>
                      <span style={{ fontSize: '13px', color: '#888' }}>Creator</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={`https://basescan.org/address/${stats.creator_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '13px', fontFamily: 'ui-monospace, monospace', color: '#14b8a6', textDecoration: 'none' }}
                        >
                          {formatAddress(stats.creator_address)}
                        </a>
                        <button
                          onClick={() => copyToClipboard(stats.creator_address)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
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
                      <span style={{ fontSize: '13px', color: '#888' }}>Owner</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={`https://basescan.org/address/${stats.owner_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '13px', fontFamily: 'ui-monospace, monospace', color: '#14b8a6', textDecoration: 'none' }}
                        >
                          {formatAddress(stats.owner_address)}
                        </a>
                        <button
                          onClick={() => copyToClipboard(stats.owner_address)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Copy Strategy */}
                    <div style={{ padding: '0 16px 16px 16px' }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#888',
                        textAlign: 'center',
                        marginBottom: '8px',
                      }}>
                        Want to build on this strategy?
                      </div>
                      <button
                        onClick={handleCopyStrategy}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#fff',
                          color: '#666',
                          fontSize: '15px',
                          fontWeight: '600',
                          border: '1px solid #e5e5e5',
                          borderRadius: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        Copy Strategy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
