'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import RobotLogo from '@/components/RobotLogo'
import { formatTokenAmount } from '@/utils/formatters'

export default function Home() {
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    active_bots: 0,
    tvl: 0,
    volume_24h: 0,
    strategies: 0,
    total_profits: 0,
    trades_executed: 0,
    active_bots_change_24h: 0,
    tvl_change_24h: 0,
    volume_24h_change_24h: 0,
    trending_tokens: [] as Array<{
      token_symbol: string;
      volume_24h_usd: number;
    }>,
    recent_activity: [] as Array<{
      action: string;
      amount: number;
      token_symbol: string;
      strategy_id: string;
      time_ago: string;
      owner_username: string;
      owner_avatar_url: string;
      performance_pct: number | null;
      display_name: string;
    }>,
    top_performers: [] as Array<{
      bot_id: number;
      owner_username: string;
      strategy_id: string;
      token_symbol: string;
      performance_pct: number;
      owner_avatar_url: string;
      display_name: string;
    }>,
  })

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/public/dashboard')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setDashboardLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 10000) {
      return `$${(value / 1000).toFixed(0)}K`
    } else if (value >= 1) {
      return `$${Math.round(value).toLocaleString()}`
    } else {
      return `$${Number(value).toFixed(2)}`
    }
  }

  const formatPercentageChange = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value) || value === 0) return ""
    const sign = value > 0 ? "+" : ""
    return `${sign}${Number(value).toFixed(1)}%`
  }

  const getChangeColor = (change: string | undefined): string => {
    if (!change) return '#8e8e93'
    if (change.startsWith('+')) return '#34c759'
    if (change.startsWith('-')) return '#ff3b30'
    return '#8e8e93'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2d3f54',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RobotLogo size={40} />
          <span style={{ color: 'white', fontSize: '20px', fontWeight: '600', letterSpacing: '0.05em' }}>
            GAMMABOTS
          </span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/docs/how-it-works" style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none' }}>
            How it Works
          </Link>
          <Link href="/docs/what-is-gammascript" style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none' }}>
            GammaScript
          </Link>
          <a
            href="https://farcaster.xyz/miniapps/S8DW4VMywzs_/gammabots"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#14b8a6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Open Mini App
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        backgroundColor: '#2d3f54',
        padding: '48px 24px 64px',
        textAlign: 'center',
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '16px',
        }}>
          Trading bots. Simplified.
        </h1>
        <p style={{
          color: '#cbd5e1',
          fontSize: '18px',
          maxWidth: '600px',
          margin: '0 auto 24px',
          lineHeight: '1.6',
        }}>
          Deploy automated trading bots in seconds — without managing infrastructure or watching charts all day.
        </p>
        <a
          href="https://farcaster.xyz/miniapps/S8DW4VMywzs_/gammabots"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            backgroundColor: '#14b8a6',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          Launch on Farcaster
        </a>
      </section>

      {/* Dashboard Preview */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* Platform Metrics */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', marginBottom: '16px' }}>
            Platform Stats
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <MetricCard label="Active Bots" value={dashboardData.active_bots.toLocaleString()} change={formatPercentageChange(dashboardData.active_bots_change_24h)} loading={dashboardLoading} getChangeColor={getChangeColor} />
            <MetricCard label="TVL" value={formatCurrency(dashboardData.tvl)} change={formatPercentageChange(dashboardData.tvl_change_24h)} loading={dashboardLoading} getChangeColor={getChangeColor} />
            <MetricCard label="24h Volume" value={formatCurrency(dashboardData.volume_24h)} change={formatPercentageChange(dashboardData.volume_24h_change_24h)} loading={dashboardLoading} getChangeColor={getChangeColor} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <MetricCard label="Strategies" value={dashboardData.strategies.toLocaleString()} loading={dashboardLoading} getChangeColor={getChangeColor} />
            <MetricCard label="Total Profits" value={formatCurrency(dashboardData.total_profits)} loading={dashboardLoading} getChangeColor={getChangeColor} />
            <MetricCard label="Total Trades" value={dashboardData.trades_executed.toLocaleString()} loading={dashboardLoading} getChangeColor={getChangeColor} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Top Performers */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', marginBottom: '16px' }}>
              Top Performers <span style={{ fontSize: '14px', fontWeight: '500', color: '#8e8e93' }}>30d</span>
            </h2>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}>
              {dashboardData.top_performers.slice(0, 5).map((performer, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    gap: '12px',
                    borderBottom: index < 4 ? '1px solid #f2f2f7' : 'none',
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {performer.owner_avatar_url ? (
                      <img
                        src={performer.owner_avatar_url}
                        alt={performer.owner_username}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#e5e5ea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#8e8e93',
                      }}>
                        {performer.owner_username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: '700',
                      color: 'white',
                      background: '#6b7fa3',
                      border: '2px solid white',
                    }}>
                      {index + 1}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1c1c1e',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {performer.display_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8e8e93' }}>
                      by @{performer.owner_username} · Strategy #{performer.strategy_id}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#34c759',
                  }}>
                    {Number(performer.performance_pct) >= 0 ? '+' : ''}{Number(performer.performance_pct).toFixed(1)}%
                  </div>
                </div>
              ))}
              {dashboardData.top_performers.length === 0 && !dashboardLoading && (
                <div style={{ padding: '24px', textAlign: 'center', color: '#8e8e93' }}>
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', marginBottom: '16px' }}>
              Recent Activity
            </h2>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}>
              {dashboardData.recent_activity.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    gap: '12px',
                    borderBottom: index < 4 ? '1px solid #f2f2f7' : 'none',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {activity.owner_avatar_url ? (
                      <img
                        src={activity.owner_avatar_url.replace('/rectcrop3', '/original')}
                        alt={activity.owner_username}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: activity.action === 'Buy' ? '#34c759' : '#ff3b30',
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', color: '#1c1c1e' }}>
                      <span style={{ fontWeight: '600' }}>{activity.action === 'Buy' ? 'Bought' : 'Sold'}</span>{' '}
                      <span style={{ fontWeight: '500' }}>{activity.token_symbol}</span>{' '}
                      <span style={{ fontSize: '12px', color: '#8e8e93' }}>· {formatTokenAmount(activity.amount)}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#8e8e93' }}>
                      Strategy #{activity.strategy_id} · @{activity.owner_username} · {activity.time_ago} ago
                    </div>
                  </div>
                  {activity.performance_pct !== null && (
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: activity.performance_pct >= 2 ? '#34c759' : activity.performance_pct <= -2 ? '#ff3b30' : '#8e8e93',
                    }}>
                      {activity.performance_pct > 0 ? '+' : ''}{Number(activity.performance_pct).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
              {dashboardData.recent_activity.length === 0 && !dashboardLoading && (
                <div style={{ padding: '24px', textAlign: 'center', color: '#8e8e93' }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trending Tokens */}
        {dashboardData.trending_tokens.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e', marginBottom: '16px' }}>
              Trending Tokens
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {dashboardData.trending_tokens.slice(0, 4).map((token, index) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                return (
                  <div
                    key={token.token_symbol}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      border: `2px solid ${colors[index % colors.length]}`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1c1c1e',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {token.token_symbol.length > 15 ? `${token.token_symbol.slice(0, 15)}...` : token.token_symbol}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8e8e93' }}>
                      {formatCurrency(Number(token.volume_24h_usd))} VOL
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1c1c1e', marginBottom: '12px' }}>
            Ready to start trading?
          </h2>
          <p style={{ color: '#8e8e93', marginBottom: '20px' }}>
            Open the Gammabots mini app on Farcaster to create your first bot.
          </p>
          <a
            href="https://farcaster.xyz/miniapps/S8DW4VMywzs_/gammabots"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#14b8a6',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Open Mini App
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        color: '#8e8e93',
        fontSize: '14px',
      }}>
        <p>Gammabots runs on Base.</p>
      </footer>
    </div>
  )
}

function MetricCard({
  label,
  value,
  change,
  loading,
  getChangeColor,
}: {
  label: string
  value: string
  change?: string
  loading?: boolean
  getChangeColor: (change: string | undefined) => string
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontSize: '12px', color: '#8e8e93', marginBottom: '4px' }}>{label}</div>
      {loading ? (
        <div style={{
          height: '24px',
          width: '60%',
          backgroundColor: '#e5e5e5',
          borderRadius: '4px',
          margin: '4px 0',
        }} />
      ) : (
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1c1c1e' }}>{value}</div>
      )}
      {loading ? (
        <div style={{
          height: '14px',
          width: '40%',
          backgroundColor: '#e5e5e5',
          borderRadius: '3px',
        }} />
      ) : (
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: getChangeColor(change),
          height: '14px',
        }}>
          {change || '\u00A0'}
        </div>
      )}
    </div>
  )
}
