'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MiniApp() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
    const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
    const [sdkRef, setSdkRef] = useState<any>(null)
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
    last_updated: null as string | null
  })

  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        // First, just show the component works
        setIsReady(true)
        
        // Fetch dashboard metrics data
        try {
          const response = await fetch('/api/dashboard')
          if (response.ok) {
            const data = await response.json()
            setDashboardData(data)
          } else {
            console.warn('Failed to fetch dashboard metrics data')
          }
        } catch (dashboardError) {
          console.warn('Error fetching dashboard data:', dashboardError)
        }
        
        // Then try to load the SDK
        const { sdk } = await import('@farcaster/miniapp-sdk')
        setSdkRef(sdk)
        
        // Check if we're running in a Mini App environment
  const inMiniApp = await sdk.isInMiniApp()
  setIsMiniApp(inMiniApp)

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
        
      } catch (error) {
        console.error('Error initializing Mini App:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
  setIsMiniApp(false) // Restore error fallback
      }
    }

    initializeMiniApp()
  }, [])

  // Require Quick Auth before navigating to /my-bots
  const handleMyBotsClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setAuthError(null)

    if (!sdkRef) {
      setAuthError('Mini App SDK not ready yet.')
      return
    }

    try {
      setAuthLoading(true);

      // ⬇️ getToken returns { token: string }
      const { token } = await sdkRef.quickAuth.getToken();

      if (typeof token !== "string" || token.length === 0) {
        setAuthError("Quick Auth did not return a token.");
        return;
      }

      // Optional debug: peek at the token and payload
      console.log("QA token:", token.slice(0, 20), "…");
      try 
      {
        const [, payloadB64] = token.split(".");
        const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson);
        console.log("QA payload:", payload); // iss, sub (fid), aud, exp, iat
      } catch (e) {
        console.warn("Could not decode token", e);
      }

      router.push("/my-bots");
    } catch (err: any) {
      setAuthError(err?.message || "Quick Auth failed.");
    } finally {
      setAuthLoading(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 to-purple-400">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "420px", margin: "0 auto", background: "#f5f5f5", minHeight: "100vh", position: "relative" }}>
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #00d9ff 0%, #a78bfa 100%)", 
        padding: "32px 20px 20px", 
        textAlign: "center", 
        color: "white", 
        position: "relative", 
        overflow: "hidden", 
        borderRadius: "24px 24px 0 0", 
        marginTop: "16px" 
      }}>
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
          <div style={{ 
            width: "80px", 
            height: "80px", 
            background: "#1e3a8a", 
            borderRadius: "20px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "40px", 
            fontWeight: "900", 
            color: "white", 
            margin: "0 auto 16px", 
            border: "3px solid #3b82f6", 
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)" 
          }}>
            Γ
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.5px" }}>GAMMABOTS</div>
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
      <div style={{ padding: "20px 16px 100px" }}>
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
          <button style={{
            flex: 1,
            padding: "16px 20px",
            borderRadius: "25px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: "700",
            fontSize: "15px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            textAlign: "center",
            background: "#3b82f6",
            color: "white"
          }}>
            Create Bot
          </button>
          <button
            onClick={handleMyBotsClick}
            disabled={authLoading}
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: "25px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "700",
              fontSize: "15px",
              border: "2px solid #3b82f6",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "center",
              background: "white",
              color: "#3b82f6",
              boxSizing: "border-box"
            }}
          >
            {authLoading ? "Checking…" : "My Bots"}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "420px",
        maxWidth: "100vw",
        background: "white",
        borderTop: "1px solid #f2f2f7",
        display: "flex",
        zIndex: 5,
        boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: "20px 20px 0 0"
      }}>
        <NavItem label="HOME" active />
        <NavItem label="MY BOTS" />
        <NavItem label="LEADERBOARD" />
        <NavItem label="STRATEGIES" />
      </div>

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
  // Determine color based on change value
  const getChangeColor = (changeValue?: string) => {
    if (!changeValue || changeValue === "") return "#34c759" // Default green
    if (changeValue.startsWith("-")) return "#ff3b30" // Red for negative
    return "#34c759" // Green for positive
  }

  return (
    <div style={{ 
      background: "white", 
      borderRadius: "16px", 
      padding: "16px 12px", 
      textAlign: "center", 
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", 
      border: "1px solid rgba(0, 0, 0, 0.05)",
      height: "84px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div style={{ fontSize: "11px", color: "#8e8e93", fontWeight: "500" }}>{label}</div>
      <div style={{ fontSize: "16px", fontWeight: "700", color: "#1c1c1e" }}>{value}</div>
      <div style={{ fontSize: "10px", fontWeight: "600", color: getChangeColor(change), height: "12px", lineHeight: "12px" }}>
        {change || "\u00A0"}
      </div>
    </div>
  )
}

function TokenCard({ name, tvl, borderColor }: { name: string; tvl: string; borderColor: string }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      padding: "16px",
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      border: `2px solid ${borderColor}`
    }}>
      <div style={{ 
        fontSize: "14px", 
        fontWeight: "700", 
        color: "#1c1c1e", 
        marginBottom: "4px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }}>{name}</div>
      <div style={{ fontSize: "12px", color: "#8e8e93", fontWeight: "500" }}>{tvl}</div>
    </div>
  )
}

function ActivityCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      marginBottom: "16px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      border: "1px solid rgba(0, 0, 0, 0.05)"
    }}>
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "1px solid #f2f2f7"
      }}>
        <h3 style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#1c1c1e"
        }}>{title}</h3>
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
  // Determine circle color based on action
  const getCircleColor = (action: string) => {
    return action === "Sold" ? "#3b82f6" : "#a855f7"; // Blue for Sold, Purple for Bought
  };

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
                  parent.style.background = getCircleColor(action);
                }
              }
            }}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            background: getCircleColor(action)
          }}></div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "15px",
          fontWeight: "400",
          color: "#1c1c1e",
          marginBottom: "4px"
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
          color: "#8e8e93",
          marginTop: "2px",
          fontWeight: "500"
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
  // Map Tailwind colors to actual hex values
  const getBackgroundColor = (tailwindColor: string) => {
    switch(tailwindColor) {
      case 'bg-orange-500': return '#ff9500';
      case 'bg-gray-500': return '#8e8e93';
      case 'bg-yellow-600': return '#d2691e';
      default: return '#8e8e93';
    }
  };

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
        background: getBackgroundColor(rankColor)
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

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div style={{
      flex: 1,
      padding: "12px 8px 16px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
      color: active ? "#8b5cf6" : "#8e8e93",
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      margin: "8px 4px",
      position: "relative"
    }}>
      {label}
      {active && (
        <div style={{
          content: '',
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "20px",
          height: "3px",
          background: "#8b5cf6",
          borderRadius: "1px"
        }}></div>
      )}
    </div>
  )
}
