'use client'

import { useEffect, useState } from 'react'

export default function MiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('guest') // Default fallback for development

  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        // First, just show the component works
        setIsReady(true)
        
        // Then try to load the SDK
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
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
        setIsMiniApp(false) // Assume we're not in a Mini App if there's an error
      }
    }

    initializeMiniApp()
  }, [])

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
            <MetricCard label="Active Bots" value="1,247" change="+12%" />
            <MetricCard label="TVL" value="$1.2M" change="+5.2%" />
            <MetricCard label="24h Volume" value="$892K" change="+15.3%" />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "12px" }}>
            <div style={{ width: "calc((100% - 24px) / 3)" }}>
              <MetricCard label="Strategies" value="1,847" change="+18%" />
            </div>
            <div style={{ width: "calc((100% - 24px) / 3)" }}>
              <MetricCard label="Total Profits" value="$284K" change="+8.5%" />
            </div>
            <div style={{ width: "calc((100% - 24px) / 3)" }}>
              <MetricCard label="Win Rate" value="73.2%" />
            </div>
          </div>
        </div>

        {/* Popular Tokens */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#1c1c1e", marginBottom: "16px", padding: "0 4px" }}>Popular Tokens</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <TokenCard name="DEGEN" tvl="$47K TVL" borderColor="#3b82f6" />
            <TokenCard name="HIGHER" tvl="$32K TVL" borderColor="#10b981" />
            <TokenCard name="ENJOY" tvl="$28K TVL" borderColor="#f59e0b" />
            <TokenCard name="TN100X" tvl="$19K TVL" borderColor="#ef4444" />
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ marginBottom: "24px" }}>
          <ActivityCard title="Recent Bot Activity">
            <ActivityItem
              action="Sold"
              amount="700K DEGEN"
              strategy="Strategy #1847"
              time="2m ago"
              creator="@crypto_mike"
              profit="+15.4%"
              isProfit={true}
            />
            <ActivityItem
              action="Bought"
              amount="1.2M HIGHER"
              strategy="Strategy #924"
              time="5m ago"
              creator="@tradingpro"
            />
            <ActivityItem
              action="Sold"
              amount="450K ENJOY"
              strategy="Strategy #623"
              time="8m ago"
              creator="@aitrader"
              profit="-3.1%"
              isProfit={false}
            />
            <ActivityItem
              action="Bought"
              amount="2.1M TN100X"
              strategy="Strategy #1205"
              time="12m ago"
              creator="@moonshot"
            />
          </ActivityCard>

          {/* Leaderboard */}
          <ActivityCard title="Top Performers (24h)">
            <LeaderboardItem
              rank={1}
              rankColor="bg-orange-500"
              botName="Bot #7429"
              creator="@cryptoking"
              strategy="Strategy #1847"
              profit="+47.3%"
            />
            <LeaderboardItem
              rank={2}
              rankColor="bg-gray-500"
              botName="Bot #3815"
              creator="@degenerate"
              strategy="Strategy #924"
              profit="+31.8%"
            />
            <LeaderboardItem
              rank={3}
              rankColor="bg-yellow-600"
              botName="Bot #9204"
              creator="@aidev"
              strategy="Strategy #623"
              profit="+22.9%"
            />
          </ActivityCard>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginTop: "20px"
        }}>
          <button style={{
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
          <button style={{
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
            color: "#3b82f6"
          }}>
            My Bots (0)
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
      <div style={{ fontSize: "10px", fontWeight: "600", color: "#34c759", height: "12px", lineHeight: "12px" }}>
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
      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1c1c1e", marginBottom: "4px" }}>{name}</div>
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
  isProfit 
}: { 
  action: string; 
  amount: string; 
  strategy: string; 
  time: string; 
  creator: string; 
  profit?: string; 
  isProfit?: boolean;
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
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: getCircleColor(action),
        flexShrink: 0
      }}></div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "15px",
          fontWeight: "400",
          color: "#1c1c1e",
          marginBottom: "4px"
        }}>
          {action} <span style={{ fontWeight: "700" }}>{amount}</span>
        </div>
        <div style={{
          fontSize: "11px",
          color: "#8e8e93",
          marginTop: "2px",
          fontWeight: "500"
        }}>
          {strategy} • {time} • {creator}
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
