'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavigation from './BottomNavigation'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { styles, colors, getChangeColor, getCircleColor, getRankColor } from '@/styles/common'

export default function MiniApp() {
  const router = useRouter()
  const { authLoading, authError, authenticate, navigateToMyBots } = useQuickAuth()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sdkRef, setSdkRef] = useState<typeof import('@farcaster/miniapp-sdk').sdk | null>(null)
  const [username, setUsername] = useState<string>('guest') // Default fallback for development
  
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
      performance: string;
    }>,
    user_bot_count: 0,
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
          await fetchDashboardData(token)
        }
        
      } catch (error) {
        console.error('Error initializing Mini App:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      }
    }


    // Function to fetch dashboard data with auth token
    async function fetchDashboardData(token: string) {
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

    initializeMiniApp()
  }, [])

  const handleMyBotsClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    await navigateToMyBots()
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
      {/* Hero Section */}
      <div style={styles.heroGradient}>
        {/* Decorative elements */}
        <div style={{ 
          content: '', 
          position: 'absolute', 
          top: '-20px', 
          right: '-20px', 
          width: '80px', 
          height: '80px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '20px', 
          transform: 'rotate(45deg)' 
        }}></div>
        <div style={{ 
          content: '', 
          position: 'absolute', 
          bottom: '-15px', 
          left: '-15px', 
          width: '60px', 
          height: '60px', 
          background: 'rgba(255, 255, 255, 0.08)', 
          borderRadius: '15px', 
          transform: 'rotate(45deg)' 
        }}></div>
        
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={styles.logo}>
            Γ
          </div>
          <div style={styles.heading1}>GAMMABOTS</div>
          <div style={{ fontSize: "16px", fontWeight: "500", opacity: "0.9" }}>Trading Bots Made Easy</div>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", position: "relative", zIndex: 2 }}>
          <div style={{ 
            fontSize: "14px", 
            fontWeight: "600", 
            color: "white",
            maxWidth: "60%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>Welcome, @{username}</div>
          <div style={{ fontSize: "12px", fontWeight: "500", color: "#ffffff" }}>
            Balance: <span style={{ fontWeight: "700", fontSize: "14px" }}>2200 GAMMA</span>
          </div>
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
        </div>

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
                strategy={`Bot #${activity.bot_id} by @${activity.farcaster_username} • ${activity.time_ago} ago`}
                time=""
                creator=""
                tokenAmount={activity.amount.toLocaleString()}
                tokenSymbol={activity.token_symbol}
                avatarUrl={activity.farcaster_avatar_url}
                profit={activity.performance_pct !== null && activity.performance_pct !== undefined ? `${activity.performance_pct > 0 ? '+' : ''}${Number(activity.performance_pct).toFixed(1)}%` : undefined}
                isProfit={activity.performance_pct !== null && activity.performance_pct !== undefined ? activity.performance_pct > 0 : undefined}
              />
            ))}
          </ActivityCard>

          {/* Leaderboard */}
          {dashboardData.top_performers.length > 0 && (
            <ActivityCard title="Top Performers (7d)">
              {dashboardData.top_performers.map((performer, index) => {
                const rankColors = ["bg-orange-500", "bg-gray-500", "bg-yellow-600"];
                return (
                  <LeaderboardItem
                    key={index}
                    rank={index + 1}
                    rankColor={rankColors[index] || "bg-blue-500"}
                    botName={`Bot #${performer.bot_id}`}
                    creator={`@${performer.username}`}
                    strategy={performer.token_symbol}
                    profit={`+${performer.performance}%`}
                  />
                );
              })}
            </ActivityCard>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginTop: "20px"
        }}>
          <button 
            style={styles.buttonPrimary}
            onClick={() => router.push('/my-bots/create')}
          >
            Create Bot
          </button>
          <button
            onClick={handleMyBotsClick}
            disabled={authLoading}
            style={styles.buttonSecondary}
          >
            {authLoading ? "Checking…" : `My Bots${dashboardData.user_bot_count > 0 ? ` (${dashboardData.user_bot_count})` : ""}`}
          </button>
        </div>
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
      }}>{name}</div>
      <div style={{ fontSize: "12px", fontWeight: "500", ...styles.textSecondary }}>{tvl}</div>
    </div>
  )
}

function ActivityCard({ title, children }: { title: string; children: React.ReactNode }) {
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
  isProfit,
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
  isProfit?: boolean;
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
          ...styles.textPrimary
        }}>
          {action} {tokenAmount && tokenSymbol ? (
            <>
              {tokenAmount} <span style={{ fontWeight: "700" }}>{tokenSymbol}</span>
            </>
          ) : (
            <span style={{ fontWeight: "700" }}>{amount}</span>
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
          color: isProfit ? "#34c759" : "#ff3b30"
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
  botName, 
  creator, 
  strategy, 
  profit 
}: { 
  rank: number; 
  rankColor: string; 
  botName: string; 
  creator: string; 
  strategy: string; 
  profit: string;
}) {
  // Use imported utility
  const backgroundColor = getRankColor(rankColor);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "16px 20px",
      gap: "16px",
      borderBottom: "1px solid #f2f2f7"
    }}>
      <div style={{
        width: "32px",
        height: "32px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "700",
        color: "white",
        flexShrink: 0,
        background: backgroundColor
      }}>
        {rank}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "#1c1c1e",
          marginBottom: "4px"
        }}>{botName}</div>
        <div style={{
          fontSize: "11px",
          color: "#8e8e93",
          marginTop: "2px",
          fontWeight: "500"
        }}>
          by {creator} • {strategy}
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

