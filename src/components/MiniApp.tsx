'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavigation from './BottomNavigation'
import Footer from './layout/Footer'
import SignUpModal from './modals/SignUpModal'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { styles, colors, getChangeColor, getCircleColor, getRankColor } from '@/styles/common'
import { formatTokenAmount } from '@/utils/formatters'
import { useMe } from '@/contexts/MeContext'
import RobotLogo from './RobotLogo'
import BotDetailModal, { Bot } from './modals/BotDetailModal'

export default function MiniApp() {
  const router = useRouter()
  const { authLoading, authError, authenticate, navigateToMyBots } = useQuickAuth()
  const { me, fetchMe } = useMe()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sdkRef, setSdkRef] = useState<typeof import('@farcaster/miniapp-sdk').sdk | null>(null)
  const [username, setUsername] = useState<string>('guest') // Default fallback for development
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)
  const [signUpRedirectTo, setSignUpRedirectTo] = useState<string>('/my-bots')
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null)
  const [isBotModalOpen, setIsBotModalOpen] = useState(false)

  // Function to fetch dashboard data with auth token
  const fetchDashboardData = async (token: string) => {
    try {
      console.log('🔍 Frontend: Calling /api/dashboard with token')

      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        console.log('✅ Frontend: Dashboard data loaded successfully')
      } else {
        console.warn('🚨 Frontend: Failed to fetch dashboard metrics data:', response.status)
      }
    } catch (dashboardError) {
      console.warn('🚨 Frontend: Error fetching dashboard data:', dashboardError)
    }
  }

  // Dashboard metrics from API
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
    popular_tokens: {} as Record<string, number>,
    recent_activity: [] as Array<{
      action: string;
      amount: number;
      token_symbol: string;
      strategy_id: string;
      bot_id: number;
      time_ago: string;
      farcaster_username: string;
      farcaster_avatar_url: string;
      performance_pct: number | null;
    }>,
    top_performers: [] as Array<{
      bot_id: number;
      username: string;
      strategy_id: string;
      token_symbol: string;
      token_address: string;
      moving_average: number;
      performance: string;
      farcaster_avatar_url: string;
    }>,
    user_bot_count: 0,
    user_exists: true,
    last_updated: null as string | null
  })

  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        // First, just show the component works
        setIsReady(true)
        
        // Load the SDK first
        const { sdk } = await import('@farcaster/miniapp-sdk')
        setSdkRef(sdk)
        
        // Check if we're running in a Mini App environment
        const inMiniApp = await sdk.isInMiniApp()

        if (inMiniApp) {
          // We're in a Mini App, call ready to hide splash screen
          await sdk.actions.ready()
          console.log('Mini App is ready!')
          
          // Get user context to display actual username
          try {
            const context = await sdk.context
            if (context?.user?.username) {
              setUsername(context.user.username)
            }
          } catch (userError) {
            console.warn('Could not fetch user context:', userError)
            // Keep the default username if user context fails
          }
        }

        // Perform Quick Auth and fetch dashboard data with auth
        const token = await authenticate()
        if (token) {
          await Promise.all([
            fetchMe(token),
            fetchDashboardData(token)
          ])
        }
        
      } catch (error) {
        console.error('Error initializing Mini App:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    initializeMiniApp()
  }, [])

  const handleMyBotsClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    await navigateToMyBots()
  }

  const handleSignUpSuccess = async () => {
    // Re-authenticate and refresh dashboard
    const token = await authenticate()
    if (token) {
      await Promise.all([
        fetchMe(token),
        fetchDashboardData(token)
      ])
    }
  }

  // Helper function to format currency values
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

  // Helper function to format percentage changes
  const formatPercentageChange = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value) || value === 0) return ""
    const sign = value > 0 ? "+" : ""
    return `${sign}${Number(value).toFixed(1)}%`
  }

  if (!isReady) {
    return (
      <div style={styles.loadingContainerLight}>
        <div style={{ color: colors.white, fontSize: "20px" }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ backgroundColor: '#2d3f54', padding: '32px 24px 24px 24px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <RobotLogo size={100} />
        </div>

        {/* App name */}
        <h1 style={{ textAlign: 'center', color: 'white', fontSize: '24px', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '4px' }}>
          GAMMABOTS
        </h1>

        {/* Tagline */}
        <p style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '14px', letterSpacing: '0.025em' }}>
          Trading bots. Simplified.
        </p>

        {/* User info bar */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(100, 116, 139, 0.5)' }}>
          <p style={{ color: 'white', fontWeight: '500', textAlign: 'center' }}>
            Welcome, <span style={{ color: '#22d3ee' }}>@{username}</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.contentPadding}>
        {/* Platform Metrics */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <MetricCard label="Active Bots" value={dashboardData.active_bots.toLocaleString()} change={formatPercentageChange(dashboardData.active_bots_change_24h)} />
            <MetricCard label="TVL" value={formatCurrency(dashboardData.tvl)} change={formatPercentageChange(dashboardData.tvl_change_24h)} />
            <MetricCard label="24h Volume" value={formatCurrency(dashboardData.volume_24h)} change={formatPercentageChange(dashboardData.volume_24h_change_24h)} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "12px" }}>
            <div style={{ width: "calc((100% - 24px) / 3)" }}>
              <MetricCard label="Strategies" value={dashboardData.strategies.toLocaleString()} change="" />
            </div>
            <div style={{ width: "calc((100% - 24px) / 3)" }}>
              <MetricCard label="Total Profits" value={formatCurrency(dashboardData.total_profits)} change="" />
            </div>
            <div style={{ width: "calc((100% - 24px) / 3)" }}>
              <MetricCard label="Total Trades" value={dashboardData.trades_executed.toLocaleString()} change="" />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginTop: "16px"
          }}>
            <button
              style={styles.buttonPrimary}
              onClick={() => {
                if (dashboardData.user_exists) {
                  router.push('/my-bots/create')
                } else {
                  setSignUpRedirectTo('/my-bots/create')
                  setSignUpModalOpen(true)
                }
              }}
            >
              Create Bot
            </button>
            {dashboardData.user_exists ? (
              <button
                onClick={handleMyBotsClick}
                disabled={authLoading}
                style={styles.buttonSecondary}
              >
                {authLoading ? "Checking…" : `My Bots (${dashboardData.user_bot_count})`}
              </button>
            ) : (
              <button
                onClick={() => {
                  setSignUpRedirectTo('/my-bots')
                  setSignUpModalOpen(true)
                }}
                style={styles.buttonSecondary}
              >
                Sign Up
              </button>
            )}
          </div>

          {/* Description */}
          <div style={{ marginTop: '7px', padding: '0 12px' }}>
            <p style={{ color: '#4b5563', fontSize: '12px', lineHeight: '1.4' }}>
              Deploy automated trading bots in seconds. Choose a strategy, fund your bot, and let it trade for you.
            </p>
            <p style={{ fontSize: '12px', marginTop: '12px', marginBottom: '8px' }}>
              <a href="#" style={{ color: 'rgba(59, 130, 246, 0.8)' }}>How it works</a>
              <span style={{ color: '#6b7280', margin: '0 8px' }}>·</span>
              <a href="#" style={{ color: 'rgba(59, 130, 246, 0.8)' }}>What is Gammascript?</a>
            </p>
          </div>
        </div>

        {/* Top Performers */}
        {dashboardData.top_performers.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <ActivityCard title={<>Top Performers <span style={{ fontSize: "14px", fontWeight: "500", color: "#8e8e93" }}>30d</span></>}>
              {dashboardData.top_performers.map((performer, index) => {
                const rankColors = ["bg-orange-500", "bg-gray-500", "bg-yellow-600"];
                return (
                  <LeaderboardItem
                    key={index}
                    rank={index + 1}
                    rankColor={rankColors[index] || "bg-blue-500"}
                    botId={performer.bot_id}
                    creator={`@${performer.username}`}
                    strategy={performer.token_symbol}
                    strategyId={performer.strategy_id}
                    profit={`+${performer.performance}%`}
                    avatarUrl={performer.farcaster_avatar_url}
                    onClick={() => {
                      setSelectedBot({
                        bot_id: String(performer.bot_id),
                        token_symbol: performer.token_symbol,
                        token_address: performer.token_address,
                        strategy_id: performer.strategy_id,
                        moving_average: performer.moving_average,
                        profit_percent: parseFloat(performer.performance),
                        owner_farcaster_username: performer.username,
                        status: 'active',
                      })
                      setIsBotModalOpen(true)
                    }}
                  />
                );
              })}
            </ActivityCard>
          </div>
        )}

        {/* Popular Tokens */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#1c1c1e", marginBottom: "16px", padding: "0 4px" }}>Popular Tokens</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {Object.entries(dashboardData.popular_tokens).map(([tokenName, tvl], index) => {
              const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
              return (
                <TokenCard 
                  key={tokenName}
                  name={tokenName} 
                  tvl={`${formatCurrency(tvl)} TVL`} 
                  borderColor={colors[index % colors.length]} 
                />
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ marginBottom: "24px" }}>
          <ActivityCard title="Recent Activity">
            {dashboardData.recent_activity.map((activity, index) => (
              <ActivityItem
                key={index}
                action={activity.action === "Buy" ? "Bought" : "Sold"}
                amount={`${activity.amount.toLocaleString()} ${activity.token_symbol}`}
                strategy={`@${activity.farcaster_username} · ${activity.token_symbol} #${activity.bot_id} · ${activity.time_ago} ago`}
                time=""
                creator=""
                tokenAmount={formatTokenAmount(activity.amount)}
                tokenSymbol={activity.token_symbol}
                avatarUrl={activity.farcaster_avatar_url}
                profit={activity.performance_pct !== null && activity.performance_pct !== undefined ? `${activity.performance_pct > 0 ? '+' : ''}${Number(activity.performance_pct).toFixed(1)}%` : undefined}
                profitPct={activity.performance_pct !== null && activity.performance_pct !== undefined ? activity.performance_pct : undefined}
              />
            ))}
          </ActivityCard>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />

      {/* Debug Info */}
      {authError && (
        <div className="fixed top-16 left-4 right-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200 z-50">
          <p className="text-xs text-yellow-800">Authentication: {authError}</p>
        </div>
      )}
      {error && (
        <div className="fixed top-4 left-4 right-4 p-3 bg-red-100 rounded-lg border border-red-200 z-50">
          <p className="text-xs text-red-700">Error: {error}</p>
        </div>
      )}

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        onSuccess={handleSignUpSuccess}
        redirectTo={signUpRedirectTo}
      />

      {/* Bot Detail Modal */}
      <BotDetailModal
        isOpen={isBotModalOpen}
        onClose={() => {
          setIsBotModalOpen(false)
          setSelectedBot(null)
        }}
        bot={selectedBot}
      />
    </div>
  )
}

// Component helpers
function MetricCard({ label, value, change }: { label: string; value: string; change?: string }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.textSmall}>{label}</div>
      <div style={{ fontSize: "16px", fontWeight: "700", ...styles.textPrimary }}>{value}</div>
      <div style={{ fontSize: "10px", fontWeight: "600", color: getChangeColor(change), height: "12px", lineHeight: "12px" }}>
        {change || "\u00A0"}
      </div>
    </div>
  )
}

function TokenCard({ name, tvl, borderColor }: { name: string; tvl: string; borderColor: string }) {
  const displayName = name.length > 15 ? `${name.slice(0, 15)}...` : name;

  return (
    <div style={{
      ...styles.card,
      textAlign: "center",
      border: `2px solid ${borderColor}`
    }}>
      <div style={{
        fontSize: "14px",
        fontWeight: "700",
        marginBottom: "4px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        ...styles.textPrimary
      }}>{displayName}</div>
      <div style={{ fontSize: "12px", fontWeight: "500", ...styles.textSecondary }}>{tvl}</div>
    </div>
  )
}

function ActivityCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={styles.activityCard}>
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: `1px solid ${colors.background.border}`
      }}>
        <h3 style={styles.heading3}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ActivityItem({ 
  action, 
  amount, 
  strategy, 
  time, 
  creator, 
  profit,
  profitPct,
  tokenAmount,
  tokenSymbol,
  avatarUrl
}: {
  action: string;
  amount: string;
  strategy: string;
  time: string;
  creator: string;
  profit?: string;
  profitPct?: number;
  tokenAmount?: string;
  tokenSymbol?: string;
  avatarUrl?: string;
}) {
  // Use imported utility
  const circleColor = getCircleColor(action);

  return (
    <div style={{
      padding: "16px 20px",
      borderBottom: "1px solid #f2f2f7",
      display: "flex",
      alignItems: "center",
      gap: "16px"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        flexShrink: 0,
        overflow: "hidden"
      }}>
        {avatarUrl ? (
          <img 
            src={avatarUrl.replace('/rectcrop3', '/original')}
            alt={creator}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain"
            }}
            onError={(e) => {
              // Try fallback to original URL if modified URL fails
              const target = e.target as HTMLImageElement;
              if (target.src.includes('/original')) {
                target.src = avatarUrl; // Use original URL
              } else {
                // Final fallback to colored circle
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.style.background = circleColor;
                }
              }
            }}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            background: circleColor
          }}></div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "15px",
          fontWeight: "400",
          marginBottom: "4px",
          whiteSpace: "nowrap",
          ...styles.textPrimary
        }}>
          <span style={{ fontWeight: "600" }}>{action}</span> {tokenAmount && tokenSymbol ? (
            <>
              <span style={{ fontWeight: "500", color: "rgba(28, 28, 30, 0.85)" }}>
                {tokenSymbol.length > 12 ? `${tokenSymbol.slice(0, 12)}...` : tokenSymbol}
              </span> <span style={{ fontSize: "13px", fontWeight: "400", color: "#8e8e93" }}>· {tokenAmount}</span>
            </>
          ) : (
            <span style={{ fontWeight: "600" }}>{amount}</span>
          )}
        </div>
        <div style={{
          fontSize: "11px",
          marginTop: "2px",
          fontWeight: "500",
          ...styles.textSecondary
        }}>
          {time && creator ? `${strategy} • ${time} • ${creator}` : strategy}
        </div>
      </div>
      {profit && (
        <div style={{
          fontSize: "15px",
          fontWeight: "700",
          color: profitPct !== undefined ? (profitPct >= 2 ? "#34c759" : (profitPct <= -2 ? "#ff3b30" : "#8e8e93")) : "#8e8e93"
        }}>
          {profit}
        </div>
      )}
    </div>
  )
}

function LeaderboardItem({
  rank,
  rankColor,
  botId,
  creator,
  strategy,
  strategyId,
  profit,
  avatarUrl,
  onClick
}: {
  rank: number;
  rankColor: string;
  botId: number;
  creator: string;
  strategy: string;
  strategyId: string;
  profit: string;
  avatarUrl?: string;
  onClick?: () => void;
}) {
  // Use imported utility
  const backgroundColor = getRankColor(rankColor);

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        gap: "16px",
        borderBottom: "1px solid #f2f2f7",
        cursor: onClick ? "pointer" : "default"
      }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={creator}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#e5e5ea",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "600",
            color: "#8e8e93"
          }}>
            {creator.charAt(1).toUpperCase()}
          </div>
        )}
        <div style={{
          position: "absolute",
          bottom: "-2px",
          right: "-2px",
          width: "16px",
          height: "16px",
          borderRadius: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "9px",
          fontWeight: "700",
          color: "white",
          background: "#6b7fa3",
          border: "2px solid white"
        }}>
          {rank}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "#1c1c1e",
          marginBottom: "4px"
        }}>
          {strategy} <span style={{ fontSize: "12px", fontWeight: "500", color: "#8e8e93" }}>#{botId}</span>
        </div>
        <div style={{
          fontSize: "11px",
          color: "#8e8e93",
          marginTop: "2px",
          fontWeight: "500"
        }}>
          by {creator} · Strategy #{strategyId}
        </div>
      </div>
      <div style={{
        fontSize: "15px",
        fontWeight: "700",
        color: "#34c759"
      }}>{profit}</div>
    </div>
  )
}

